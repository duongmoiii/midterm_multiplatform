import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  ClassCountFilter,
  GiangVienSortField,
  SortDirection,
} from '../types/giangVien';

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (text: string) => void;
  filter: ClassCountFilter;
  onFilterChange: (filter: ClassCountFilter) => void;
  sortField: GiangVienSortField;
  sortDirection: SortDirection;
  onToggleSort: (field: GiangVienSortField) => void;
  onAddPress: () => void;
  isWide: boolean;
}

const FILTER_OPTIONS: { key: ClassCountFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang dạy (>0 lớp)' },
  { key: 'high', label: 'Từ 5 lớp trở lên' },
  { key: 'zero', label: '0 lớp' },
];

const SORT_OPTIONS: { key: GiangVienSortField; label: string }[] = [
  { key: 'IDGV', label: 'Mã GV' },
  { key: 'Fullname', label: 'Họ tên' },
  { key: 'SumClass', label: 'Số lớp' },
];

export function SearchFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sortField,
  sortDirection,
  onToggleSort,
  onAddPress,
  isWide,
}: SearchFilterBarProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.topRow, !isWide && styles.topRowCompact]}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Tìm theo Mã GV (IDGV) hoặc Họ và tên..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {isWide && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Thêm Giảng viên</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.bottomRow, !isWide && styles.bottomRowCompact]}>
        <View style={styles.chipGroup}>
          <Text style={styles.groupLabel}>Lọc:</Text>
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onFilterChange(opt.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.sortGroup, !isWide && styles.sortGroupCompact]}>
          <Text style={styles.groupLabel}>Sắp xếp:</Text>
          {SORT_OPTIONS.map((opt) => {
            const active = sortField === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortChip, active && styles.sortChipActive]}
                onPress={() => onToggleSort(opt.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>
                  {opt.label}
                </Text>
                {active && (
                  <Ionicons
                    name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                    size={13}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topRowCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  bottomRowCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  chipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sortGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortGroupCompact: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  sortText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sortTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
