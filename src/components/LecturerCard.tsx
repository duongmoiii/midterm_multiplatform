import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { DEFAULT_AVATAR_URL, GiangVien } from '../types/giangVien';

interface LecturerCardProps {
  item: GiangVien;
  onView: (item: GiangVien) => void;
  onEdit: (item: GiangVien) => void;
  onDelete: (item: GiangVien) => void;
}

export function LecturerCard({
  item,
  onView,
  onEdit,
  onDelete,
}: LecturerCardProps) {
  const [failedImageUri, setFailedImageUri] = useState<string | null>(null);
  const imageFailed = failedImageUri === item.Image;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onView(item)}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <Image
          source={{
            uri: !imageFailed && item.Image ? item.Image : DEFAULT_AVATAR_URL,
          }}
          style={styles.avatar}
          onError={() => setFailedImageUri(item.Image)}
        />

        <View style={styles.info}>
          <View style={styles.topLine}>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>{item.IDGV}</Text>
            </View>
            <View
              style={[
                styles.classBadge,
                item.SumClass >= 5 && styles.classBadgeHigh,
              ]}
            >
              <Ionicons
                name="book-outline"
                size={12}
                color={item.SumClass >= 5 ? COLORS.success : COLORS.primary}
              />
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

          <Text style={styles.name} numberOfLines={2}>
            {item.Fullname}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => onView(item)}
          activeOpacity={0.75}
        >
          <Ionicons name="eye-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.viewText}>Chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(item)}
          activeOpacity={0.75}
        >
          <Ionicons name="create-outline" size={16} color={COLORS.primary} />
          <Text style={styles.editText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(item)}
          activeOpacity={0.75}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  idBadge: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  classBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  classBadgeHigh: {
    backgroundColor: COLORS.successSoft,
  },
  classText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  classTextHigh: {
    color: COLORS.success,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
