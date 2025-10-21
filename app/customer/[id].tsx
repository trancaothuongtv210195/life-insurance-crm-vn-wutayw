
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
import { CustomerClassification } from '@/types';
import React from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const { customers, updateCustomer } = useData();
  const { user } = useAuth();

  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết khách hàng</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.content}>
          <Text style={styles.message}>Không tìm thấy khách hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${customer.phoneNumber}`);
  };

  const handleEdit = () => {
    router.push(`/customer/edit/${customer.id}`);
  };

  const getClassificationColor = (classification: CustomerClassification) => {
    switch (classification) {
      case 'Signed':
        return colors.signed;
      case 'Potential':
        return colors.potential;
      case 'Dropped':
        return colors.dropped;
    }
  };

  const getClassificationLabel = (classification: CustomerClassification) => {
    switch (classification) {
      case 'Signed':
        return 'Đã ký';
      case 'Potential':
        return 'Tiềm năng';
      case 'Dropped':
        return 'Loại bỏ';
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'month': return 'Tháng';
      case 'quarter': return 'Quý';
      case '6-month': return 'Nửa năm';
      case 'year': return 'Năm';
      default: return freq;
    }
  };

  const formatAddress = () => {
    const parts = [];
    if (customer.address.hamlet) parts.push(customer.address.hamlet);
    if (customer.address.commune) parts.push(customer.address.commune);
    if (customer.address.district) parts.push(customer.address.district);
    if (customer.address.city) parts.push(customer.address.city);
    return parts.join(', ') || 'Chưa cập nhật';
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
          onPress={handleEdit}
        >
          <IconSymbol name="pencil" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar and Basic Info */}
        <View style={styles.profileSection}>
          {customer.avatar ? (
            <Image source={{ uri: customer.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <IconSymbol name="person.circle.fill" size={80} color={colors.textSecondary} />
            </View>
          )}
          <Text style={styles.name}>{customer.fullName}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: getClassificationColor(customer.classification) },
            ]}
          >
            <Text style={styles.badgeText}>
              {getClassificationLabel(customer.classification)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <IconSymbol name="phone.fill" size={24} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Gọi điện</Text>
          </TouchableOpacity>
          {customer.location && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps?q=${customer.location?.latitude},${customer.location?.longitude}`
                )
              }
            >
              <IconSymbol name="map.fill" size={24} color={colors.secondary} />
              <Text style={styles.actionButtonText}>Bản đồ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.infoRow}>
            <IconSymbol name="phone" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{customer.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>
              {customer.dateOfBirth.toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="location" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>{formatAddress()}</Text>
          </View>
        </View>

        {/* Additional Info */}
        {(customer.occupation || customer.financialStatus || customer.familyInfo) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
            {customer.occupation && (
              <View style={styles.infoRow}>
                <IconSymbol name="briefcase" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Nghề nghiệp:</Text>
                <Text style={styles.infoValue}>{customer.occupation}</Text>
              </View>
            )}
            {customer.financialStatus && (
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Tình trạng kinh tế:</Text>
                <Text style={styles.detailValue}>{customer.financialStatus}</Text>
              </View>
            )}
            {customer.familyInfo && (
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Thông tin gia đình:</Text>
                <Text style={styles.detailValue}>{customer.familyInfo}</Text>
              </View>
            )}
          </View>
        )}

        {/* Meeting History */}
        {customer.meetingRecords && customer.meetingRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử gặp mặt</Text>
            {customer.meetingRecords.map((meeting, index) => (
              <View key={meeting.id} style={styles.meetingCard}>
                <View style={styles.meetingHeader}>
                  <Text style={styles.meetingTitle}>Lần {index + 1}</Text>
                  <Text style={styles.meetingDate}>
                    {meeting.date.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <Text style={styles.meetingNotes}>{meeting.notes}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Files */}
        {customer.files && customer.files.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tệp đính kèm</Text>
            <View style={styles.filesList}>
              {customer.files.map((file) => (
                <View key={file.id} style={styles.fileItem}>
                  <IconSymbol
                    name={file.type === 'video' ? 'video.fill' : 'photo.fill'}
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Insurance Info */}
        {customer.hasInsurance && customer.insuranceContracts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin bảo hiểm</Text>
            {customer.insuranceContracts.map((contract, index) => (
              <View key={contract.id} style={styles.insuranceCard}>
                <Text style={styles.insuranceTitle}>Hợp đồng {index + 1}</Text>
                <View style={styles.insuranceDetail}>
                  <Text style={styles.insuranceLabel}>Công ty:</Text>
                  <Text style={styles.insuranceValue}>{contract.company}</Text>
                </View>
                <View style={styles.insuranceDetail}>
                  <Text style={styles.insuranceLabel}>Số HĐ:</Text>
                  <Text style={styles.insuranceValue}>{contract.contractNumber}</Text>
                </View>
                {contract.policyDetails && (
                  <View style={styles.insuranceDetail}>
                    <Text style={styles.insuranceLabel}>Chi tiết:</Text>
                    <Text style={styles.insuranceValue}>{contract.policyDetails}</Text>
                  </View>
                )}
                <View style={styles.insuranceDetail}>
                  <Text style={styles.insuranceLabel}>Ngày tham gia:</Text>
                  <Text style={styles.insuranceValue}>
                    {contract.joinDate.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.insuranceDetail}>
                  <Text style={styles.insuranceLabel}>Phí:</Text>
                  <Text style={styles.insuranceValue}>
                    {contract.premiumAmounts} VNĐ
                  </Text>
                </View>
                <View style={styles.insuranceDetail}>
                  <Text style={styles.insuranceLabel}>Định kỳ:</Text>
                  <Text style={styles.insuranceValue}>
                    {getFrequencyLabel(contract.paymentFrequency)}
                  </Text>
                </View>
                <View style={styles.insuranceDetail}>
                  <Text style={styles.insuranceLabel}>Đóng phí tiếp theo:</Text>
                  <Text style={[styles.insuranceValue, { color: colors.accent }]}>
                    {contract.nextPaymentDate.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 120,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  detailBlock: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  meetingCard: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meetingDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  meetingNotes: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  filesList: {
    gap: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  insuranceCard: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insuranceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  insuranceDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  insuranceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 140,
  },
  insuranceValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});
