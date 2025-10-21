
import { router } from 'expo-router';
import { CustomerClassification } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
} from 'react-native';

export default function CustomersScreen() {
  const [activeTab, setActiveTab] = useState<CustomerClassification>('Potential');
  const [searchQuery, setSearchQuery] = useState('');
  const { customers } = useData();
  const { user } = useAuth();

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(c => c.classification === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(customer => {
        // Search by name
        if (customer.fullName.toLowerCase().includes(query)) return true;
        
        // Search by phone
        if (customer.phoneNumber.includes(query)) return true;
        
        // Search by address
        const address = [
          customer.address.hamlet,
          customer.address.commune,
          customer.address.district,
          customer.address.city,
        ].filter(Boolean).join(' ').toLowerCase();
        if (address.includes(query)) return true;
        
        // Search by contract number
        if (customer.insuranceContracts.some(c => 
          c.contractNumber.toLowerCase().includes(query)
        )) return true;
        
        // Search by date of birth
        const dobString = customer.dateOfBirth.toLocaleDateString('vi-VN');
        if (dobString.includes(query)) return true;
        
        return false;
      });
    }

    return filtered;
  }, [customers, activeTab, searchQuery]);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
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

  const formatAddress = (customer: any) => {
    const parts = [];
    if (customer.address.commune) parts.push(customer.address.commune);
    if (customer.address.district) parts.push(customer.address.district);
    return parts.join(', ') || 'Chưa cập nhật';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khách hàng</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/customer/add')}
        >
          <IconSymbol name="plus" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, SĐT, địa chỉ, số HĐ..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Signed' && styles.tabActive,
            { borderBottomColor: colors.signed },
          ]}
          onPress={() => setActiveTab('Signed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Signed' && styles.tabTextActive,
            ]}
          >
            Đã ký ({customers.filter(c => c.classification === 'Signed').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Potential' && styles.tabActive,
            { borderBottomColor: colors.potential },
          ]}
          onPress={() => setActiveTab('Potential')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Potential' && styles.tabTextActive,
            ]}
          >
            Tiềm năng ({customers.filter(c => c.classification === 'Potential').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Dropped' && styles.tabActive,
            { borderBottomColor: colors.dropped },
          ]}
          onPress={() => setActiveTab('Dropped')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Dropped' && styles.tabTextActive,
            ]}
          >
            Loại bỏ ({customers.filter(c => c.classification === 'Dropped').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="person.3" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/customer/add')}
              >
                <Text style={styles.emptyButtonText}>Thêm khách hàng</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.customerList}>
            {filteredCustomers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={styles.customerCard}
                onPress={() => router.push(`/customer/${customer.id}`)}
              >
                <View style={styles.customerHeader}>
                  {customer.avatar ? (
                    <Image
                      source={{ uri: customer.avatar }}
                      style={styles.customerAvatar}
                    />
                  ) : (
                    <View style={styles.customerAvatarPlaceholder}>
                      <IconSymbol
                        name="person.circle.fill"
                        size={40}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer.fullName}</Text>
                    <View style={styles.customerMeta}>
                      <IconSymbol name="phone" size={14} color={colors.textSecondary} />
                      <Text style={styles.customerPhone}>{customer.phoneNumber}</Text>
                    </View>
                    <View style={styles.customerMeta}>
                      <IconSymbol name="location" size={14} color={colors.textSecondary} />
                      <Text style={styles.customerAddress} numberOfLines={1}>
                        {formatAddress(customer)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCall(customer.phoneNumber);
                    }}
                  >
                    <IconSymbol name="phone.fill" size={20} color={colors.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Additional Info */}
                <View style={styles.customerFooter}>
                  {customer.occupation && (
                    <View style={styles.tag}>
                      <IconSymbol name="briefcase" size={12} color={colors.primary} />
                      <Text style={styles.tagText}>{customer.occupation}</Text>
                    </View>
                  )}
                  {customer.hasInsurance && customer.insuranceContracts.length > 0 && (
                    <View style={styles.tag}>
                      <IconSymbol name="shield.checkmark" size={12} color={colors.signed} />
                      <Text style={styles.tagText}>
                        {customer.insuranceContracts.length} HĐ
                      </Text>
                    </View>
                  )}
                  {customer.meetingRecords.length > 0 && (
                    <View style={styles.tag}>
                      <IconSymbol name="calendar" size={12} color={colors.accent} />
                      <Text style={styles.tagText}>
                        {customer.meetingRecords.length} cuộc gặp
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  customerList: {
    padding: 20,
    gap: 16,
  },
  customerCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  customerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  customerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  customerAddress: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  customerFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
});
