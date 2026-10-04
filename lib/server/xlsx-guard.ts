import { OrderError } from './orders';
import { inflateRawSync } from 'node:zlib';

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
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const expandedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    if ((flags & 1) !== 0 || ![0, 8].includes(compression) || expandedSize === 0xffffffff || compressedSize === 0xffffffff) throw invalid();
    expanded += expandedSize;
    if (expanded > MAX_EXPANDED_BYTES) throw invalid();
    // ZIP directory sizes are untrusted. Check the actual data before JSZip or
    // ExcelJS can allocate an unbounded decompressed buffer.
    if (localOffset + 30 > directoryOffset || buffer.readUInt32LE(localOffset) !== 0x04034b50
      || buffer.readUInt16LE(localOffset + 6) !== flags || buffer.readUInt16LE(localOffset + 8) !== compression) throw invalid();
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    if (start + compressedSize > directoryOffset || localNameLength !== nameLength
      || !buffer.subarray(localOffset + 30, localOffset + 30 + localNameLength).equals(buffer.subarray(cursor + 46, cursor + 46 + nameLength))) throw invalid();
    const compressed = buffer.subarray(start, start + compressedSize);
    try {
      const actualSize = compression === 0 ? compressed.length
        : inflateRawSync(compressed, { maxOutputLength: Math.max(1, expandedSize) }).length;
      if (actualSize !== expandedSize) throw invalid();
    } catch { throw invalid(); }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (cursor !== directoryOffset + directorySize) throw invalid();
}
