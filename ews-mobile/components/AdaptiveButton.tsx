import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { triggerHaptic } from '../utils/haptic';

interface AdaptiveButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'secondary' | 'warning';
  fullWidth?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  primary:   { bg: '#1e3a5f', border: '#1e40af', text: '#ffffff' },
  success:   { bg: '#15803d', border: '#166534', text: '#ffffff' },
  danger:    { bg: '#dc2626', border: '#991b1b', text: '#ffffff' },
  secondary: { bg: '#334155', border: '#475569', text: '#ffffff' },
  warning:   { bg: '#d97706', border: '#b45309', text: '#ffffff' },
};

// G4/G53: Minimum 48dp touch targets enforced via minHeight
export function AdaptiveButton({
  onPress, children, variant = 'primary', fullWidth = false,
  disabled = false, accessibilityLabel, style,
}: AdaptiveButtonProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <TouchableOpacity
      onPress={() => { triggerHaptic('tap'); onPress(); }}
      disabled={disabled}
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    paddingHorizontal: 24, paddingVertical: 20,
    borderRadius: 24, borderWidth: 3,
    minHeight: 88, gap: 16,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
});
