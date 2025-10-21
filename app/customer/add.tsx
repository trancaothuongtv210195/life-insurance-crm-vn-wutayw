
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
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { CustomerClassification, PaymentFrequency, InsuranceContract, MeetingRecord, FileAttachment } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { provinces, districts, communes, insuranceCompanies } from '@/constants/vietnamAddress';

export default function AddCustomerScreen() {
  const { addCustomer, checkPhoneNumberExists, checkContractNumberExists } = useData();
  const { user } = useAuth();
  
  // Basic info
  const [avatar, setAvatar] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Address
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [hamlet, setHamlet] = useState('');
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showCommuneModal, setShowCommuneModal] = useState(false);
  
  // Additional info
  const [occupation, setOccupation] = useState('');
  const [financialStatus, setFinancialStatus] = useState('');
  const [familyInfo, setFamilyInfo] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
  
  // Meeting info
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [showMeetingDatePicker, setShowMeetingDatePicker] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');
  
  // Files
  const [files, setFiles] = useState<FileAttachment[]>([]);
  
  // Insurance
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceContracts, setInsuranceContracts] = useState<InsuranceContract[]>([]);
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);
  
  // Current insurance form
  const [currentCompany, setCurrentCompany] = useState('');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [currentContractNumber, setCurrentContractNumber] = useState('');
  const [currentPolicyDetails, setCurrentPolicyDetails] = useState('');
  const [currentJoinDate, setCurrentJoinDate] = useState(new Date());
  const [showJoinDatePicker, setShowJoinDatePicker] = useState(false);
  const [currentPremiumAmounts, setCurrentPremiumAmounts] = useState('');
  const [currentPaymentFrequency, setCurrentPaymentFrequency] = useState<PaymentFrequency>('month');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  
  // Classification
  const [classification, setClassification] = useState<CustomerClassification>('Potential');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const pickFiles = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newFiles: FileAttachment[] = result.assets.map((asset, index) => ({
        id: `${Date.now()}_${index}`,
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        name: asset.fileName || `file_${index}`,
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const calculateNextPaymentDate = (joinDate: Date, frequency: PaymentFrequency): Date => {
    const next = new Date(joinDate);
    const now = new Date();
    
    while (next < now) {
      switch (frequency) {
        case 'month':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'quarter':
          next.setMonth(next.getMonth() + 3);
          break;
        case '6-month':
          next.setMonth(next.getMonth() + 6);
          break;
        case 'year':
          next.setFullYear(next.getFullYear() + 1);
          break;
      }
    }
    
    return next;
  };

  const addInsuranceContract = () => {
    if (!currentCompany) {
      Alert.alert('Lỗi', 'Vui lòng chọn công ty bảo hiểm');
      return;
    }
    if (!currentContractNumber) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp đồng');
      return;
    }
    
    // Check duplicate contract number
    if (checkContractNumberExists(currentContractNumber)) {
      Alert.alert('Cảnh báo', 'Số hợp đồng này đã tồn tại trong hệ thống');
      return;
    }
    
    const newContract: InsuranceContract = {
      id: Date.now().toString(),
      company: currentCompany,
      contractNumber: currentContractNumber,
      policyDetails: currentPolicyDetails,
      joinDate: currentJoinDate,
      premiumAmounts: currentPremiumAmounts,
      paymentFrequency: currentPaymentFrequency,
      nextPaymentDate: calculateNextPaymentDate(currentJoinDate, currentPaymentFrequency),
    };
    
    setInsuranceContracts([...insuranceContracts, newContract]);
    
    // Reset form
    setCurrentCompany('');
    setCurrentContractNumber('');
    setCurrentPolicyDetails('');
    setCurrentJoinDate(new Date());
    setCurrentPremiumAmounts('');
    setCurrentPaymentFrequency('month');
    setShowInsuranceForm(false);
    
    Alert.alert('Thành công', 'Đã thêm hợp đồng bảo hiểm');
  };

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
    if (checkPhoneNumberExists(phoneNumber)) {
      Alert.alert('Cảnh báo', 'Số điện thoại này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
      return;
    }

    const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
    const districtName = districts[selectedProvince]?.find(d => d.code === selectedDistrict)?.name || '';
    const communeName = communes[selectedDistrict]?.find(c => c.code === selectedCommune)?.name || '';

    const meetingRecords: MeetingRecord[] = meetingNotes ? [{
      id: '1',
      date: meetingDate,
      notes: meetingNotes,
      createdAt: new Date(),
    }] : [];

    const location = locationLat && locationLng ? {
      latitude: parseFloat(locationLat),
      longitude: parseFloat(locationLng),
    } : undefined;

    const newCustomer = {
      avatar,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth,
      occupation: occupation.trim(),
      financialStatus: financialStatus.trim(),
      familyInfo: familyInfo.trim(),
      classification,
      address: {
        hamlet: hamlet.trim(),
        commune: communeName,
        district: districtName,
        province: provinceName,
        city: provinceName,
      },
      location,
      meetingRecords,
      files,
      hasInsurance,
      insuranceContracts,
      createdBy: user?.id || '1',
    };

    addCustomer(newCustomer);
    Alert.alert('Thành công', 'Đã thêm khách hàng mới', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const getFrequencyLabel = (freq: PaymentFrequency) => {
    switch (freq) {
      case 'month': return 'Tháng';
      case 'quarter': return 'Quý';
      case '6-month': return 'Nửa năm';
      case 'year': return 'Năm';
    }
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
          {/* Avatar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <IconSymbol name="person.circle" size={60} color={colors.textSecondary} />
                  <Text style={styles.avatarText}>Chọn ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Basic Info */}
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
              <View style={styles.phoneContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={colors.textSecondary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
                {phoneNumber && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
                  >
                    <IconSymbol name="phone.fill" size={20} color={colors.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ngày sinh</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {dateOfBirth.toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setDateOfBirth(date);
                  }}
                />
              )}
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tình trạng kinh tế</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập tình trạng kinh tế"
                placeholderTextColor={colors.textSecondary}
                value={financialStatus}
                onChangeText={setFinancialStatus}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Thông tin gia đình</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập thông tin gia đình"
                placeholderTextColor={colors.textSecondary}
                value={familyInfo}
                onChangeText={setFamilyInfo}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tỉnh/Thành phố</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowProvinceModal(true)}
              >
                <Text style={styles.inputText}>
                  {selectedProvince ? provinces.find(p => p.code === selectedProvince)?.name : 'Chọn tỉnh/thành phố'}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedProvince && districts[selectedProvince] && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Quận/Huyện</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDistrictModal(true)}
                >
                  <Text style={styles.inputText}>
                    {selectedDistrict ? districts[selectedProvince].find(d => d.code === selectedDistrict)?.name : 'Chọn quận/huyện'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedDistrict && communes[selectedDistrict] && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Xã/Phường</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowCommuneModal(true)}
                >
                  <Text style={styles.inputText}>
                    {selectedCommune ? communes[selectedDistrict].find(c => c.code === selectedCommune)?.name : 'Chọn xã/phường'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ấp/Thôn/Số nhà</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập ấp/thôn/số nhà"
                placeholderTextColor={colors.textSecondary}
                value={hamlet}
                onChangeText={setHamlet}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vị trí (Google Maps)</Text>
            <Text style={styles.helperText}>Nhập tọa độ từ Google Maps</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Vĩ độ (Latitude)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10.762622"
                  placeholderTextColor={colors.textSecondary}
                  value={locationLat}
                  onChangeText={setLocationLat}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Kinh độ (Longitude)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="106.660172"
                  placeholderTextColor={colors.textSecondary}
                  value={locationLng}
                  onChangeText={setLocationLng}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            {locationLat && locationLng && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => Linking.openURL(`https://www.google.com/maps?q=${locationLat},${locationLng}`)}
              >
                <IconSymbol name="map" size={20} color={colors.secondary} />
                <Text style={styles.mapButtonText}>Xem trên bản đồ</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Meeting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cuộc gặp</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ngày gặp</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowMeetingDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {meetingDate.toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>
              {showMeetingDatePicker && (
                <DateTimePicker
                  value={meetingDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowMeetingDatePicker(false);
                    if (date) setMeetingDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nội dung lần gặp</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập nội dung cuộc gặp"
                placeholderTextColor={colors.textSecondary}
                value={meetingNotes}
                onChangeText={setMeetingNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Files */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tệp đính kèm</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickFiles}>
              <IconSymbol name="photo" size={24} color={colors.primary} />
              <Text style={styles.uploadButtonText}>Thêm ảnh/video</Text>
            </TouchableOpacity>
            {files.length > 0 && (
              <View style={styles.filesList}>
                {files.map((file) => (
                  <View key={file.id} style={styles.fileItem}>
                    <IconSymbol 
                      name={file.type === 'video' ? 'video' : 'photo'} 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                    <TouchableOpacity onPress={() => setFiles(files.filter(f => f.id !== file.id))}>
                      <IconSymbol name="xmark.circle.fill" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Insurance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin bảo hiểm</Text>
            
            <View style={styles.insuranceToggle}>
              <Text style={styles.label}>Đã tham gia bảo hiểm?</Text>
              <View style={styles.toggleButtons}>
                <TouchableOpacity
                  style={[styles.toggleButton, !hasInsurance && styles.toggleButtonActive]}
                  onPress={() => setHasInsurance(false)}
                >
                  <Text style={[styles.toggleButtonText, !hasInsurance && styles.toggleButtonTextActive]}>
                    Chưa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, hasInsurance && styles.toggleButtonActive]}
                  onPress={() => setHasInsurance(true)}
                >
                  <Text style={[styles.toggleButtonText, hasInsurance && styles.toggleButtonTextActive]}>
                    Đã tham gia
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {hasInsurance && (
              <>
                {insuranceContracts.map((contract, index) => (
                  <View key={contract.id} style={styles.contractCard}>
                    <View style={styles.contractHeader}>
                      <Text style={styles.contractTitle}>Hợp đồng {index + 1}</Text>
                      <TouchableOpacity
                        onPress={() => setInsuranceContracts(insuranceContracts.filter(c => c.id !== contract.id))}
                      >
                        <IconSymbol name="trash" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.contractDetail}>Công ty: {contract.company}</Text>
                    <Text style={styles.contractDetail}>Số HĐ: {contract.contractNumber}</Text>
                    <Text style={styles.contractDetail}>Phí: {contract.premiumAmounts} VNĐ</Text>
                    <Text style={styles.contractDetail}>Định kỳ: {getFrequencyLabel(contract.paymentFrequency)}</Text>
                  </View>
                ))}

                {!showInsuranceForm ? (
                  <TouchableOpacity
                    style={styles.addContractButton}
                    onPress={() => setShowInsuranceForm(true)}
                  >
                    <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                    <Text style={styles.addContractButtonText}>Thêm hợp đồng</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.insuranceForm}>
                    <Text style={styles.formTitle}>Thêm hợp đồng bảo hiểm</Text>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Công ty bảo hiểm *</Text>
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowCompanyModal(true)}
                      >
                        <Text style={styles.inputText}>
                          {currentCompany || 'Chọn công ty'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Số hợp đồng *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập số hợp đồng"
                        placeholderTextColor={colors.textSecondary}
                        value={currentContractNumber}
                        onChangeText={setCurrentContractNumber}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Chi tiết bảo hiểm</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Nhập chi tiết bảo hiểm"
                        placeholderTextColor={colors.textSecondary}
                        value={currentPolicyDetails}
                        onChangeText={setCurrentPolicyDetails}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Ngày tham gia</Text>
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowJoinDatePicker(true)}
                      >
                        <Text style={styles.inputText}>
                          {currentJoinDate.toLocaleDateString('vi-VN')}
                        </Text>
                      </TouchableOpacity>
                      {showJoinDatePicker && (
                        <DateTimePicker
                          value={currentJoinDate}
                          mode="date"
                          display="default"
                          onChange={(event, date) => {
                            setShowJoinDatePicker(false);
                            if (date) setCurrentJoinDate(date);
                          }}
                        />
                      )}
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Số phí (VNĐ)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="VD: 5000000 hoặc 3000000,2000000"
                        placeholderTextColor={colors.textSecondary}
                        value={currentPremiumAmounts}
                        onChangeText={setCurrentPremiumAmounts}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Định kỳ phí</Text>
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowFrequencyModal(true)}
                      >
                        <Text style={styles.inputText}>
                          {getFrequencyLabel(currentPaymentFrequency)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formButtons}>
                      <TouchableOpacity
                        style={[styles.formButton, styles.cancelButton]}
                        onPress={() => setShowInsuranceForm(false)}
                      >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.formButton, styles.submitButton]}
                        onPress={addInsuranceContract}
                      >
                        <Text style={styles.submitButtonText}>Thêm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Classification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phân loại khách hàng</Text>
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
                  Loại bỏ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Province Modal */}
      {showProvinceModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Tỉnh/Thành phố</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {provinces.map((province) => (
                <TouchableOpacity
                  key={province.code}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProvince(province.code);
                    setSelectedDistrict('');
                    setSelectedCommune('');
                    setShowProvinceModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{province.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* District Modal */}
      {showDistrictModal && selectedProvince && districts[selectedProvince] && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Quận/Huyện</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {districts[selectedProvince].map((district) => (
                <TouchableOpacity
                  key={district.code}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDistrict(district.code);
                    setSelectedCommune('');
                    setShowDistrictModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{district.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Commune Modal */}
      {showCommuneModal && selectedDistrict && communes[selectedDistrict] && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Xã/Phường</Text>
              <TouchableOpacity onPress={() => setShowCommuneModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {communes[selectedDistrict].map((commune) => (
                <TouchableOpacity
                  key={commune.code}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCommune(commune.code);
                    setShowCommuneModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{commune.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Company Modal */}
      {showCompanyModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Công ty bảo hiểm</Text>
              <TouchableOpacity onPress={() => setShowCompanyModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {insuranceCompanies.map((company) => (
                <TouchableOpacity
                  key={company}
                  style={styles.modalItem}
                  onPress={() => {
                    setCurrentCompany(company);
                    setShowCompanyModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{company}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Frequency Modal */}
      {showFrequencyModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn định kỳ phí</Text>
              <TouchableOpacity onPress={() => setShowFrequencyModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalList}>
              {(['month', 'quarter', '6-month', 'year'] as PaymentFrequency[]).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={styles.modalItem}
                  onPress={() => {
                    setCurrentPaymentFrequency(freq);
                    setShowFrequencyModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{getFrequencyLabel(freq)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
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
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
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
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  filesList: {
    marginTop: 12,
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  insuranceToggle: {
    marginBottom: 20,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.secondary,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: colors.secondary,
  },
  contractCard: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  contractDetail: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  addContractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  addContractButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  insuranceForm: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
  },
});
