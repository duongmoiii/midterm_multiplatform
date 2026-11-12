import {
  GiangVien,
  fromFirestoreGiangVien,
  toFirestoreGiangVien,
} from '../types/giangVien';

export function serializeGiangVienJson(items: GiangVien[]): string {
  const strictItems = items.map((item) => toFirestoreGiangVien(item));
  return JSON.stringify(strictItems, null, 2);
}

export function parseGiangVienJson(rawJson: string): GiangVien[] {
  const parsed: unknown = JSON.parse(rawJson);
  if (!Array.isArray(parsed)) {
    throw new Error('File JSON phải là một mảng danh sách giảng viên.');
  }

  return parsed.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`Phần tử tại vị trí ${index} không hợp lệ.`);
    }
    return fromFirestoreGiangVien(entry as Record<string, unknown>);
  });
}
