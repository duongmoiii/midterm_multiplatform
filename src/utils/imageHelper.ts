import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Firestore giới hạn 1 MiB (~1,048,576 bytes) cho mỗi document.
// Giới hạn độ dài Data URI dưới 750 KB để lưu trữ an toàn cùng 3 trường còn lại.
const MAX_DATA_URI_LENGTH = 750_000;

async function compressToDataUri(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 320 });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    compress: 0.6,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) {
    throw new Error('Không thể chuyển đổi hình ảnh sang định dạng Base64.');
  }

  const dataUri = `data:image/jpeg;base64,${result.base64}`;
  if (dataUri.length > MAX_DATA_URI_LENGTH) {
    // Nén thêm một mức nếu ảnh có kích thước pixel dọc quá lớn
    const fallbackContext = ImageManipulator.manipulate(uri);
    fallbackContext.resize({ width: 220 });
    const fallbackRendered = await fallbackContext.renderAsync();
    const fallbackResult = await fallbackRendered.saveAsync({
      compress: 0.45,
      format: SaveFormat.JPEG,
      base64: true,
    });
    if (!fallbackResult.base64) {
      throw new Error('Không thể nén ảnh xuống kích thước phù hợp.');
    }
    const smallerDataUri = `data:image/jpeg;base64,${fallbackResult.base64}`;
    if (smallerDataUri.length > MAX_DATA_URI_LENGTH) {
      throw new Error(
        'Ảnh vượt quá dung lượng cho phép của Firestore. Vui lòng chọn ảnh khác hoặc dán URL.'
      );
    }
    return smallerDataUri;
  }

  return dataUri;
}

export async function pickImageFromLibrary(): Promise<string | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error(
        'Bạn chưa cấp quyền truy cập Thư viện ảnh. Vui lòng bật quyền trong cài đặt.'
      );
    }
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (pickerResult.canceled || !pickerResult.assets?.[0]) {
    return null;
  }

  return compressToDataUri(pickerResult.assets[0].uri);
}

export async function takePhotoWithCamera(): Promise<string | null> {
  if (Platform.OS === 'web') {
    throw new Error(
      'Chụp ảnh Camera trực tiếp hỗ trợ tốt nhất trên ứng dụng di động Expo Go.'
    );
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      'Bạn chưa cấp quyền sử dụng Camera. Vui lòng bật quyền trong cài đặt.'
    );
  }

  const cameraResult = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (cameraResult.canceled || !cameraResult.assets?.[0]) {
    return null;
  }

  return compressToDataUri(cameraResult.assets[0].uri);
}
