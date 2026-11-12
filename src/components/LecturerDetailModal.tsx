import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { DEFAULT_AVATAR_URL, GiangVien } from '../types/giangVien';

interface LecturerDetailModalProps {
  visible: boolean;
  lecturer: GiangVien | null;
  onClose: () => void;
  onEdit: (lecturer: GiangVien) => void;
  onDelete: (lecturer: GiangVien) => void;
}

export function LecturerDetailModal({
  visible,
  lecturer,
  onClose,
  onEdit,
  onDelete,
}: LecturerDetailModalProps) {
  const [failedImageUri, setFailedImageUri] = useState<string | null>(null);

  if (!lecturer) {
    return null;
  }

  const imageFailed = failedImageUri === lecturer.Image;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thông tin Giảng viên</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri:
                  !imageFailed && lecturer.Image
                    ? lecturer.Image
                    : DEFAULT_AVATAR_URL,
              }}
              style={styles.avatar}
              onError={() => setFailedImageUri(lecturer.Image)}
            />
          </View>

          <Text style={styles.fullName}>{lecturer.Fullname}</Text>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã Giảng viên (IDGV)</Text>
              <Text style={styles.infoValue}>{lecturer.IDGV}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên (Fullname)</Text>
              <Text style={styles.infoValue}>{lecturer.Fullname}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tổng số lớp (SumClass)</Text>
              <Text style={[styles.infoValue, styles.highlightValue]}>
                {lecturer.SumClass} lớp
              </Text>
            </View>

            <View style={styles.infoRow}>
              
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.editBtn]}
              onPress={() => {
                onClose();
                onEdit(lecturer);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.white} />
              <Text style={styles.btnPrimaryText}>Chỉnh sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.deleteBtn]}
              onPress={() => {
                onClose();
                onDelete(lecturer);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              <Text style={styles.btnDangerText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 3,
    borderColor: COLORS.primarySoft,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 18,
  },
  infoList: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  highlightValue: {
    color: COLORS.primary,
  },
  infoUrl: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  btnDangerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
