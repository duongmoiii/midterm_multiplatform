/// <reference types="jest" />
import {
  GiangVien,
  computeGiangVienStats,
  filterAndSortGiangVien,
  fromFirestoreGiangVien,
  toFirestoreGiangVien,
  validateGiangVienInput,
} from '../types/giangVien';

describe('GiangVien strict schema & validation', () => {
  test('toFirestoreGiangVien strips any extraneous fields and keeps exactly 4 fields', () => {
    const dirtyInput = {
      IDGV: '  GV001  ',
      Fullname: '  Nguyễn Văn An  ',
      Image: '  https://example.com/avatar.jpg  ',
      SumClass: 5.8,
      createdAt: '2026-01-01',
      id: 'extra-id',
      email: 'gv@test.edu.vn',
    } as unknown as GiangVien;

    const clean = toFirestoreGiangVien(dirtyInput);

    expect(Object.keys(clean).sort()).toEqual([
      'Fullname',
      'IDGV',
      'Image',
      'SumClass',
    ]);
    expect(clean).toEqual({
      IDGV: 'GV001',
      Fullname: 'Nguyễn Văn An',
      Image: 'https://example.com/avatar.jpg',
      SumClass: 5,
    });
  });

  test('fromFirestoreGiangVien normalizes raw Firestore docs safely', () => {
    const parsed = fromFirestoreGiangVien(
      {
        IDGV: 'GV002',
        Fullname: 'Trần Thị Bình',
        Image: 'data:image/jpeg;base64,/9j/4AAQ',
        SumClass: 4,
        extraIgnoredField: true,
      },
      'FALLBACK'
    );

    expect(Object.keys(parsed).sort()).toEqual([
      'Fullname',
      'IDGV',
      'Image',
      'SumClass',
    ]);
    expect(parsed.SumClass).toBe(4);
  });

  test('validateGiangVienInput accepts valid URL and data URI images', () => {
    const resUrl = validateGiangVienInput({
      IDGV: 'GV010',
      Fullname: 'Lê Hoàng Cường',
      Image: 'https://example.com/a.png',
      SumClass: '7',
    });
    expect(resUrl.valid).toBe(true);
    expect(resUrl.data).toEqual({
      IDGV: 'GV010',
      Fullname: 'Lê Hoàng Cường',
      Image: 'https://example.com/a.png',
      SumClass: 7,
    });

    const resDataUri = validateGiangVienInput({
      IDGV: 'GV011',
      Fullname: 'Phạm Dung',
      Image: 'data:image/jpeg;base64,abc123',
      SumClass: '0',
    });
    expect(resDataUri.valid).toBe(true);
    expect(resDataUri.data?.SumClass).toBe(0);
  });

  test('validateGiangVienInput rejects invalid IDGV, negative/decimal SumClass, and bad Image', () => {
    const res = validateGiangVienInput({
      IDGV: 'GV/01',
      Fullname: 'A',
      Image: 'ftp://invalid.com/a.png',
      SumClass: '-2',
    });

    expect(res.valid).toBe(false);
    expect(res.errors.IDGV).toBeDefined();
    expect(res.errors.Fullname).toBeDefined();
    expect(res.errors.Image).toBeDefined();
    expect(res.errors.SumClass).toBeDefined();

    const decimalRes = validateGiangVienInput({
      IDGV: 'GV001',
      Fullname: 'Nguyễn Văn A',
      Image: 'https://example.com/a.png',
      SumClass: '3.5',
    });
    expect(decimalRes.valid).toBe(false);
    expect(decimalRes.errors.SumClass).toBeDefined();
  });
});

describe('GiangVien search, filter, sort & stats', () => {
  const sample: GiangVien[] = [
    { IDGV: 'GV003', Fullname: 'Lê Hoàng Cường', Image: 'https://a/3.jpg', SumClass: 8 },
    { IDGV: 'GV001', Fullname: 'Nguyễn Văn An', Image: 'https://a/1.jpg', SumClass: 0 },
    { IDGV: 'GV002', Fullname: 'Trần Thị Bình', Image: 'https://a/2.jpg', SumClass: 5 },
  ];

  test('filterAndSortGiangVien filters by query and SumClass range and sorts accurately', () => {
    const highOnly = filterAndSortGiangVien(sample, {
      search: '',
      filter: 'high',
      sortField: 'SumClass',
      sortDirection: 'desc',
    });
    expect(highOnly.map((g) => g.IDGV)).toEqual(['GV003', 'GV002']);

    const searchByName = filterAndSortGiangVien(sample, {
      search: 'bình',
      filter: 'all',
      sortField: 'IDGV',
      sortDirection: 'asc',
    });
    expect(searchByName.map((g) => g.IDGV)).toEqual(['GV002']);

    const zeroOnly = filterAndSortGiangVien(sample, {
      search: '',
      filter: 'zero',
      sortField: 'IDGV',
      sortDirection: 'asc',
    });
    expect(zeroOnly.map((g) => g.IDGV)).toEqual(['GV001']);
  });

  test('computeGiangVienStats calculates totals, average, and top lecturer', () => {
    const stats = computeGiangVienStats(sample);
    expect(stats.totalLecturers).toBe(3);
    expect(stats.totalClasses).toBe(13);
    expect(stats.averageClasses).toBe(4.3);
    expect(stats.topLecturer?.IDGV).toBe('GV003');

    const emptyStats = computeGiangVienStats([]);
    expect(emptyStats).toEqual({
      totalLecturers: 0,
      totalClasses: 0,
      averageClasses: 0,
      topLecturer: null,
    });
  });
});
