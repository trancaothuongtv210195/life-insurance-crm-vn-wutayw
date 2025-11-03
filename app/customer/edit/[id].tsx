
import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { CustomerClassification, PaymentFrequency, InsuranceContract, MeetingRecord, FileAttachment, Customer } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { provinces, districts, communes, insuranceCompanies } from '@/constants/vietnamAddress';

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams();
  const { customers, updateCustomer, checkPhoneNumberExists, checkContractNumberExists } = useData();
  const { user } = useAuth();
  
  const customer = customers.find(c => c.id === id);

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
  const [locationCoordinates, setLocationCoordinates] = useState('');
  
  // Meeting records
  const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>([]);
  const [newMeetingDate, setNewMeetingDate] = useState(new Date());
  const [showNewMeetingDatePicker, setShowNewMeetingDatePicker] = useState(false);
  const [newMeetingNotes, setNewMeetingNotes] = useState('');
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  
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

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (customer) {
      setAvatar(customer.avatar || '');
      setFullName(customer.fullName);
      setPhoneNumber(customer.phoneNumber);
      setDateOfBirth(customer.dateOfBirth);
      setOccupation(customer.occupation || '');
      setFinancialStatus(customer.financialStatus || '');
      setFamilyInfo(customer.familyInfo || '');
      setHamlet(customer.address.hamlet || '');
      setClassification(customer.classification);
      setHasInsurance(customer.hasInsurance);
      setInsuranceContracts(customer.insuranceContracts);
      setMeetingRecords(customer.meetingRecords);
      setFiles(customer.files);
      
      // Convert location to coordinate string
      if (typeof customer.location === 'string') {
        setLocationCoordinates(customer.location);
      } else if (customer.location && typeof customer.location === 'object' && 'latitude' in customer.location) {
        setLocationCoordinates(`${customer.location.latitude}, ${customer.location.longitude}`);
      }

      // Find province code from name
      const province = provinces.find(p => p.name === customer.address.city || p.name === customer.address.province);
      if (province) {
        setSelectedProvince(province.code);
        
        // Find district code
        if (districts[province.code]) {
          const district = districts[province.code].find(d => d.name === customer.address.district);
          if (district) {
            setSelectedDistrict(district.code);
            
            // Find commune code
            if (communes[district.code]) {
              const commune = communes[district.code].find(c => c.name === customer.address.commune);
              if (commune) {
                setSelectedCommune(commune.code);
              }
            }
          }
        }
      }
    }
  }, [customer]);

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa khách hàng</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.content}>
          <Text style={styles.message}>Không tìm thấy khách hàng</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  const addMeetingRecord = () => {
    if (!newMeetingNotes.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung cuộc gặp');
      return;
    }

    const newRecord: MeetingRecord = {
      id: Date.now().toString(),
      date: newMeetingDate,
      notes: newMeetingNotes,
      createdAt: new Date(),
    };

    setMeetingRecords([...meetingRecords, newRecord]);
    setNewMeetingNotes('');
    setNewMeetingDate(new Date());
    setShowAddMeeting(false);
    Alert.alert('Thành công', 'Đã thêm lịch sử gặp mặt');
  };

  const addInsuranceContract = () => {
    if (!currentCompany) {
      Alert.alert('Lỗi', 'Vui lòng chọn công ty bảo hiểm');
      return;
    }
    if (!currentContractNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp đồng');
      return;
    }
    
    // Check duplicate contract number (excluding current customer)
    if (checkContractNumberExists(currentContractNumber.trim(), customer.id)) {
      Alert.alert('Cảnh báo', 'Số hợp đồng này đã tồn tại trong hệ thống');
      return;
    }
    
    // Check duplicate within current contracts
    if (insuranceContracts.some(c => c.contractNumber === currentContractNumber.trim())) {
      Alert.alert('Cảnh báo', 'Số hợp đồng này đã được thêm vào danh sách');
      return;
    }
    
    const newContract: InsuranceContract = {
      id: Date.now().toString(),
      company: currentCompany,
      contractNumber: currentContractNumber.trim(),
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

    // Check for duplicate phone number (excluding current customer)
    if (checkPhoneNumberExists(phoneNumber.trim(), customer.id)) {
      Alert.alert('Cảnh báo', 'Số điện thoại này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
      return;
    }

    const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
    const districtName = districts[selectedProvince]?.find(d => d.code === selectedDistrict)?.name || '';
    const communeName = communes[selectedDistrict]?.find(c => c.code === selectedCommune)?.name || '';

    const updates: Partial<Customer> = {
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
      location: locationCoordinates.trim(),
      meetingRecords,
      files,
      hasInsurance,
      insuranceContracts,
    };

    updateCustomer(customer.id, updates);
    Alert.alert('Thành công', 'Đã cập nhật thông tin khách hàng', [
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

  const openMapLocation = () => {
    if (locationCoordinates.trim()) {
      Linking.openURL(`https://www.google.com/maps?q=${locationCoordinates.trim()}`);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateFromInput = (dateString: string): Date => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const renderDatePicker = (
    label: string,
    value: Date,
    onChange: (date: Date) => void,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void
  ) => {
    if (isWeb) {
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{label}</Text>
          <input
            type="date"
            value={formatDateForInput(value)}
            onChange={(e) => onChange(parseDateFromInput(e.target.value))}
            style={{
              backgroundColor: colors.secondary,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              fontSize: 16,
              color: colors.text,
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.inputText}>
            {value.toLocaleDateString('vi-VN')}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowPicker(false);
              if (date) onChange(date);
            }}
          />
        )}
      </View>
    );
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: Array<{ code: string; name: string }>,
    onChange: (code: string) => void,
    placeholder: string,
    showModal: boolean,
    setShowModal: (show: boolean) => void
  ) => {
    if (isWeb) {
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{label}</Text>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              backgroundColor: colors.secondary,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              fontSize: 16,
              color: colors.text,
              width: '100%',
              fontFamily: 'inherit',
            }}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </View>
      );
    }

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.inputText}>
            {value ? options.find(o => o.code === value)?.name : placeholder}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSimpleDropdown = (
    label: string,
    value: string,
    options: string[],
    onChange: (value: string) => void,
    placeholder: string,
    showModal: boolean,
    setShowModal: (show: boolean) => void
  ) => {
    if (isWeb) {
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{label}</Text>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              backgroundColor: colors.secondary,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              fontSize: 16,
              color: colors.text,
              width: '100%',
              fontFamily: 'inherit',
            }}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </View>
      );
    }

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.inputText}>
            {value || placeholder}
          </Text>
        </TouchableOpacity>
      </View>
    );
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
        <Text style={styles.headerTitle}>Chỉnh sửa khách hàng</Text>
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
              <Text style={styles.label}>Số điện thoại * (không được trùng)</Text>
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

            {renderDatePicker('Ngày sinh', dateOfBirth, setDateOfBirth, showDatePicker, setShowDatePicker)}

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
            <Text style={styles.sectionTitle}>Địa chỉ chi tiết</Text>
            
            {renderDropdown(
              'Tỉnh/Thành phố',
              selectedProvince,
              provinces,
              (code) => {
                setSelectedProvince(code);
                setSelectedDistrict('');
                setSelectedCommune('');
              },
              'Chọn tỉnh/thành phố',
              showProvinceModal,
              setShowProvinceModal
            )}

            {selectedProvince && districts[selectedProvince] && renderDropdown(
              'Quận/Huyện',
              selectedDistrict,
              districts[selectedProvince],
              (code) => {
                setSelectedDistrict(code);
                setSelectedCommune('');
              },
              'Chọn quận/huyện',
              showDistrictModal,
              setShowDistrictModal
            )}

            {selectedDistrict && communes[selectedDistrict] && renderDropdown(
              'Xã/Phường',
              selectedCommune,
              communes[selectedDistrict],
              setSelectedCommune,
              'Chọn xã/phường',
              showCommuneModal,
              setShowCommuneModal
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
            <Text style={styles.helperText}>
              Copy toàn bộ tọa độ từ Google Maps (VD: 10.762622, 106.660172)
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tọa độ</Text>
              <TextInput
                style={styles.input}
                placeholder="10.762622, 106.660172"
                placeholderTextColor={colors.textSecondary}
                value={locationCoordinates}
                onChangeText={setLocationCoordinates}
              />
            </View>
            
            {locationCoordinates.trim() && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={openMapLocation}
              >
                <IconSymbol name="map" size={20} color={colors.secondary} />
                <Text style={styles.mapButtonText}>Xem trên bản đồ</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Meeting History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử gặp mặt</Text>
            
            {meetingRecords.map((record, index) => (
              <View key={record.id} style={styles.meetingCard}>
                <View style={styles.meetingHeader}>
                  <Text style={styles.meetingTitle}>Lần {index + 1}</Text>
                  <Text style={styles.meetingDate}>{record.date.toLocaleDateString('vi-VN')}</Text>
                </View>
                <Text style={styles.meetingNotes}>{record.notes}</Text>
              </View>
            ))}

            {!showAddMeeting ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddMeeting(true)}
              >
                <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                <Text style={styles.addButtonText}>Thêm lịch sử gặp mặt</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.meetingForm}>
                {renderDatePicker('Ngày gặp', newMeetingDate, setNewMeetingDate, showNewMeetingDatePicker, setShowNewMeetingDatePicker)}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nội dung</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Nhập nội dung cuộc gặp"
                    placeholderTextColor={colors.textSecondary}
                    value={newMeetingNotes}
                    onChangeText={setNewMeetingNotes}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.formButton, styles.cancelButton]}
                    onPress={() => setShowAddMeeting(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formButton, styles.submitButton]}
                    onPress={addMeetingRecord}
                  >
                    <Text style={styles.submitButtonText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
                    style={styles.addButton}
                    onPress={() => setShowInsuranceForm(true)}
                  >
                    <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                    <Text style={styles.addButtonText}>Thêm hợp đồng</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.insuranceForm}>
                    <Text style={styles.formTitle}>Thêm hợp đồng bảo hiểm</Text>
                    
                    {renderSimpleDropdown(
                      'Công ty bảo hiểm *',
                      currentCompany,
                      insuranceCompanies,
                      setCurrentCompany,
                      'Chọn công ty',
                      showCompanyModal,
                      setShowCompanyModal
                    )}

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Số hợp đồng * (không được trùng)</Text>
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

                    {renderDatePicker('Ngày tham gia', currentJoinDate, setCurrentJoinDate, showJoinDatePicker, setShowJoinDatePicker)}

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

                    {isWeb ? (
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Định kỳ phí</Text>
                        <select
                          value={currentPaymentFrequency}
                          onChange={(e) => setCurrentPaymentFrequency(e.target.value as PaymentFrequency)}
                          style={{
                            backgroundColor: colors.secondary,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 12,
                            paddingVertical: 14,
                            paddingHorizontal: 16,
                            fontSize: 16,
                            color: colors.text,
                            width: '100%',
                            fontFamily: 'inherit',
                          }}
                        >
                          <option value="month">Tháng</option>
                          <option value="quarter">Quý</option>
                          <option value="6-month">Nửa năm</option>
                          <option value="year">Năm</option>
                        </select>
                      </View>
                    ) : (
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
                    )}

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

      {/* Native Modals (only for non-web platforms) */}
      {!isWeb && showProvinceModal && (
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

      {!isWeb && showDistrictModal && selectedProvince && districts[selectedProvince] && (
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

      {!isWeb && showCommuneModal && selectedDistrict && communes[selectedDistrict] && (
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

      {!isWeb && showCompanyModal && (
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

      {!isWeb && showFrequencyModal && (
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
    fontStyle: 'italic',
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
  meetingForm: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
  addButton: {
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
  addButtonText: {
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
