import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { GiangVien } from '../types/giangVien';
import { serializeGiangVienJson } from './jsonSerializer';

export { serializeGiangVienJson } from './jsonSerializer';

export async function exportGiangVienJson(
  items: GiangVien[]
): Promise<{ count: number; method: 'download' | 'share' }> {
  const jsonContent = serializeGiangVienJson(items);

  if (Platform.OS === 'web') {
    if (
      typeof document === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof Blob === 'undefined'
    ) {
      throw new Error('Trình duyệt hiện tại không hỗ trợ tải file JSON.');
    }

    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GiangVien.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { count: items.length, method: 'download' };
  }

  const file = new File(Paths.cache, 'GiangVien.json');
  file.create({ overwrite: true });
  await file.write(jsonContent);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Thiết bị không hỗ trợ hộp thoại chia sẻ file.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Xuất file cơ sở dữ liệu GiangVien.json',
    UTI: 'public.json',
  });

  return { count: items.length, method: 'share' };
}
