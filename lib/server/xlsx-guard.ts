import { OrderError } from './orders';

const MAX_ENTRIES = 1000;
const MAX_EXPANDED_BYTES = 50 * 1024 * 1024;

export function assertSafeWorkbookArchive(buffer: Buffer) {
  const invalid = () => new OrderError('Некорректный или слишком большой файл Excel.', 400);
  if (buffer.length < 22) throw invalid();

  let end = -1;
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 65557); offset--) {
    if (buffer.readUInt32LE(offset) === 0x06054b50 && offset + 22 + buffer.readUInt16LE(offset + 20) === buffer.length) {
      end = offset;
      break;
    }
  }
  if (end < 0 || buffer.readUInt16LE(end + 4) !== 0 || buffer.readUInt16LE(end + 6) !== 0) throw invalid();

  const entries = buffer.readUInt16LE(end + 10);
  const directorySize = buffer.readUInt32LE(end + 12);
  const directoryOffset = buffer.readUInt32LE(end + 16);
  if (entries === 0 || entries > MAX_ENTRIES || entries === 0xffff || directorySize === 0xffffffff || directoryOffset === 0xffffffff || directoryOffset + directorySize > end) throw invalid();

  let cursor = directoryOffset;
  let expanded = 0;
  for (let index = 0; index < entries; index++) {
    if (cursor + 46 > end || buffer.readUInt32LE(cursor) !== 0x02014b50) throw invalid();
    const flags = buffer.readUInt16LE(cursor + 8);
    const compression = buffer.readUInt16LE(cursor + 10);
    const expandedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    if ((flags & 1) !== 0 || ![0, 8].includes(compression) || expandedSize === 0xffffffff) throw invalid();
    expanded += expandedSize;
    if (expanded > MAX_EXPANDED_BYTES) throw invalid();
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (cursor !== directoryOffset + directorySize) throw invalid();
}
