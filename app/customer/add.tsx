
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { CustomerClassification } from '@/types';

export default function AddCustomerScreen() {
  const { addCustomer, customers } = useData();
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [occupation, setOccupation] = useState('');
  const [classification, setClassification] = useState<CustomerClassification>('Potential');
  const [commune, setCommune] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    // Check for duplicate phone number
    const existingCustomer = customers.find(c => c.phoneNumber === phoneNumber);
    if (existingCustomer) {
      Alert.alert('Cảnh báo', 'Số điện thoại này đã tồn tại trong hệ thống');
      return;
    }

    const newCustomer = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
      occupation: occupation.trim(),
      classification,
      address: {
        commune: commune.trim(),
        district: district.trim(),
        city: city.trim(),
      },
      createdBy: user?.id || '1',
    };

    addCustomer(newCustomer);
    Alert.alert('Thành công', 'Đã thêm khách hàng mới', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm khách hàng</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ngày sinh</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.textSecondary}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nghề nghiệp</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập nghề nghiệp"
                placeholderTextColor={colors.textSecondary}
                value={occupation}
                onChangeText={setOccupation}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Xã/Phường</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập xã/phường"
                placeholderTextColor={colors.textSecondary}
                value={commune}
                onChangeText={setCommune}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quận/Huyện</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập quận/huyện"
                placeholderTextColor={colors.textSecondary}
                value={district}
                onChangeText={setDistrict}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tỉnh/Thành phố</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tỉnh/thành phố"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phân loại</Text>
            <View style={styles.classificationButtons}>
              <TouchableOpacity
                style={[
                  styles.classificationButton,
                  classification === 'Signed' && styles.classificationButtonActive,
                  { borderColor: colors.signed },
                ]}
                onPress={() => setClassification('Signed')}
              >
                <Text
                  style={[
                    styles.classificationButtonText,
                    classification === 'Signed' && { color: colors.secondary },
                  ]}
                >
                  Đã ký
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.classificationButton,
                  classification === 'Potential' && styles.classificationButtonActive,
                  { borderColor: colors.potential },
                ]}
                onPress={() => setClassification('Potential')}
              >
                <Text
                  style={[
                    styles.classificationButtonText,
                    classification === 'Potential' && { color: colors.secondary },
                  ]}
                >
                  Tiềm năng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.classificationButton,
                  classification === 'Dropped' && styles.classificationButtonActive,
                  { borderColor: colors.dropped },
                ]}
                onPress={() => setClassification('Dropped')}
              >
                <Text
                  style={[
                    styles.classificationButtonText,
                    classification === 'Dropped' && { color: colors.secondary },
                  ]}
                >
                  Đã bỏ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
  classificationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  classificationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: colors.secondary,
  },
  classificationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  classificationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
