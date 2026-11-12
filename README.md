# Quản lý Giảng viên (`QLHocPhan` / Collection `GiangVien`) — React Native Expo & Firestore

Ứng dụng quản lý giảng viên phân hệ Admin xây dựng bằng **React Native (Expo SDK 58)**, chạy đồng thời trên **Web** (`npx expo start --web`) và **Di động qua Expo Go** (`npx expo start`), sử dụng cơ sở dữ liệu **Cloud Firestore** và xác thực **Firebase Authentication**.

---

## 1. Cấu trúc dữ liệu Firestore (Tuân thủ đúng 4 trường)

- **Firebase Project**: `QLHocPhan` (sử dụng database `(default)` trên gói Spark miễn phí, hoặc tùy chọn Named Database `EXPO_PUBLIC_FIREBASE_DATABASE_ID` nếu dùng gói Blaze).
- **Collection**: `GiangVien`
- **Document ID**: chính là `IDGV`
- **Các trường trong mỗi document (tuyệt đối không thêm trường thừa)**:
  - `IDGV` (`string`): Mã giảng viên
  - `Fullname` (`string`): Họ và tên giảng viên
  - `Image` (`string`): URL ảnh (`https://...`) hoặc ảnh tải lên nén Base64 (`data:image/jpeg;base64,...`)
  - `SumClass` (`number`): Tổng số lớp (số nguyên `>= 0`)

File cơ sở dữ liệu JSON mẫu đi kèm: [`database/GiangVien.json`](./database/GiangVien.json).

---

## 2. Lệnh khởi tạo & cài đặt thư viện

```bash
# 1. Khởi tạo dự án Expo TypeScript
npx create-expo-app@latest . --template blank-typescript

# 2. Cài đặt Firebase JS SDK & các module Expo tương thích Expo Go + Web
npx expo install firebase @react-native-async-storage/async-storage react-native-web react-dom @expo/metro-runtime expo-image-picker expo-image-manipulator expo-file-system expo-sharing react-native-safe-area-context @expo/vector-icons

# 3. Cài đặt thư viện kiểm thử unit test (devDependencies)
npx expo install --dev jest ts-jest @types/jest
```

---

## 3. Hướng dẫn cấu hình Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/) và tạo project mới tên **`QLHocPhan`**.
2. Vào **Build -> Firestore Database -> Create database**:
   - Chọn **Start in test mode** (hoặc dán nội dung file [`firestore.rules`](./firestore.rules) vào tab **Rules** rồi bấm **Publish** để vừa bảo mật yêu cầu đăng nhập Admin vừa kiểm tra nghiêm ngặt đúng 4 trường `IDGV`, `Fullname`, `Image`, `SumClass`).
3. Vào **Build -> Authentication -> Get started -> Sign-in method**:
   - Bật nhà cung cấp **Email/Password**.
   - Có thể tạo sẵn tài khoản Admin tại tab **Users** (hoặc đăng ký trực tiếp ở tab **Tạo tài khoản Admin** ngay trong màn hình đăng nhập của app).
4. Vào **Project Settings (biểu tượng bánh răng) -> General -> Your apps -> chọn Web (`</>`)**:
   - Đăng ký Web App, copy các thông số `firebaseConfig`.
5. Tạo file `.env` từ mẫu `.env.example`:

```bash
cp .env.example .env
```

Điền đầy đủ giá trị vào `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_DATABASE_ID=
```

---

## 4. Hướng dẫn chạy ứng dụng

### Chạy trên nền tảng Web
```bash
npx expo start --web
```
Mở trình duyệt tại địa chỉ terminal hiển thị (mặc định `http://localhost:8081`).

### Chạy trên nền tảng Di động (Expo Go)
```bash
npx expo start -c
```
- Mở ứng dụng **Expo Go** trên iOS / Android và quét mã QR (điện thoại và máy tính dùng chung mạng Wi-Fi, hoặc chạy `npx expo start --tunnel`).
- Trên điện thoại, bạn có thể bấm **Chọn ảnh** (Thư viện) hoặc **Chụp ảnh** (Camera) để nhập hình ảnh giảng viên và xem đồng bộ realtime lên trình duyệt Web.

---

## 5. Chức năng đã triển khai

- **Đăng nhập / Tạo tài khoản Admin**: Sử dụng Firebase Authentication (tách biệt hoàn toàn khỏi collection `GiangVien`).
- **CRUD Giảng viên realtime (`onSnapshot`)**:
  - Thêm mới (`IDGV`, `Fullname`, `Image`, `SumClass`), kiểm tra trùng `IDGV`.
  - Hiển thị dạng bảng quản trị trên **Web** và dạng thẻ tối ưu cảm ứng trên **Mobile**.
  - Xem chi tiết thông tin & ảnh đại diện giảng viên.
  - Sửa thông tin giảng viên (hỗ trợ cả đổi `IDGV` an toàn qua `writeBatch`).
  - Xóa giảng viên với hộp thoại xác nhận đồng nhất trên cả Web và Mobile.
- **Nhập hình ảnh đa nền tảng**: Chọn ảnh từ thư viện / máy tính, chụp ảnh Camera trên Expo Go, tự động resize & nén JPEG Base64 (hoạt động miễn phí trên gói Spark không cần Firebase Storage), hoặc dán URL ảnh.
- **Chức năng nâng cao**:
  - Thống kê nhanh: Tổng giảng viên, Tổng số lớp, Trung bình lớp/GV, Giảng viên nhiều lớp nhất.
  - Tìm kiếm theo `IDGV` hoặc `Fullname`, lọc theo số lớp, sắp xếp tăng/giảm.

---

## 6. Kiểm thử & Build

```bash
# Kiểm tra TypeScript
npx tsc --noEmit

# Chạy unit tests
npm test

# Kiểm tra đóng gói Web production
npx expo export --platform web
```
