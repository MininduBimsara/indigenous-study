/**
 * G118 – Haptic feedback utility (expo-haptics wrapper)
 * Centralised patterns for alert / success / error / tap
 */
import * as Haptics from 'expo-haptics';

export type HapticPattern = 'alert' | 'success' | 'error' | 'tap' | 'double';

export async function triggerHaptic(pattern: HapticPattern = 'tap'): Promise<void> {
  try {
    switch (pattern) {
      case 'alert':
        // Heavy impact x3 for danger alert
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 500);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'double':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
        break;
      case 'tap':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch {
    // Haptics not available on this device
  }
}
