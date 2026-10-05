import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { triggerHaptic, type HapticPattern } from '../utils/haptic';
import { useAccessibility } from '../context/AccessibilityContext';
import { palette } from '../theme/colors';

// G5: Buttons look like buttons with clear labels
// G66: Touch targets ≥44dp
// G113: Visual feedback within 100ms
// G56: Exposes accessibilityRole + accessibilityLabel

interface HapticButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  sublabel?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'safe' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  haptic?: HapticPattern;
  leftIcon?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityHint?: string;
  fullWidth?: boolean;
}

const VARIANTS: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: palette.blue[900], text: palette.white, border: palette.blue[900] },
  secondary: { bg: palette.slate[100], text: palette.slate[800], border: palette.slate[300] },
  danger: { bg: palette.red[900], text: palette.red[50], border: palette.red[900] },
  safe: { bg: palette.green[900], text: palette.green[50], border: palette.green[900] },
  ghost: { bg: 'transparent', text: palette.blue[900], border: palette.blue[900] },
};

const SIZES: Record<string, { minHeight: number; paddingH: number; fontSize: number }> = {
  sm: { minHeight: 44, paddingH: 12, fontSize: 14 },
  md: { minHeight: 52, paddingH: 20, fontSize: 16 },
  lg: { minHeight: 60, paddingH: 24, fontSize: 18 },
  xl: { minHeight: 72, paddingH: 28, fontSize: 22 },
};

export default function HapticButton({
  label,
  sublabel,
  variant = 'primary',
  size = 'md',
  haptic = 'tap',
  leftIcon,
  style,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
  fullWidth = false,
  onPress,
  disabled,
  ...rest
}: HapticButtonProps) {
  const { settings, fontSize } = useAccessibility();
  const scale = useRef(new Animated.Value(1)).current;

  const v = VARIANTS[variant];
  const s = SIZES[size];

  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (!settings.sensoryMode) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.96, duration: 60, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
    if (settings.vibrationEnabled) {
      triggerHaptic(haptic);
    }
    onPress?.(e);
  };

  return (
    <Animated.View style={[fullWidth && styles.full, { transform: [{ scale }] }]}>
      <Pressable
        {...rest}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled ?? false }}
        style={[
          styles.base,
          {
            backgroundColor: disabled ? palette.gray[400] : v.bg,
            borderColor: disabled ? palette.gray[400] : v.border,
            minHeight: s.minHeight,
            paddingHorizontal: s.paddingH,
          },
          fullWidth && styles.full,
          style,
        ]}
      >
        <View style={styles.content}>
          {leftIcon ? (
            <Text style={[styles.icon, { fontSize: s.fontSize + 4, color: v.text }]}>
              {leftIcon}
            </Text>
          ) : null}
          <View>
            <Text
              style={[
                styles.label,
                {
                  color: disabled ? palette.gray[200] : v.text,
                  fontSize: fontSize(s.fontSize),
                  lineHeight: fontSize(s.fontSize) * 1.3,
                },
                labelStyle,
              ]}
            >
              {label}
            </Text>
            {sublabel ? (
              <Text style={[styles.sublabel, { color: v.text, fontSize: fontSize(s.fontSize - 4) }]}>
                {sublabel}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  full: {
    width: '100%',
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
  sublabel: {
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 2,
  },
  icon: {
    lineHeight: undefined,
  },
});
