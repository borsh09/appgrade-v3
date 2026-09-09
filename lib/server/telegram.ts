export type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: { id: number; type: string };
    from?: { id: number };
    text?: string;
    document?: { file_id: string; file_name?: string; file_size?: number };
  };
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { chat: { id: number; type: string } };
  };
};
export class Telegram {
  token: string;
  constructor(token: string) {
    this.token = token;
  }
  async call<T = unknown>(method: string, body: object): Promise<T> {
    const response = await fetch(
      `https://api.telegram.org/bot${this.token}/${method}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(40_000),
      },
    );
    const data = await response.json();
    if (!response.ok || !data.ok)
      throw new Error(
        `Telegram ${method}: ${data.error_code ?? response.status}`,
      );
    return data.result as T;
  }
  send(
    chat: string | number,
    text: string,
    buttons?: { text: string; callback_data: string }[][],
  ) {
    return this.call('sendMessage', {
      chat_id: chat,
      text,
      ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
  }
  async sendReport(chat: string | number, content: string) {
    const form = new FormData();
    form.set('chat_id', String(chat));
    form.set(
      'document',
      new Blob([content], { type: 'text/plain;charset=utf-8' }),
      'price-report.txt',
    );
    const response = await fetch(
      `https://api.telegram.org/bot${this.token}/sendDocument`,
      { method: 'POST', body: form, signal: AbortSignal.timeout(40_000) },
    );
    const data = await response.json();
    if (!response.ok || !data.ok)
      throw new Error('Telegram report upload failed');
  }
  async download(fileId: string) {
    const file = await this.call<{ file_path: string; file_size?: number }>(
      'getFile',
      { file_id: fileId },
    );
    if (file.file_size && file.file_size > 10 * 1024 * 1024)
      throw new Error('Файл больше 10 МБ.');
    const response = await fetch(
      `https://api.telegram.org/file/bot${this.token}/${file.file_path}`,
      { signal: AbortSignal.timeout(40_000) },
    );
    if (!response.ok || !response.body)
      throw new Error('Не удалось скачать файл.');
    const reader = response.body.getReader(),
      chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 10 * 1024 * 1024) {
        await reader.cancel();
        throw new Error('Файл больше 10 МБ.');
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }
}
