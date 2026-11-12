export interface GiangVien {
  IDGV: string;
  Fullname: string;
  Image: string;
  SumClass: number;
}

export interface GiangVienFormValues {
  IDGV: string;
  Fullname: string;
  Image: string;
  SumClass: string;
}

export type GiangVienSortField = 'IDGV' | 'Fullname' | 'SumClass';
export type SortDirection = 'asc' | 'desc';
export type ClassCountFilter = 'all' | 'active' | 'high' | 'zero';

export interface GiangVienQueryOptions {
  search: string;
  filter: ClassCountFilter;
  sortField: GiangVienSortField;
  sortDirection: SortDirection;
}

export interface GiangVienStats {
  totalLecturers: number;
  totalClasses: number;
  averageClasses: number;
  topLecturer: GiangVien | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof GiangVienFormValues, string>>;
  data?: GiangVien;
}

export const DEFAULT_AVATAR_URL =
  'https://ui-avatars.com/api/?background=2563EB&color=FFFFFF&size=256&name=GV';

/**
 * Chuẩn hóa dữ liệu trước khi ghi vào Firestore.
 * Chỉ giữ lại đúng 4 trường bắt buộc: IDGV, Fullname, Image, SumClass.
 */
export function toFirestoreGiangVien(input: GiangVien): GiangVien {
  return {
    IDGV: String(input.IDGV ?? '').trim(),
    Fullname: String(input.Fullname ?? '').trim(),
    Image: String(input.Image ?? '').trim(),
    SumClass: Math.max(0, Math.trunc(Number(input.SumClass) || 0)),
  };
}

/**
 * Chuyển đổi document bất kỳ đọc từ Firestore thành GiangVien đúng 4 trường.
 */
export function fromFirestoreGiangVien(
  raw: Record<string, unknown>,
  fallbackId = ''
): GiangVien {
  return {
    IDGV: typeof raw.IDGV === 'string' && raw.IDGV.trim() ? raw.IDGV.trim() : fallbackId,
    Fullname: typeof raw.Fullname === 'string' ? raw.Fullname.trim() : '',
    Image: typeof raw.Image === 'string' ? raw.Image.trim() : '',
    SumClass:
      typeof raw.SumClass === 'number' && Number.isFinite(raw.SumClass)
        ? Math.max(0, Math.trunc(raw.SumClass))
        : Math.max(0, Math.trunc(Number(raw.SumClass) || 0)),
  };
}

export function isValidImageSource(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/')
  );
}

export function validateGiangVienInput(values: GiangVienFormValues): ValidationResult {
  const errors: Partial<Record<keyof GiangVienFormValues, string>> = {};

  const idgv = values.IDGV.trim();
  const fullname = values.Fullname.trim();
  const image = values.Image.trim();
  const sumClassRaw = values.SumClass.trim();

  if (!idgv) {
    errors.IDGV = 'Vui lòng nhập mã giảng viên (IDGV).';
  } else if (idgv.includes('/')) {
    errors.IDGV = 'Mã giảng viên không được chứa ký tự "/".';
  } else if (idgv.length > 50) {
    errors.IDGV = 'Mã giảng viên tối đa 50 ký tự.';
  }

  if (!fullname) {
    errors.Fullname = 'Vui lòng nhập họ và tên giảng viên.';
  } else if (fullname.length < 2) {
    errors.Fullname = 'Họ và tên phải có ít nhất 2 ký tự.';
  }

  if (!image) {
    errors.Image = 'Vui lòng chọn ảnh hoặc nhập URL hình ảnh.';
  } else if (!isValidImageSource(image)) {
    errors.Image = 'Hình ảnh phải là URL (http/https) hoặc ảnh tải lên hợp lệ.';
  }

  if (!sumClassRaw) {
    errors.SumClass = 'Vui lòng nhập tổng số lớp.';
  } else {
    const parsed = Number(sumClassRaw);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      errors.SumClass = 'Tổng số lớp phải là số nguyên không âm (>= 0).';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    data: toFirestoreGiangVien({
      IDGV: idgv,
      Fullname: fullname,
      Image: image,
      SumClass: Number(sumClassRaw),
    }),
  };
}

export function filterAndSortGiangVien(
  list: GiangVien[],
  options: GiangVienQueryOptions
): GiangVien[] {
  const query = options.search.trim().toLowerCase();

  const filtered = list.filter((item) => {
    const matchesSearch =
      !query ||
      item.IDGV.toLowerCase().includes(query) ||
      item.Fullname.toLowerCase().includes(query);

    if (!matchesSearch) {
      return false;
    }

    switch (options.filter) {
      case 'active':
        return item.SumClass > 0;
      case 'high':
        return item.SumClass >= 5;
      case 'zero':
        return item.SumClass === 0;
      case 'all':
      default:
        return true;
    }
  });

  const multiplier = options.sortDirection === 'asc' ? 1 : -1;

  return [...filtered].sort((a, b) => {
    if (options.sortField === 'SumClass') {
      if (a.SumClass !== b.SumClass) {
        return (a.SumClass - b.SumClass) * multiplier;
      }
      return a.IDGV.localeCompare(b.IDGV, 'vi') * multiplier;
    }

    const left = a[options.sortField];
    const right = b[options.sortField];
    return left.localeCompare(right, 'vi', { numeric: true }) * multiplier;
  });
}

export function computeGiangVienStats(list: GiangVien[]): GiangVienStats {
  const totalLecturers = list.length;
  if (totalLecturers === 0) {
    return {
      totalLecturers: 0,
      totalClasses: 0,
      averageClasses: 0,
      topLecturer: null,
    };
  }

  let totalClasses = 0;
  let topLecturer = list[0];

  for (const item of list) {
    totalClasses += item.SumClass;
    if (item.SumClass > topLecturer.SumClass) {
      topLecturer = item;
    }
  }

  return {
    totalLecturers,
    totalClasses,
    averageClasses: Number((totalClasses / totalLecturers).toFixed(1)),
    topLecturer,
  };
}
