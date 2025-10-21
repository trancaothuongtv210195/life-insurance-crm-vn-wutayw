
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { CustomerClassification } from '@/types';

export default function CustomersScreen() {
  const { customers } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<CustomerClassification>('Signed');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phoneNumber.includes(searchQuery);
    const matchesTab = customer.classification === activeTab;
    return matchesSearch && matchesTab;
  });

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
        <Text style={styles.title}>Khách hàng</Text>
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/customer/add')}
          >
            <IconSymbol name="plus" size={24} color={colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên, số điện thoại..."
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

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Signed' && styles.activeTab]}
          onPress={() => setActiveTab('Signed')}
        >
          <Text style={[styles.tabText, activeTab === 'Signed' && styles.activeTabText]}>
            Đã ký ({customers.filter(c => c.classification === 'Signed').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Potential' && styles.activeTab]}
          onPress={() => setActiveTab('Potential')}
        >
          <Text style={[styles.tabText, activeTab === 'Potential' && styles.activeTabText]}>
            Tiềm năng ({customers.filter(c => c.classification === 'Potential').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Dropped' && styles.activeTab]}
          onPress={() => setActiveTab('Dropped')}
        >
          <Text style={[styles.tabText, activeTab === 'Dropped' && styles.activeTabText]}>
            Đã bỏ ({customers.filter(c => c.classification === 'Dropped').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <TouchableOpacity
              key={customer.id}
              style={styles.customerCard}
              onPress={() => router.push(`/customer/${customer.id}`)}
            >
              <View style={styles.customerAvatar}>
                {customer.avatar ? (
                  <Image source={{ uri: customer.avatar }} style={styles.avatarImage} />
                ) : (
                  <IconSymbol name="person.fill" size={32} color={colors.primary} />
                )}
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.fullName}</Text>
                <Text style={styles.customerPhone}>{customer.phoneNumber}</Text>
                {customer.address && (
                  <Text style={styles.customerAddress} numberOfLines={1}>
                    {[
                      customer.address.commune,
                      customer.address.district,
                      customer.address.city,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                )}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getClassificationColor(customer.classification) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getClassificationColor(customer.classification) },
                    ]}
                  >
                    {getClassificationLabel(customer.classification)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(customer.phoneNumber)}
              >
                <IconSymbol name="phone.fill" size={20} color={colors.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="person.3" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'}
            </Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)',
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  activeTabText: {
    color: colors.secondary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
