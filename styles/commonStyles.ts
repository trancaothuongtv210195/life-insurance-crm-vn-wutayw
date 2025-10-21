
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Main colors for Life Insurance CRM
  background: '#F5F7FA',
  text: '#212121',
  textSecondary: '#757575',
  primary: '#1976D2',
  secondary: '#FFFFFF',
  accent: '#FFC107',
  card: '#FFFFFF',
  highlight: '#E3F2FD',
  
  // Additional colors
  border: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Status colors
  signed: '#4CAF50',
  potential: '#FF9800',
  dropped: '#F44336',
  
  // Dark mode colors
  darkBackground: '#121212',
  darkCard: '#1E1E1E',
  darkText: '#FFFFFF',
  darkTextSecondary: '#B0B0B0',
  darkBorder: '#333333',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(25, 118, 210, 0.3)',
    elevation: 3,
  },
  primaryText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  accent: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  shadow: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
});
