
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { LearningContent } from '@/types';

export default function LearningScreen() {
  const { learningContent, deleteLearningContent } = useData();
  const { user } = useAuth();
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleContentPress = (content: LearningContent) => {
    setSelectedContent(content);
    setShowDetailModal(true);
  };

  const handleOpenVideo = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở video');
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (isDeleting) {
      console.log('Already deleting, ignoring duplicate delete request');
      return;
    }

    Alert.alert('Xóa bài học', `Bạn có chắc chắn muốn xóa "${title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteLearningContent(id);
            setShowDetailModal(false);
            Alert.alert('Thành công', 'Đã xóa bài học');
          } catch (error) {
            console.log('Error deleting learning content:', error);
            Alert.alert('Lỗi', 'Không thể xóa bài học');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'play.rectangle.fill';
      case 'pdf':
        return 'doc.fill';
      case 'announcement':
        return 'megaphone.fill';
      default:
        return 'doc.fill';
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'video':
        return colors.error;
      case 'pdf':
        return colors.accent;
      case 'announcement':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'pdf':
        return 'Tài liệu';
      case 'announcement':
        return 'Thông báo';
      default:
        return 'Khác';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bài học</Text>
          <Text style={styles.headerSubtitle}>{learningContent.length} bài học</Text>
        </View>
        {user?.role === 'Admin' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/learning/add')}
          >
            <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentList}>
          {learningContent.map((content) => (
            <TouchableOpacity
              key={content.id}
              style={styles.contentCard}
              onPress={() => handleContentPress(content)}
            >
              <View style={[styles.contentIcon, { backgroundColor: getContentColor(content.type) }]}>
                <IconSymbol name={getContentIcon(content.type)} size={32} color={colors.secondary} />
              </View>
              <View style={styles.contentInfo}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentTitle} numberOfLines={2}>
                    {content.title}
                  </Text>
                  <View style={[styles.typeBadge, { backgroundColor: getContentColor(content.type) }]}>
                    <Text style={styles.typeBadgeText}>{getContentTypeLabel(content.type)}</Text>
                  </View>
                </View>
                <Text style={styles.contentDescription} numberOfLines={2}>
                  {content.description}
                </Text>
                <View style={styles.contentFooter}>
                  <View style={styles.dateContainer}>
                    <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
                    <Text style={styles.contentDate}>
                      {content.createdAt.toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {learningContent.length === 0 && (
          <View style={styles.emptyContainer}>
            <IconSymbol name="book.closed.fill" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Chưa có bài học nào</Text>
            {user?.role === 'Admin' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/learning/add')}
              >
                <IconSymbol name="plus.circle.fill" size={24} color={colors.secondary} />
                <Text style={styles.emptyButtonText}>Thêm bài học đầu tiên</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalIcon, { backgroundColor: getContentColor(selectedContent?.type || 'video') }]}>
                  <IconSymbol name={getContentIcon(selectedContent?.type || 'video')} size={24} color={colors.secondary} />
                </View>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedContent?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={32} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.modalTypeBadge, { backgroundColor: getContentColor(selectedContent?.type || 'video') }]}>
                <Text style={styles.modalTypeBadgeText}>{getContentTypeLabel(selectedContent?.type || 'video')}</Text>
              </View>

              <Text style={styles.modalDescription}>{selectedContent?.description}</Text>

              {selectedContent?.content && (
                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Nội dung chi tiết</Text>
                  <Text style={styles.contentText}>{selectedContent.content}</Text>
                </View>
              )}

              {selectedContent?.type === 'video' && selectedContent?.videoUrl && (
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() => handleOpenVideo(selectedContent.videoUrl!)}
                >
                  <IconSymbol name="play.circle.fill" size={32} color={colors.secondary} />
                  <Text style={styles.videoButtonText}>Xem video</Text>
                </TouchableOpacity>
              )}

              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <IconSymbol name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {selectedContent?.createdAt.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {user?.role === 'Admin' && selectedContent && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.deleteButton, isDeleting && { opacity: 0.5 }]}
                  onPress={() => handleDelete(selectedContent.id, selectedContent.title)}
                  disabled={isDeleting}
                >
                  <IconSymbol name="trash.fill" size={20} color={colors.error} />
                  <Text style={styles.deleteButtonText}>
                    {isDeleting ? 'Đang xóa...' : 'Xóa bài học'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentList: {
    padding: 20,
    gap: 16,
  },
  contentCard: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  contentIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentInfo: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  contentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contentDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    boxShadow: '0px -4px 24px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  modalTypeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  metaInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.error,
    paddingVertical: 14,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
