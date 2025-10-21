
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { dashboardStats, customers, reminders } = useData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.userRole}>{user?.role}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <IconSymbol name="bell.fill" size={24} color={colors.primary} />
            {reminders.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{reminders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/customers')}
          >
            <IconSymbol name="person.3.fill" size={32} color={colors.secondary} />
            <Text style={styles.statNumber}>{dashboardStats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Tổng khách hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.signed }]}
            onPress={() => router.push('/(tabs)/customers?tab=signed')}
          >
            <IconSymbol name="checkmark.circle.fill" size={32} color={colors.secondary} />
            <Text style={styles.statNumber}>{dashboardStats.signedCount}</Text>
            <Text style={styles.statLabel}>Đã ký</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.potential }]}
            onPress={() => router.push('/(tabs)/customers?tab=potential')}
          >
            <IconSymbol name="star.fill" size={32} color={colors.secondary} />
            <Text style={styles.statNumber}>{dashboardStats.potentialCount}</Text>
            <Text style={styles.statLabel}>Tiềm năng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.dropped }]}
            onPress={() => router.push('/(tabs)/customers?tab=dropped')}
          >
            <IconSymbol name="xmark.circle.fill" size={32} color={colors.secondary} />
            <Text style={styles.statNumber}>{dashboardStats.droppedCount}</Text>
            <Text style={styles.statLabel}>Đã bỏ</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders Section */}
        {reminders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nhắc nhở</Text>
              <View style={styles.reminderCount}>
                <Text style={styles.reminderCountText}>{reminders.length}</Text>
              </View>
            </View>
            {reminders.slice(0, 5).map((reminder, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.reminderCard,
                  reminder.type === 'payment-overdue' && styles.reminderCardUrgent,
                ]}
                onPress={() => router.push(`/customer/${reminder.customerId}`)}
              >
                <View style={[
                  styles.reminderIcon,
                  reminder.type === 'birthday' && { backgroundColor: '#E3F2FD' },
                  reminder.type === 'payment-due' && { backgroundColor: '#FFF8E1' },
                  reminder.type === 'payment-overdue' && { backgroundColor: '#FFEBEE' },
                ]}>
                  <IconSymbol 
                    name={
                      reminder.type === 'birthday' ? 'gift' :
                      reminder.type === 'payment-due' ? 'clock' :
                      'exclamationmark.triangle'
                    }
                    size={24}
                    color={
                      reminder.type === 'birthday' ? colors.primary :
                      reminder.type === 'payment-due' ? colors.accent :
                      colors.error
                    }
                  />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderName}>{reminder.customerName}</Text>
                  <Text style={[
                    styles.reminderMessage,
                    reminder.type === 'payment-overdue' && styles.reminderMessageUrgent,
                  ]}>
                    {reminder.message}
                  </Text>
                  <Text style={styles.reminderDate}>
                    {reminder.date.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
            {reminders.length > 5 && (
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/customers')}
              >
                <Text style={styles.seeAllText}>Xem tất cả {reminders.length} nhắc nhở</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê nhanh</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatCard}>
              <IconSymbol name="gift.fill" size={28} color={colors.primary} />
              <Text style={styles.quickStatNumber}>{dashboardStats.upcomingBirthdays}</Text>
              <Text style={styles.quickStatLabel}>Sinh nhật sắp tới</Text>
            </View>
            <View style={styles.quickStatCard}>
              <IconSymbol name="clock.fill" size={28} color={colors.accent} />
              <Text style={styles.quickStatNumber}>{dashboardStats.upcomingPayments}</Text>
              <Text style={styles.quickStatLabel}>Sắp đóng phí</Text>
            </View>
            <View style={styles.quickStatCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={28} color={colors.error} />
              <Text style={styles.quickStatNumber}>{dashboardStats.overduePayments}</Text>
              <Text style={styles.quickStatLabel}>Trễ phí</Text>
            </View>
            <View style={styles.quickStatCard}>
              <IconSymbol name="calendar.badge.plus" size={28} color={colors.signed} />
              <Text style={styles.quickStatNumber}>{dashboardStats.newCustomersThisMonth}</Text>
              <Text style={styles.quickStatLabel}>KH mới tháng này</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reminderCount: {
    backgroundColor: colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reminderCountText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  reminderCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  reminderMessageUrgent: {
    color: colors.error,
    fontWeight: '600',
  },
  reminderDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatCard: {
    width: (width - 56) / 2,
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
