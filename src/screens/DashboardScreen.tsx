import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from 'firebase/auth';
import { ConfirmModal } from '../components/ConfirmModal';
import { LecturerCard } from '../components/LecturerCard';
import { LecturerDetailModal } from '../components/LecturerDetailModal';
import { LecturerFormModal } from '../components/LecturerFormModal';
import { LecturerTable } from '../components/LecturerTable';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatsHeader } from '../components/StatsHeader';
import { COLORS, LAYOUT } from '../constants/theme';
import { signOutAdmin } from '../services/authService';
import {
  createGiangVien,
  deleteGiangVien,
  subscribeGiangVien,
  updateGiangVien,
} from '../services/giangVienService';
import {
  ClassCountFilter,
  GiangVien,
  GiangVienSortField,
  SortDirection,
  computeGiangVienStats,
  filterAndSortGiangVien,
} from '../types/giangVien';

interface DashboardScreenProps {
  user: User;
}

interface ToastBanner {
  type: 'success' | 'error';
  text: string;
}

export function DashboardScreen({ user }: DashboardScreenProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= LAYOUT.wideBreakpoint;

  const [lecturers, setLecturers] = useState<GiangVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastBanner | null>(null);

  // Search, filter & sort state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClassCountFilter>('all');
  const [sortField, setSortField] = useState<GiangVienSortField>('IDGV');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modals state
  const [formVisible, setFormVisible] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<GiangVien | null>(null);
  const [detailLecturer, setDetailLecturer] = useState<GiangVien | null>(null);
  const [deletingLecturer, setDeletingLecturer] = useState<GiangVien | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeGiangVien(
      (items) => {
        setLecturers(items);
        setFirestoreError(null);
        setLoading(false);
      },
      (err) => {
        setFirestoreError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type: ToastBanner['type'], text: string) => {
    setToast({ type, text });
  };

  const stats = useMemo(() => computeGiangVienStats(lecturers), [lecturers]);

  const displayedLecturers = useMemo(
    () =>
      filterAndSortGiangVien(lecturers, {
        search,
        filter,
        sortField,
        sortDirection,
      }),
    [lecturers, search, filter, sortField, sortDirection]
  );

  const handleToggleSort = (field: GiangVienSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAdd = () => {
    setEditingLecturer(null);
    setFormVisible(true);
  };

  const handleOpenEdit = (item: GiangVien) => {
    setEditingLecturer(item);
    setFormVisible(true);
  };

  const handleFormSubmit = async (
    data: GiangVien,
    previousIdgv: string | null
  ) => {
    if (previousIdgv) {
      await updateGiangVien(previousIdgv, data);
      showToast('success', `Đã cập nhật giảng viên ${data.IDGV}.`);
    } else {
      await createGiangVien(data);
      showToast('success', `Đã thêm giảng viên ${data.IDGV}.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLecturer) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteGiangVien(deletingLecturer.IDGV);
      showToast('success', `Đã xóa giảng viên ${deletingLecturer.IDGV}.`);
      setDeletingLecturer(null);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Xóa giảng viên thất bại.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Không thể đăng xuất.'
      );
    }
  };

  const renderTopHeader = () => (
    <View style={styles.navbar}>
      <View style={styles.navContainer}>
        <View style={styles.brandBlock}>
          <View style={styles.brandIcon}>
            <Ionicons name="school" size={22} color={COLORS.white} />
          </View>
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>QLHocPhan — Admin</Text>
            <Text style={styles.brandSub} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.navBtnDanger}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={16} color={COLORS.danger} />
            {isWide && <Text style={styles.navBtnDangerText}>Đăng xuất</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFeedbackBanners = () => (
    <>
      {toast && (
        <View
          style={[
            styles.toast,
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Ionicons
            name={
              toast.type === 'success'
                ? 'checkmark-circle-outline'
                : 'alert-circle-outline'
            }
            size={18}
            color={toast.type === 'success' ? COLORS.success : COLORS.danger}
          />
          <Text
            style={[
              styles.toastText,
              {
                color:
                  toast.type === 'success' ? COLORS.success : COLORS.danger,
              },
            ]}
          >
            {toast.text}
          </Text>
        </View>
      )}

      {firestoreError && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={20} color={COLORS.danger} />
          <Text style={styles.errorBannerText}>
            Lỗi Firestore: {firestoreError}. Kiểm tra lại Firestore Rules hoặc
            kết nối mạng.
          </Text>
        </View>
      )}
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="folder-open-outline" size={44} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>
        {lecturers.length === 0
          ? 'Chưa có giảng viên nào'
          : 'Không tìm thấy giảng viên phù hợp'}
      </Text>
      <Text style={styles.emptySub}>
        {lecturers.length === 0
          ? 'Bạn có thể bấm "Thêm Giảng viên" để tạo dữ liệu mới.'
          : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc số lớp.'}
      </Text>
      {lecturers.length === 0 && (
        <View style={styles.emptyActions}>
          <TouchableOpacity
            style={styles.emptyPrimaryBtn}
            onPress={handleOpenAdd}
            activeOpacity={0.85}
          >
            <Ionicons name="add-outline" size={18} color={COLORS.white} />
            <Text style={styles.emptyPrimaryText}>Thêm Giảng viên</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const dashboardHeader = (
    <View style={styles.sectionGap}>
      {renderFeedbackBanners()}
      <StatsHeader stats={stats} isWide={isWide} />
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sortField={sortField}
        sortDirection={sortDirection}
        onToggleSort={handleToggleSort}
        onAddPress={handleOpenAdd}
        isWide={isWide}
      />
      <View style={styles.resultMeta}>
        <Text style={styles.resultMetaText}>
          Hiển thị {displayedLecturers.length} / {lecturers.length} giảng viên
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {renderTopHeader()}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Đang đồng bộ dữ liệu Firestore...
          </Text>
        </View>
      ) : isWide ? (
        <ScrollView contentContainerStyle={styles.wideContent}>
          <View style={styles.wideInner}>
            {dashboardHeader}
            {displayedLecturers.length === 0 ? (
              renderEmptyState()
            ) : (
              <LecturerTable
                items={displayedLecturers}
                onView={setDetailLecturer}
                onEdit={handleOpenEdit}
                onDelete={setDeletingLecturer}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={displayedLecturers}
            keyExtractor={(item) => item.IDGV}
            contentContainerStyle={styles.mobileListContent}
            ListHeaderComponent={dashboardHeader}
            ListEmptyComponent={renderEmptyState}
            renderItem={({ item }) => (
              <LecturerCard
                item={item}
                onView={setDetailLecturer}
                onEdit={handleOpenEdit}
                onDelete={setDeletingLecturer}
              />
            )}
          />

          <TouchableOpacity
            style={styles.fab}
            onPress={handleOpenAdd}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </>
      )}

      <LecturerFormModal
        visible={formVisible}
        editingLecturer={editingLecturer}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
      />

      <LecturerDetailModal
        visible={detailLecturer !== null}
        lecturer={detailLecturer}
        onClose={() => setDetailLecturer(null)}
        onEdit={handleOpenEdit}
        onDelete={setDeletingLecturer}
      />

      <ConfirmModal
        visible={deletingLecturer !== null}
        title="Xác nhận xóa giảng viên"
        message={
          deletingLecturer
            ? `Bạn có chắc chắn muốn xóa giảng viên "${deletingLecturer.Fullname}" (${deletingLecturer.IDGV}) khỏi Firestore?`
            : ''
        }
        confirmText="Xóa"
        cancelText="Hủy"
        destructive
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLecturer(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navbar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navContainer: {
    width: '100%',
    maxWidth: LAYOUT.maxContainerWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextWrap: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  brandSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
  },
  navBtnDangerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  wideContent: {
    padding: 20,
    alignItems: 'center',
  },
  wideInner: {
    width: '100%',
    maxWidth: LAYOUT.maxContainerWidth,
    gap: 14,
  },
  mobileListContent: {
    padding: 14,
    paddingBottom: 92,
  },
  sectionGap: {
    gap: 12,
    marginBottom: 12,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toastSuccess: {
    backgroundColor: COLORS.successSoft,
    borderColor: '#A7F3D0',
  },
  toastError: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: '#FECACA',
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.danger,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  resultMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptyBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 34,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 420,
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
