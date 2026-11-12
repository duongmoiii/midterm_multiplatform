import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { DEFAULT_AVATAR_URL, GiangVien } from '../types/giangVien';

interface LecturerTableProps {
  items: GiangVien[];
  onView: (item: GiangVien) => void;
  onEdit: (item: GiangVien) => void;
  onDelete: (item: GiangVien) => void;
}

function TableAvatar({ uri }: { uri: string }) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const failed = failedUri === uri;

  return (
    <Image
      source={{ uri: !failed && uri ? uri : DEFAULT_AVATAR_URL }}
      style={styles.avatar}
      onError={() => setFailedUri(uri)}
    />
  );
}

export function LecturerTable({
  items,
  onView,
  onEdit,
  onDelete,
}: LecturerTableProps) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.colAvatar]}>Hình ảnh</Text>
        <Text style={[styles.headerCell, styles.colId]}>IDGV</Text>
        <Text style={[styles.headerCell, styles.colName]}>Fullname (Họ và tên)</Text>
        <Text style={[styles.headerCell, styles.colClass]}>SumClass</Text>
        <Text style={[styles.headerCell, styles.colActions]}>Thao tác</Text>
      </View>

      {items.map((item, idx) => (
        <View
          key={item.IDGV}
          style={[styles.row, idx % 2 === 1 && styles.rowAlt]}
        >
          <View style={styles.colAvatar}>
            <TableAvatar uri={item.Image} />
          </View>

          <View style={styles.colId}>
            <View style={styles.idPill}>
              <Text style={styles.idText}>{item.IDGV}</Text>
            </View>
          </View>

          <View style={styles.colName}>
            <Text style={styles.nameText} numberOfLines={1}>
              {item.Fullname}
            </Text>
          </View>

          <View style={styles.colClass}>
            <View
              style={[
                styles.classBadge,
                item.SumClass >= 5 && styles.classBadgeHigh,
              ]}
            >
              <Text
                style={[
                  styles.classText,
                  item.SumClass >= 5 && styles.classTextHigh,
                ]}
              >
                {item.SumClass} lớp
              </Text>
            </View>
          </View>

          <View style={[styles.colActions, styles.actionsWrap]}>
            <TouchableOpacity
              style={[styles.iconBtn, styles.viewBtn]}
              onPress={() => onView(item)}
              activeOpacity={0.75}
            >
              <Ionicons name="eye-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.viewText}>Xem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.editBtn]}
              onPress={() => onEdit(item)}
              activeOpacity={0.75}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <Text style={styles.editText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.deleteBtn]}
              onPress={() => onDelete(item)}
              activeOpacity={0.75}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              <Text style={styles.deleteText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderStrong,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowAlt: {
    backgroundColor: '#FAFCFF',
  },
  colAvatar: {
    width: 76,
    justifyContent: 'center',
  },
  colId: {
    width: 120,
    paddingRight: 8,
  },
  colName: {
    flex: 1,
    paddingRight: 12,
  },
  colClass: {
    width: 115,
  },
  colActions: {
    width: 245,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  idPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  idText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  classBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  classBadgeHigh: {
    backgroundColor: COLORS.successSoft,
  },
  classText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  classTextHigh: {
    color: COLORS.success,
  },
  actionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  viewBtn: {
    backgroundColor: COLORS.surfaceMuted,
  },
  editBtn: {
    backgroundColor: COLORS.primarySoft,
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerSoft,
  },
  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
