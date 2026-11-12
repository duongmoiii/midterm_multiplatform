import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';

function mapFirebaseAuthError(error: unknown): Error {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new Error('Email hoặc mật khẩu không chính xác.');
    case 'auth/invalid-email':
      return new Error('Định dạng email không hợp lệ.');
    case 'auth/email-already-in-use':
      return new Error('Email này đã được đăng ký làm tài khoản Admin.');
    case 'auth/weak-password':
      return new Error('Mật khẩu quá yếu (tối thiểu 6 ký tự).');
    case 'auth/too-many-requests':
      return new Error('Thử đăng nhập quá nhiều lần. Vui lòng đợi một lát.');
    case 'auth/network-request-failed':
      return new Error('Lỗi kết nối mạng. Vui lòng kiểm tra Internet.');
    case 'auth/operation-not-allowed':
      return new Error(
        'Vui lòng bật Email/Password trong Firebase Console -> Authentication -> Sign-in method.'
      );
    default:
      return error instanceof Error
        ? error
        : new Error('Không thể xác thực tài khoản Admin.');
  }
}

export function subscribeAuthState(
  callback: (user: User | null) => void
): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInAdmin(
  email: string,
  password: string
): Promise<User> {
  if (!auth) {
    throw new Error('Firebase chưa được cấu hình.');
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

export async function registerAdmin(
  email: string,
  password: string
): Promise<User> {
  if (!auth) {
    throw new Error('Firebase chưa được cấu hình.');
  }
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credential.user;
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

export async function signOutAdmin(): Promise<void> {
  if (!auth) {
    return;
  }
  await signOut(auth);
}
