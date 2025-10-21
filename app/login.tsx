
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Lỗi đăng nhập', error.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <IconSymbol name="shield.fill" size={60} color={colors.primary} />
          </View>
          <Text style={styles.title}>Life Insurance CRM</Text>
          <Text style={styles.subtitle}>Quản lý khách hàng bảo hiểm nhân thọ</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <IconSymbol name="envelope.fill" size={18} color={colors.primary} />
              <Text style={styles.label}>Email</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập email của bạn"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <IconSymbol name="lock.fill" size={18} color={colors.primary} />
              <Text style={styles.label}>Mật khẩu</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <IconSymbol 
              name={isLoading ? "arrow.clockwise" : "arrow.right.circle.fill"} 
              size={24} 
              color={colors.secondary} 
            />
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Text>
          </TouchableOpacity>

          <View style={styles.demoInfo}>
            <View style={styles.demoHeader}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text style={styles.demoTitle}>Tài khoản mặc định</Text>
            </View>
            <View style={styles.demoItem}>
              <IconSymbol name="person.badge.shield.checkmark.fill" size={16} color={colors.accent} />
              <Text style={styles.demoText}>Admin: admin@insurance.vn</Text>
            </View>
            <Text style={styles.demoPassword}>Mật khẩu: admin123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 8px 24px rgba(25, 118, 210, 0.3)',
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  demoInfo: {
    marginTop: 32,
    padding: 20,
    backgroundColor: colors.highlight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  demoText: {
    fontSize: 14,
    color: colors.text,
  },
  demoPassword: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 24,
  },
});
