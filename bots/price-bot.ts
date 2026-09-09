import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { database } from '@/lib/server/db';
import { getPrices, applyImport, rollbackPrices } from '@/lib/server/prices';
import {
  inspectPriceWorkbook,
  type ImportReport,
} from '@/lib/server/price-import';
import { Telegram, type TelegramUpdate } from '@/lib/server/telegram';

export function isPriceAdmin(id: number | undefined) {
  return (
    id !== undefined &&
    (process.env.TELEGRAM_PRICE_ADMIN_IDS ?? '')
      .split(',')
      .map((v) => v.trim())
      .includes(String(id))
  );
}
export function reportText(report: ImportReport) {
  return [
    `Сопоставлено вариантов: ${report.matched}. Изменится: ${report.changes.length}. Без изменений: ${report.unchanged}.`,
    ...report.changes.map(
      (c) =>
        `${c.source}: ${c.name}\n${c.id}: ${c.before ?? 'не задана'} → ${c.after} ₽`,
    ),
    '\nПРЕДУПРЕЖДЕНИЯ',
    ...report.warnings,
    '\nОШИБКИ',
    ...report.errors,
  ].join('\n');
}
export async function handlePriceUpdate(bot: Telegram, update: TelegramUpdate) {
  const callback = update.callback_query;
  const message = callback?.message ?? update.message;
  const user = callback?.from.id ?? update.message?.from?.id;
  if (!message) return;
  if (!isPriceAdmin(user) || message.chat.type !== 'private') {
    if (callback)
      await bot.call('answerCallbackQuery', {
        callback_query_id: callback.id,
        text: 'Нет доступа.',
      });
    else if (update.message?.text?.startsWith('/start'))
      await bot.send(
        message.chat.id,
        `Бот обновления цен APPGRADE. Доступ выдаёт владелец. Ваш Telegram ID: ${user ?? 'не определён'}.`,
      );
    return;
  }
  const owner = String(user),
    chat = String(message.chat.id);
  if (callback) {
    await bot.call('answerCallbackQuery', { callback_query_id: callback.id });
    const [action, id] = (callback.data ?? '').split(':');
    if (!/^[0-9a-f-]{36}$/i.test(id ?? '')) return;
    let result: string;
    try {
      if (action === 'apply') result = await applyImport(id, owner, chat);
      else if (action === 'rollback') result = await rollbackPrices(id, owner);
      else if (action === 'cancel') {
        const cancelled = await database().query(
          "UPDATE appgrade_imports SET status='cancelled' WHERE id=$1 AND owner_id=$2 AND chat_id=$3 AND status='pending' RETURNING id",
          [id, owner, chat],
        );
        result = cancelled.rows.length
          ? 'Загрузка отменена. Цены не менялись.'
          : 'Эта загрузка уже обработана. Для отката цен используйте /rollback.';
      } else return;
    } catch (error) {
      // Only business validation errors are suitable for this private admin chat.
      result =
        error instanceof Error && /[А-Яа-я]/.test(error.message)
          ? error.message
          : 'Не удалось выполнить действие. Попробуйте ещё раз.';
    }
    await bot.send(chat, result);
    return;
  }
  const input = update.message!;
  if (input.text === '/rollback') {
    const snapshot = await getPrices();
    if (snapshot.revision === 'initial') {
      await bot.send(chat, 'Пока нет обновлений для отката.');
      return;
    }
    await bot.send(chat, 'Восстановить цены перед последним обновлением?', [
      [
        {
          text: 'Восстановить цены',
          callback_data: `rollback:${snapshot.revision}`,
        },
      ],
    ]);
    return;
  }
  if (!input.document) {
    await bot.send(
      chat,
      'Отправьте Excel (.xlsx) с прайсом. Сначала проверю изменения и пришлю отчёт. Цены изменятся только после «Применить цены».\n/rollback — откат последнего изменения.',
    );
    return;
  }
  const document = input.document;
  if (
    !document.file_name?.toLowerCase().endsWith('.xlsx') ||
    (document.file_size ?? 0) > 10 * 1024 * 1024
  ) {
    await bot.send(chat, 'Нужен файл .xlsx размером до 10 МБ.');
    return;
  }
  let draft = (
    await database().query(
      'SELECT * FROM appgrade_imports WHERE update_id=$1',
      [update.update_id],
    )
  ).rows[0];
  if (!draft) {
    const buffer = await bot.download(document.file_id);
    const snapshot = await getPrices();
    let report: ImportReport;
    try {
      report = await inspectPriceWorkbook(buffer, snapshot.prices);
    } catch {
      await bot.send(
        chat,
        'Не удалось разобрать Excel. Проверьте, что это обычный .xlsx без пароля, и отправьте снова.',
      );
      return;
    }
    const id = randomUUID();
    const directory = path.resolve(
      process.env.PRICE_UPLOAD_DIR || 'var/price-uploads',
    );
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(path.join(directory, `${id}.xlsx`), buffer, {
      mode: 0o600,
      flag: 'wx',
    });
    const { rows } = await database().query(
      `INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        id,
        update.update_id,
        owner,
        chat,
        document.file_name.slice(0, 200),
        createHash('sha256').update(buffer).digest('hex'),
        snapshot.revision,
        JSON.stringify(report),
      ],
    );
    draft = rows[0];
  }
  const report = draft.report as ImportReport;
  await bot.sendReport(chat, reportText(report));
  const canApply =
    !report.errors.length &&
    report.changes.length > 0 &&
    draft.status === 'pending';
  await bot.send(
    chat,
    `Проверка завершена.\nСопоставлено вариантов: ${report.matched}\nИзменится цен: ${report.changes.length}\nБез изменений: ${report.unchanged}\nПредупреждений: ${report.warnings.length}\nОшибок: ${report.errors.length}\n\n${report.errors.length ? 'Исправьте ошибки и загрузите файл заново.' : canApply ? 'Проверьте приложенный отчёт перед применением.' : 'Применять нечего.'}`,
    canApply
      ? [
          [
            { text: 'Применить цены', callback_data: `apply:${draft.id}` },
            { text: 'Отмена', callback_data: `cancel:${draft.id}` },
          ],
        ]
      : undefined,
  );
}
