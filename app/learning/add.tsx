
import React, { useState, useCallback, useRef } from 'react';
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
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AddLearningScreen() {
  const { addLearningContent } = useData();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [type, setType] = useState<'video' | 'pdf' | 'announcement'>('video');
  const [isSaving, setIsSaving] = useState(false);
  const saveInProgressRef = useRef(false);

  if (user?.role !== 'Admin') {
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

  const handleSave = useCallback(async () => {
    // Double-check with ref to prevent race conditions
    if (isSaving || saveInProgressRef.current) {
      console.log('Save already in progress, ignoring duplicate call');
      return;
    }

    if (!title.trim() || !description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tiêu đề và mô tả');
      return;
    }

    if (type === 'video' && !videoUrl.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập URL video');
      return;
    }

    // Set both state and ref
    setIsSaving(true);
    saveInProgressRef.current = true;
    console.log('Starting save learning content operation...');

    try {
      await addLearningContent({
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        type,
        videoUrl: type === 'video' ? videoUrl.trim() : undefined,
        createdBy: user?.id || '',
      });

      console.log('Learning content added successfully');
      Alert.alert('Thành công', 'Đã thêm bài học', [
        { 
          text: 'OK', 
          onPress: () => {
            console.log('Navigating back...');
            router.back();
          }
        },
      ]);
    } catch (error: any) {
      console.error('Error saving learning content:', error);
      Alert.alert('Lỗi', error.message || 'Không thể thêm bài học. Vui lòng thử lại.');
    } finally {
      // Reset both state and ref
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  }, [title, description, content, type, videoUrl, user, addLearningContent]);

  const types: { value: 'video' | 'pdf' | 'announcement'; label: string; icon: string }[] = [
    { value: 'video', label: 'Video', icon: 'play.rectangle.fill' },
    { value: 'pdf', label: 'PDF', icon: 'doc.fill' },
    { value: 'announcement', label: 'Thông báo', icon: 'megaphone.fill' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.headerButton}
          disabled={isSaving}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm bài học</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Loại nội dung <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeContainer}>
                {types.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.typeButton,
                      type === t.value && styles.typeButtonActive,
                    ]}
                    onPress={() => setType(t.value)}
                    disabled={isSaving}
                  >
                    <IconSymbol
                      name={t.icon}
                      size={28}
                      color={type === t.value ? colors.secondary : colors.primary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        type === t.value && styles.typeButtonTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tiêu đề <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề bài học"
                placeholderTextColor={colors.textSecondary}
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mô tả <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập mô tả ngắn gọn"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                editable={!isSaving}
              />
            </View>

            {type === 'video' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  URL Video <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                  editable={!isSaving}
                />
                <Text style={styles.hint}>
                  Hỗ trợ: YouTube, Vimeo, hoặc link video trực tiếp
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nội dung chi tiết</Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge]}
                value={content}
                onChangeText={setContent}
                placeholder="Nhập nội dung chi tiết của bài học..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={8}
                editable={!isSaving}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.5 }]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <IconSymbol name="checkmark.circle.fill" size={24} color={colors.secondary} />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Đang lưu...' : 'Lưu bài học'}
          </Text>
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
  inputGroup: {
    marginBottom: 24,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  typeButtonTextActive: {
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
