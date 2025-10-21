
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { CustomerClassification } from '@/types';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const { customers, deleteCustomer } = useData();
  const { user } = useAuth();
  
  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy khách hàng</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${customer.phoneNumber}`);
  };

  const handleDelete = () => {
    if (user?.role === 'Staff') {
      Alert.alert('Không có quyền', 'Bạn không có quyền xóa khách hàng');
      return;
    }

    Alert.alert(
      'Xóa khách hàng',
      `Bạn có chắc chắn muốn xóa ${customer.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            deleteCustomer(customer.id);
            router.back();
          },
        },
      ]
    );
  };

  const getClassificationColor = (classification: CustomerClassification) => {
    switch (classification) {
      case 'Signed':
        return colors.signed;
      case 'Potential':
        return colors.potential;
      case 'Dropped':
        return colors.dropped;
      default:
        return colors.textSecondary;
    }
  };

  const getClassificationLabel = (classification: CustomerClassification) => {
    switch (classification) {
      case 'Signed':
        return 'Đã ký';
      case 'Potential':
        return 'Tiềm năng';
      case 'Dropped':
        return 'Đã bỏ';
      default:
        return classification;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết khách hàng</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/customer/edit/${customer.id}`)}
        >
          <IconSymbol name="pencil" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {customer.avatar ? (
              <Image source={{ uri: customer.avatar }} style={styles.avatar} />
            ) : (
              <IconSymbol name="person.fill" size={64} color={colors.primary} />
            )}
          </View>
          <Text style={styles.customerName}>{customer.fullName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getClassificationColor(customer.classification) },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {getClassificationLabel(customer.classification)}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <IconSymbol name="phone.fill" size={24} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Gọi điện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="message.fill" size={24} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="calendar" size={24} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Lịch hẹn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconSymbol name="phone" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{customer.phoneNumber}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <IconSymbol name="calendar" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>
                {customer.dateOfBirth.toLocaleDateString('vi-VN')}
              </Text>
            </View>
            {customer.occupation && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <IconSymbol name="briefcase" size={20} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Nghề nghiệp</Text>
                  <Text style={styles.infoValue}>{customer.occupation}</Text>
                </View>
              </>
            )}
            {customer.address && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <IconSymbol name="location" size={20} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>
                    {[
                      customer.address.hamlet,
                      customer.address.commune,
                      customer.address.district,
                      customer.address.city,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {customer.insuranceDetails && customer.insuranceDetails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin bảo hiểm</Text>
            {customer.insuranceDetails.map((insurance, index) => (
              <View key={index} style={styles.insuranceCard}>
                <View style={styles.insuranceHeader}>
                  <Text style={styles.insuranceCompany}>{insurance.company}</Text>
                  <Text style={styles.insuranceContract}>{insurance.contractNumber}</Text>
                </View>
                <Text style={styles.insurancePolicy}>{insurance.policyDetails}</Text>
                <View style={styles.insuranceDetails}>
                  <View style={styles.insuranceDetailItem}>
                    <Text style={styles.insuranceDetailLabel}>Phí bảo hiểm</Text>
                    <Text style={styles.insuranceDetailValue}>
                      {insurance.premiumAmount.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                  <View style={styles.insuranceDetailItem}>
                    <Text style={styles.insuranceDetailLabel}>Tần suất</Text>
                    <Text style={styles.insuranceDetailValue}>
                      {insurance.paymentFrequency === 'month' && 'Hàng tháng'}
                      {insurance.paymentFrequency === 'quarter' && 'Hàng quý'}
                      {insurance.paymentFrequency === '6-month' && '6 tháng'}
                      {insurance.paymentFrequency === 'year' && 'Hàng năm'}
                    </Text>
                  </View>
                  <View style={styles.insuranceDetailItem}>
                    <Text style={styles.insuranceDetailLabel}>Thanh toán tiếp theo</Text>
                    <Text style={styles.insuranceDetailValue}>
                      {insurance.nextPaymentDate.toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {customer.meetingDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuộc họp</Text>
            <View style={styles.meetingCard}>
              <View style={styles.meetingHeader}>
                <IconSymbol name="calendar" size={24} color={colors.primary} />
                <Text style={styles.meetingDate}>
                  {customer.meetingDate.toLocaleDateString('vi-VN')}
                </Text>
              </View>
              {customer.meetingNotes && (
                <Text style={styles.meetingNotes}>{customer.meetingNotes}</Text>
              )}
            </View>
          </View>
        )}

        {user?.role !== 'Staff' && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <IconSymbol name="trash" size={20} color={colors.error} />
            <Text style={styles.deleteButtonText}>Xóa khách hàng</Text>
          </TouchableOpacity>
        )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.secondary,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  customerName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(25, 118, 210, 0.3)',
    elevation: 3,
  },
  actionButtonText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  insuranceCard: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  insuranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insuranceCompany: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  insuranceContract: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  insurancePolicy: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  insuranceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insuranceDetailItem: {
    flex: 1,
    minWidth: '45%',
  },
  insuranceDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  insuranceDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  meetingCard: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  meetingNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
