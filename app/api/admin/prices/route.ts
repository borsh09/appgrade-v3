import { randomUUID, createHash } from 'node:crypto';
import { assertAdmin } from '@/lib/server/admin';
import { assertOrigin } from '@/lib/server/request-guard';
import { OrderError } from '@/lib/server/orders';
import { database } from '@/lib/server/db';
import { getPrices, applyImport, rollbackPrices } from '@/lib/server/prices';
import { inspectPriceWorkbook } from '@/lib/server/price-import';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const fail = (error: unknown) => reply({ error: error instanceof Error ? error.message : 'Не удалось обработать прайс.' }, error instanceof OrderError ? error.status : 400);
export async function POST(request: Request) {
  try {
    assertAdmin(request); assertOrigin(request);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx')) throw new OrderError('Выберите файл Excel в формате .xlsx.');
    // Keep the complete multipart request below Vercel Functions' 4.5 MB limit.
    if (file.size > 4 * 1024 * 1024) throw new OrderError('Файл должен быть не больше 4 МБ.', 413);
    const buffer = Buffer.from(await file.arrayBuffer());
    const snapshot = await getPrices();
    const report = await inspectPriceWorkbook(buffer, snapshot.prices);
    const id = randomUUID();
    // Persist the parsed report in PostgreSQL. applyImport does not need the
    // source file, so the flow works on hosts with an ephemeral filesystem.
    await database().query(`INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report) VALUES($1,$2,'admin','admin',$3,$4,$5,$6)`, [id, -Date.now(), file.name.slice(0, 200), createHash('sha256').update(buffer).digest('hex'), snapshot.revision, JSON.stringify(report)]);
    return reply({ id, filename: file.name, report });
  } catch (error) { return fail(error); }
}
export async function PATCH(request: Request) {
  try {
    assertAdmin(request); assertOrigin(request);
    const body = await request.json() as { action?: string; id?: string };
    if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) throw new OrderError('Некорректная версия прайса.');
    let message: string;
    if (body.action === 'apply') message = await applyImport(body.id, 'admin', 'admin');
    else if (body.action === 'rollback') message = await rollbackPrices(body.id, 'admin');
    else throw new OrderError('Неизвестная операция.');
    return reply({ success: true, message });
  } catch (error) { return fail(error); }
}
