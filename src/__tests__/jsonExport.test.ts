/// <reference types="jest" />
import sampleJson from '../../database/GiangVien.json';
import { GiangVien } from '../types/giangVien';
import {
  parseGiangVienJson,
  serializeGiangVienJson,
} from '../utils/jsonSerializer';

describe('GiangVien JSON export & seed file integrity', () => {
  test('database/GiangVien.json strictly contains only IDGV, Fullname, Image, SumClass', () => {
    expect(Array.isArray(sampleJson)).toBe(true);
    expect(sampleJson.length).toBeGreaterThan(0);

    for (const row of sampleJson) {
      expect(Object.keys(row).sort()).toEqual([
        'Fullname',
        'IDGV',
        'Image',
        'SumClass',
      ]);
      expect(typeof row.IDGV).toBe('string');
      expect(typeof row.Fullname).toBe('string');
      expect(typeof row.Image).toBe('string');
      expect(typeof row.SumClass).toBe('number');
      expect(Number.isInteger(row.SumClass)).toBe(true);
      expect(row.SumClass).toBeGreaterThanOrEqual(0);
    }
  });

  test('serializeGiangVienJson strips extra fields and round-trips cleanly', () => {
    const dirtyList = [
      {
        IDGV: 'GV999',
        Fullname: 'Test GV',
        Image: 'https://example.com/gv.jpg',
        SumClass: 2,
        extraProp: 'should-be-removed',
      } as unknown as GiangVien,
    ];

    const serialized = serializeGiangVienJson(dirtyList);
    const parsed = parseGiangVienJson(serialized);

    expect(parsed).toEqual([
      {
        IDGV: 'GV999',
        Fullname: 'Test GV',
        Image: 'https://example.com/gv.jpg',
        SumClass: 2,
      },
    ]);
    expect(serialized).not.toContain('extraProp');
  });
});
