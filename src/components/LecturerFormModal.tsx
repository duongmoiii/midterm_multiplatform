import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import {
  DEFAULT_AVATAR_URL,
  GiangVien,
  GiangVienFormValues,
  validateGiangVienInput,
} from '../types/giangVien';
import { pickImageFromLibrary, takePhotoWithCamera } from '../utils/imageHelper';

interface LecturerFormModalProps {
  visible: boolean;
  editingLecturer: GiangVien | null;
  onClose: () => void;
  onSubmit: (data: GiangVien, previousIdgv: string | null) => Promise<void>;
}

const EMPTY_FORM: GiangVienFormValues = {
  IDGV: '',
  Fullname: '',
  Image: '',
  SumClass: '0',
};

function getInitialValues(editingLecturer: GiangVien | null): GiangVienFormValues {
  if (!editingLecturer) {
    return EMPTY_FORM;
  }
  return {
    IDGV: editingLecturer.IDGV,
    Fullname: editingLecturer.Fullname,
    Image: editingLecturer.Image,
    SumClass: String(editingLecturer.SumClass),
  };
}

export function LecturerFormModal({
  visible,
  editingLecturer,
  onClose,
  onSubmit,
}: LecturerFormModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <LecturerFormModalContent
      key={editingLecturer ? `edit-${editingLecturer.IDGV}` : 'create-new'}
      editingLecturer={editingLecturer}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

interface LecturerFormModalContentProps {
  editingLecturer: GiangVien | null;
  onClose: () => void;
  onSubmit: (data: GiangVien, previousIdgv: string | null) => Promise<void>;
}

function LecturerFormModalContent({
  editingLecturer,
  onClose,
  onSubmit,
}: LecturerFormModalContentProps) {
  const [values, setValues] = useState<GiangVienFormValues>(() =>
    getInitialValues(editingLecturer)
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof GiangVienFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pickingImage, setPickingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const isEditing = editingLecturer !== null;

  const updateField = (key: keyof GiangVienFormValues, text: string) => {
    setValues((prev) => ({ ...prev, [key]: text }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
    if (key === 'Image') {
      setPreviewFailed(false);
    }
  };

  const handlePickLibrary = async () => {
    setPickingImage(true);
    setSubmitError(null);
    try {
      const dataUri = await pickImageFromLibrary();
      if (dataUri) {
        updateField('Image', dataUri);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Không thể chọn ảnh từ thư viện.'
      );
    } finally {
      setPickingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    setPickingImage(true);
    setSubmitError(null);
    try {
      const dataUri = await takePhotoWithCamera();
      if (dataUri) {
        updateField('Image', dataUri);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Không thể chụp ảnh bằng camera.'
      );
    } finally {
      setPickingImage(false);
    }
  };

  const handleGenerateAvatar = () => {
    const label = values.Fullname.trim() || values.IDGV.trim() || 'GV';
    const url = `https://ui-avatars.com/api/?background=2563EB&color=FFFFFF&size=256&name=${encodeURIComponent(
      label
    )}`;
    updateField('Image', url);
  };

  const handleSave = async () => {
    const validation = validateGiangVienInput(values);
    if (!validation.valid || !validation.data) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(
        validation.data,
        editingLecturer ? editingLecturer.IDGV : null
      );
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Không thể lưu dữ liệu giảng viên.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isBase64Image = values.Image.startsWith('data:image/');
  const previewUri =
    !previewFailed && values.Image.trim()
      ? values.Image.trim()
      : DEFAULT_AVATAR_URL;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={submitting ? undefined : onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={submitting ? undefined : onClose}
        >
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  {isEditing ? 'Cập nhật Giảng viên' : 'Thêm Giảng viên mới'}
                </Text>
                <Text style={styles.subtitle}>
                  Schema chuẩn: IDGV • Fullname • Image • SumClass
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                disabled={submitting}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formBody}
            >
              <View style={styles.imageSection}>
                <Image
                  source={{ uri: previewUri }}
                  style={styles.previewImage}
                  onError={() => setPreviewFailed(true)}
                />

                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.imageBtn}
                    onPress={handlePickLibrary}
                    disabled={pickingImage || submitting}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="images-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.imageBtnText}>
                      {pickingImage ? 'Đang xử lý...' : 'Chọn ảnh'}
                    </Text>
                  </TouchableOpacity>

                  {Platform.OS !== 'web' && (
                    <TouchableOpacity
                      style={styles.imageBtn}
                      onPress={handleTakePhoto}
                      disabled={pickingImage || submitting}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.imageBtnText}>Chụp ảnh</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.imageBtnSecondary}
                    onPress={handleGenerateAvatar}
                    disabled={pickingImage || submitting}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={15}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.imageBtnSecondaryText}>Avatar chữ</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Hình ảnh (Image) *</Text>
                {isBase64Image ? (
                  <View style={styles.base64Badge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={COLORS.success}
                    />
                    <Text style={styles.base64Text}>
                      Đã tải ảnh lên (~{Math.round(values.Image.length / 1024)}{' '}
                      KB)
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateField('Image', '')}
                      hitSlop={8}
                    >
                      <Text style={styles.clearLink}>Xóa / Đổi URL</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TextInput
                    value={values.Image}
                    onChangeText={(text) => updateField('Image', text)}
                    placeholder="https://... hoặc chọn ảnh ở trên"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      Boolean(errors.Image) && styles.inputError,
                    ]}
                  />
                )}
                {errors.Image && (
                  <Text style={styles.errorText}>{errors.Image}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Mã Giảng viên (IDGV) *</Text>
                <TextInput
                  value={values.IDGV}
                  onChangeText={(text) => updateField('IDGV', text)}
                  placeholder="Ví dụ: GV001"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={[
                    styles.input,
                    Boolean(errors.IDGV) && styles.inputError,
                  ]}
                />
                {errors.IDGV && (
                  <Text style={styles.errorText}>{errors.IDGV}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Họ và tên (Fullname) *</Text>
                <TextInput
                  value={values.Fullname}
                  onChangeText={(text) => updateField('Fullname', text)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  placeholderTextColor={COLORS.textMuted}
                  style={[
                    styles.input,
                    Boolean(errors.Fullname) && styles.inputError,
                  ]}
                />
                {errors.Fullname && (
                  <Text style={styles.errorText}>{errors.Fullname}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Tổng số lớp (SumClass) *</Text>
                <TextInput
                  value={values.SumClass}
                  onChangeText={(text) => updateField('SumClass', text)}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    Boolean(errors.SumClass) && styles.inputError,
                  ]}
                />
                {errors.SumClass && (
                  <Text style={styles.errorText}>{errors.SumClass}</Text>
                )}
              </View>

              {submitError && (
                <View style={styles.submitErrorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={COLORS.danger}
                  />
                  <Text style={styles.submitErrorText}>{submitError}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.footerBtn, styles.cancelBtn]}
                onPress={onClose}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.footerBtn,
                  styles.saveBtn,
                  (submitting || pickingImage) && styles.disabledBtn,
                ]}
                onPress={handleSave}
                disabled={submitting || pickingImage}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={18}
                      color={COLORS.white}
                    />
                    <Text style={styles.saveText}>
                      {isEditing ? 'Lưu thay đổi' : 'Thêm Giảng viên'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  formBody: {
    gap: 14,
    paddingBottom: 8,
  },
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
  },
  previewImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.border,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  imageActions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  imageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  imageBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  imageBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  base64Badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  base64Text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  clearLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
  },
  submitErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
  },
  submitErrorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.danger,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  disabledBtn: {
    opacity: 0.65,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
