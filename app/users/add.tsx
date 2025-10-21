
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { UserRole } from '@/types';

export default function AddUserScreen() {
  const { addUser } = useData();
  const { user: currentUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [avatar, setAvatar] = useState('');

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

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking avatar:', error);
    }
  };

  const handleSave = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      await addUser({
        fullName,
        email,
        password,
        phoneNumber,
        role,
        avatar,
        createdBy: currentUser?.id,
      });

      Alert.alert('Thành công', 'Đã tạo tài khoản nhân viên', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo tài khoản');
    }
  };

  const roles: { value: UserRole; label: string; icon: string }[] = [
    { value: 'Admin', label: 'Admin', icon: 'crown.fill' },
    { value: 'Manager', label: 'Manager', icon: 'star.fill' },
    { value: 'Staff', label: 'Staff', icon: 'person.fill' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo tài khoản nhân viên</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <IconSymbol name="person.fill" size={48} color={colors.primary} />
                )}
                <View style={styles.avatarBadge}>
                  <IconSymbol name="camera.fill" size={16} color={colors.secondary} />
                </View>
              </View>
              <Text style={styles.avatarLabel}>Chọn ảnh đại diện</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Vai trò <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.roleContainer}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.roleButton,
                      role === r.value && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole(r.value)}
                  >
                    <IconSymbol
                      name={r.icon}
                      size={24}
                      color={role === r.value ? colors.secondary : colors.primary}
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === r.value && styles.roleButtonTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <IconSymbol name="checkmark.circle.fill" size={24} color={colors.secondary} />
          <Text style={styles.saveButtonText}>Tạo tài khoản</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  avatarLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  roleButtonTextActive: {
    color: colors.secondary,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
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
