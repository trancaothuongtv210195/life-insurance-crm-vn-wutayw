
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
  const { dashboardStats, customers } = useData();

  const upcomingMeetings = customers
    .filter(c => c.meetingDate && c.meetingDate > new Date())
    .sort((a, b) => (a.meetingDate?.getTime() || 0) - (b.meetingDate?.getTime() || 0))
    .slice(0, 3);

  const upcomingPayments = customers
    .filter(c => c.insuranceDetails?.some(d => d.nextPaymentDate > new Date()))
    .slice(0, 3);

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
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuộc họp sắp tới</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={styles.meetingCard}
                onPress={() => router.push(`/customer/${customer.id}`)}
              >
                <View style={styles.meetingIcon}>
                  <IconSymbol name="calendar" size={24} color={colors.primary} />
                </View>
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingName}>{customer.fullName}</Text>
                  <Text style={styles.meetingDate}>
                    {customer.meetingDate?.toLocaleDateString('vi-VN')}
                  </Text>
                  {customer.meetingNotes && (
                    <Text style={styles.meetingNotes} numberOfLines={1}>
                      {customer.meetingNotes}
                    </Text>
                  )}
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Không có cuộc họp sắp tới</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thanh toán sắp tới</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {upcomingPayments.length > 0 ? (
            upcomingPayments.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={styles.paymentCard}
                onPress={() => router.push(`/customer/${customer.id}`)}
              >
                <View style={styles.paymentIcon}>
                  <IconSymbol name="creditcard.fill" size={24} color={colors.accent} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{customer.fullName}</Text>
                  {customer.insuranceDetails?.[0] && (
                    <>
                      <Text style={styles.paymentCompany}>
                        {customer.insuranceDetails[0].company}
                      </Text>
                      <Text style={styles.paymentAmount}>
                        {customer.insuranceDetails[0].premiumAmount.toLocaleString('vi-VN')} đ
                      </Text>
                    </>
                  )}
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Không có thanh toán sắp tới</Text>
            </View>
          )}
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
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
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
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  meetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  meetingDate: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  meetingNotes: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentCompany: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  paymentAmount: {
    fontSize: 15,
    color: colors.accent,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
