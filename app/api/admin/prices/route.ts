import { randomUUID, createHash } from 'node:crypto';
import { assertAdmin } from '@/lib/server/admin';
import { assertOrigin, readFormData, readJson } from '@/lib/server/request-guard';
import { OrderError } from '@/lib/server/orders';
import { database } from '@/lib/server/db';
import { getPrices, applyImport, rollbackPrices } from '@/lib/server/prices';
import { inspectPriceWorkbook } from '@/lib/server/price-import';
import { CITIES } from '@/config/cities';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const fail = (error: unknown) => reply({ error: error instanceof OrderError ? error.message : 'Не удалось обработать прайс. Попробуйте ещё раз.' }, error instanceof OrderError ? error.status : 503);
export async function POST(request: Request) {
  try {
    assertAdmin(request); assertOrigin(request);
    if (!process.env.DATABASE_URL) throw new OrderError('Импорт через админку недоступен: база PostgreSQL не подключена (DATABASE_URL).', 503);
    const form = await readFormData(request, 4 * 1024 * 1024 + 32 * 1024);
    const file = form.get('file');
    let targetCities: string[] = [];
    const citiesValue = form.get('cities');
    if (typeof citiesValue === 'string' && citiesValue.trim()) {
      let parsed: unknown;
      try { parsed = JSON.parse(citiesValue); }
      catch { throw new OrderError('Выберите корректные города для прайса.'); }
      if (!Array.isArray(parsed) || parsed.length > Object.keys(CITIES).length || parsed.some((city) => typeof city !== 'string' || !Object.hasOwn(CITIES, city)))
        throw new OrderError('Выберите корректные города для прайса.');
      targetCities = [...new Set(parsed)];
    }
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx')) throw new OrderError('Выберите файл Excel в формате .xlsx.');
    // Keep the complete multipart request below Vercel Functions' 4.5 MB limit.
    if (file.size > 4 * 1024 * 1024) throw new OrderError('Файл должен быть не больше 4 МБ.', 413);
    const buffer = Buffer.from(await file.arrayBuffer());
    const snapshot = await getPrices();
    const articleLinks = await database().query('SELECT article,sku FROM appgrade_product_articles');
    const articleMap = Object.fromEntries(articleLinks.rows.map((row) => [row.article as string, row.sku as string]));
    const report = await inspectPriceWorkbook(buffer, snapshot.prices, targetCities.length
      ? { cities: targetCities, cityPrices: snapshot.cityPrices ?? {} }
      : undefined, articleMap);
    const id = randomUUID();
    // Persist the parsed report in PostgreSQL. applyImport does not need the
    // source file, so the flow works on hosts with an ephemeral filesystem.
    const updateId = -BigInt(1) - BigInt(`0x${id.replaceAll('-', '').slice(0, 15)}`);
    await database().query(`INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report,target_cities) VALUES($1,$2,'admin','admin',$3,$4,$5,$6,$7)`, [id, updateId.toString(), file.name.slice(0, 200), createHash('sha256').update(buffer).digest('hex'), snapshot.revision, JSON.stringify(report), targetCities]);
    return reply({ id, filename: file.name, report, targetCities });
  } catch (error) { return fail(error); }
}
export async function PATCH(request: Request) {
  try {
    assertAdmin(request); assertOrigin(request);
    if (!process.env.DATABASE_URL) throw new OrderError('Импорт через админку недоступен: база PostgreSQL не подключена (DATABASE_URL).', 503);
    const body = await readJson(request, 4096) as { action?: string; id?: string };
    if (!body || typeof body !== 'object' || !body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) throw new OrderError('Некорректная версия прайса.');
    let message: string;
    if (body.action === 'apply') message = await applyImport(body.id, 'admin', 'admin');
    else if (body.action === 'rollback') message = await rollbackPrices(body.id, 'admin');
    else throw new OrderError('Неизвестная операция.');
    return reply({ success: true, message });
  } catch (error) { return fail(error); }
}
