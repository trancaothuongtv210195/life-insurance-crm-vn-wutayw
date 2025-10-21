
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfile({ avatar: result.assets[0].uri });
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
      }
    } catch (error) {
      console.log('Error picking avatar:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert('Thành công', 'Đã đổi mật khẩu');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu');
    }
  };

  const menuItems = [
    {
      icon: 'person.circle.fill',
      label: 'Thông tin cá nhân',
      onPress: () => router.push('/profile/edit'),
      show: true,
    },
    {
      icon: 'photo.circle.fill',
      label: 'Đổi ảnh đại diện',
      onPress: pickAvatar,
      show: true,
    },
    {
      icon: 'key.fill',
      label: 'Đổi mật khẩu',
      onPress: () => setShowPasswordModal(true),
      show: true,
    },
    {
      icon: 'person.2.fill',
      label: 'Quản lý nhân viên',
      onPress: () => router.push('/users/list'),
      show: user?.role === 'Admin',
    },
    {
      icon: 'person.badge.plus.fill',
      label: 'Tạo tài khoản nhân viên',
      onPress: () => router.push('/users/add'),
      show: user?.role === 'Admin',
    },
    {
      icon: 'bell.fill',
      label: 'Thông báo',
      onPress: () => console.log('Notifications'),
      show: true,
    },
    {
      icon: 'gear',
      label: 'Cài đặt',
      onPress: () => console.log('Settings'),
      show: true,
    },
    {
      icon: 'questionmark.circle.fill',
      label: 'Trợ giúp',
      onPress: () => console.log('Help'),
      show: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <IconSymbol name="person.fill" size={48} color={colors.primary} />
            )}
            <View style={styles.avatarBadge}>
              <IconSymbol name="camera.fill" size={16} color={colors.secondary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <IconSymbol 
              name={user?.role === 'Admin' ? 'crown.fill' : user?.role === 'Manager' ? 'star.fill' : 'person.fill'} 
              size={14} 
              color={colors.secondary} 
            />
            <Text style={styles.roleBadgeText}>{user?.role}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.filter(item => item.show).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.filter(i => i.show).length - 1 && styles.menuItemLast
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <IconSymbol name={item.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="arrow.right.square.fill" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
                <TextInput
                  style={styles.modalInput}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="Nhập mật khẩu cũ"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <TextInput
                  style={styles.modalInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={handleChangePassword}
              >
                <Text style={styles.modalButtonSaveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    position: 'relative',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
});
