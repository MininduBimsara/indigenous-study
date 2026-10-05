import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { triggerHaptic } from '../utils/haptic';
import { palette } from '../theme/colors';

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
  primary:   { bg: palette.navy, border: palette.blue[800], text: palette.white },
  success:   { bg: palette.green[700], border: palette.green[800], text: palette.white },
  danger:    { bg: palette.red[600], border: palette.red[800], text: palette.white },
  secondary: { bg: palette.slate[700], border: palette.slate[600], text: palette.white },
  warning:   { bg: palette.amber[600], border: palette.amber[700], text: palette.white },
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
