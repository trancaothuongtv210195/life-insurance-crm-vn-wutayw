
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';

export default function LearningScreen() {
  const { learningContent } = useData();
  const { user } = useAuth();

  const handleContentPress = (content: any) => {
    if (content.url) {
      Linking.openURL(content.url);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'play.circle.fill';
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
        return colors.primary;
      case 'announcement':
        return colors.accent;
      default:
        return colors.textSecondary;
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
        return type;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Đào tạo</Text>
        {user?.role === 'Admin' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/learning/add')}
          >
            <IconSymbol name="plus" size={24} color={colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {learningContent.length > 0 ? (
          learningContent.map(content => (
            <TouchableOpacity
              key={content.id}
              style={styles.contentCard}
              onPress={() => handleContentPress(content)}
            >
              {content.thumbnailUrl ? (
                <Image source={{ uri: content.thumbnailUrl }} style={styles.thumbnail} />
              ) : (
                <View
                  style={[
                    styles.thumbnailPlaceholder,
                    { backgroundColor: getContentColor(content.type) + '20' },
                  ]}
                >
                  <IconSymbol
                    name={getContentIcon(content.type)}
                    size={48}
                    color={getContentColor(content.type)}
                  />
                </View>
              )}
              <View style={styles.contentInfo}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getContentColor(content.type) + '20' },
                  ]}
                >
                  <Text style={[styles.typeBadgeText, { color: getContentColor(content.type) }]}>
                    {getContentTypeLabel(content.type)}
                  </Text>
                </View>
                <Text style={styles.contentTitle}>{content.title}</Text>
                <Text style={styles.contentDescription} numberOfLines={2}>
                  {content.description}
                </Text>
                <Text style={styles.contentDate}>
                  {content.createdAt.toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <View style={styles.playButton}>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="book" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>Chưa có nội dung đào tạo</Text>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentCard: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  thumbnail: {
    width: 120,
    height: 120,
  },
  thumbnailPlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
    padding: 16,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  contentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  contentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playButton: {
    justifyContent: 'center',
    paddingRight: 16,
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
