import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { COLLECTION_GIANG_VIEN, db } from '../config/firebase';
import {
  GiangVien,
  fromFirestoreGiangVien,
  toFirestoreGiangVien,
} from '../types/giangVien';

function requireDb() {
  if (!db) {
    throw new Error(
      'Firestore chưa được cấu hình. Vui lòng kiểm tra file .env.'
    );
  }
  return db;
}

/**
 * Lắng nghe thay đổi realtime trên collection GiangVien.
 * Mọi cập nhật từ Web và Mobile Expo Go sẽ tự động đồng bộ tức thì.
 */
export function subscribeGiangVien(
  onData: (items: GiangVien[]) => void,
  onError: (error: Error) => void
): () => void {
  if (!db) {
    onData([]);
    return () => {};
  }

  const colRef = collection(db, COLLECTION_GIANG_VIEN);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((snap) =>
        fromFirestoreGiangVien(snap.data() as Record<string, unknown>, snap.id)
      );
      onData(list);
    },
    (err) => {
      onError(
        err instanceof Error
          ? err
          : new Error('Không thể tải dữ liệu từ Firestore.')
      );
    }
  );
}

/**
 * Thêm giảng viên mới vào Firestore.
 * Document chỉ chứa đúng 4 trường: IDGV, Fullname, Image, SumClass.
 */
export async function createGiangVien(input: GiangVien): Promise<void> {
  const firestore = requireDb();
  const payload = toFirestoreGiangVien(input);
  const docRef = doc(firestore, COLLECTION_GIANG_VIEN, payload.IDGV);

  const existing = await getDoc(docRef);
  if (existing.exists()) {
    throw new Error(`Mã giảng viên "${payload.IDGV}" đã tồn tại.`);
  }

  await setDoc(docRef, payload);
}

/**
 * Cập nhật thông tin giảng viên.
 * Nếu IDGV thay đổi, thực hiện batch tạo document mới và xóa document cũ
 * mà vẫn đảm bảo chỉ ghi đúng 4 trường quy định.
 */
export async function updateGiangVien(
  previousIdgv: string,
  input: GiangVien
): Promise<void> {
  const firestore = requireDb();
  const payload = toFirestoreGiangVien(input);

  if (previousIdgv === payload.IDGV) {
    const docRef = doc(firestore, COLLECTION_GIANG_VIEN, payload.IDGV);
    await setDoc(docRef, payload);
    return;
  }

  const newDocRef = doc(firestore, COLLECTION_GIANG_VIEN, payload.IDGV);
  const conflict = await getDoc(newDocRef);
  if (conflict.exists()) {
    throw new Error(`Mã giảng viên mới "${payload.IDGV}" đã tồn tại.`);
  }

  const oldDocRef = doc(firestore, COLLECTION_GIANG_VIEN, previousIdgv);
  const batch = writeBatch(firestore);
  batch.set(newDocRef, payload);
  batch.delete(oldDocRef);
  await batch.commit();
}

/**
 * Xóa giảng viên theo IDGV.
 */
export async function deleteGiangVien(idgv: string): Promise<void> {
  const firestore = requireDb();
  const docRef = doc(firestore, COLLECTION_GIANG_VIEN, idgv.trim());
  await deleteDoc(docRef);
}

/**
 * Nạp hàng loạt dữ liệu giảng viên từ JSON mẫu (mỗi document đúng 4 trường).
 */
export async function seedGiangVienBatch(items: GiangVien[]): Promise<number> {
  const firestore = requireDb();
  const batch = writeBatch(firestore);
  let count = 0;

  for (const item of items) {
    const payload = toFirestoreGiangVien(item);
    if (!payload.IDGV) {
      continue;
    }
    const docRef = doc(firestore, COLLECTION_GIANG_VIEN, payload.IDGV);
    batch.set(docRef, payload);
    count += 1;
  }

  if (count > 0) {
    await batch.commit();
  }
  return count;
}
