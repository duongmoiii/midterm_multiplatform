import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GiangVienStats } from '../types/giangVien';

interface StatsHeaderProps {
  stats: GiangVienStats;
  isWide: boolean;
}

export function StatsHeader({ stats, isWide }: StatsHeaderProps) {
  const cards: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    tint: string;
    bg: string;
  }[] = [
    {
      label: 'Tổng Giảng viên',
      value: String(stats.totalLecturers),
      icon: 'people-outline',
      tint: COLORS.primary,
      bg: COLORS.primarySoft,
    },
    {
      label: 'Giảng viên có nhiều lớp nhất',
      value: stats.topLecturer ? stats.topLecturer.Fullname : 'Chưa có dữ liệu',
      sub: stats.topLecturer ? `${stats.topLecturer.SumClass} lớp` : '—',
      icon: 'trophy-outline',
      tint: '#7C3AED',
      bg: '#F5F3FF',
    },
  ];

  return (
    <View style={[styles.grid, isWide ? styles.gridWide : styles.gridCompact]}>
      {cards.map((card) => (
        <View
          key={card.label}
          style={[styles.card, isWide ? styles.cardWide : styles.cardCompact]}
        >
          <View style={styles.cardTop}>
            <Text style={styles.label}>{card.label}</Text>
            <View style={[styles.iconBox, { backgroundColor: card.bg }]}>
              <Ionicons name={card.icon} size={18} color={card.tint} />
            </View>
          </View>
          <Text style={styles.value} numberOfLines={1}>
            {card.value}
          </Text>
          {card.sub ? (
            <Text style={styles.sub} numberOfLines={1}>
              {card.sub}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridWide: {},
  gridCompact: {},
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  cardWide: {
    flex: 1,
    minWidth: 200,
  },
  cardCompact: {
    width: '48%',
    flexGrow: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 6,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
