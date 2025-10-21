
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersListScreen() {
  const { users, deleteUser } = useData();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (currentUser?.role !== 'Admin') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.error} />
          <Text style={styles.errorText}>Bạn không có quyền truy cập trang này</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Xóa nhân viên',
      `Bạn có chắc chắn muốn xóa nhân viên ${userName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert('Thành công', 'Đã xóa nhân viên');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa nhân viên');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return colors.error;
      case 'Manager':
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'crown.fill';
      case 'Manager':
        return 'star.fill';
      default:
        return 'person.fill';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý nhân viên</Text>
        <TouchableOpacity 
          onPress={() => router.push('/users/add')} 
          style={styles.headerButton}
        >
          <IconSymbol name="plus.circle.fill" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhân viên..."
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name="person.3.fill" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Tổng nhân viên</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="crown.fill" size={32} color={colors.error} />
            <Text style={styles.statValue}>{users.filter(u => u.role === 'Admin').length}</Text>
            <Text style={styles.statLabel}>Admin</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="star.fill" size={32} color={colors.accent} />
            <Text style={styles.statValue}>{users.filter(u => u.role === 'Manager').length}</Text>
            <Text style={styles.statLabel}>Manager</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {filteredUsers.map((user, index) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                  ) : (
                    <IconSymbol name="person.fill" size={28} color={colors.primary} />
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {user.phoneNumber && (
                    <Text style={styles.userPhone}>{user.phoneNumber}</Text>
                  )}
                </View>
              </View>

              <View style={styles.userActions}>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                  <IconSymbol name={getRoleIcon(user.role)} size={12} color={colors.secondary} />
                  <Text style={styles.roleBadgeText}>{user.role}</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/users/edit/${user.id}`)}
                  >
                    <IconSymbol name="pencil.circle.fill" size={32} color={colors.primary} />
                  </TouchableOpacity>
                  {user.id !== currentUser?.id && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteUser(user.id, user.fullName)}
                    >
                      <IconSymbol name="trash.circle.fill" size={32} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {filteredUsers.length === 0 && (
          <View style={styles.emptyContainer}>
            <IconSymbol name="person.slash.fill" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Không tìm thấy nhân viên</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
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
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  userCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
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
