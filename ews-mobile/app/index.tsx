import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexRedirect() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkNavigation = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('dews_onboarded');
        const impairment = await AsyncStorage.getItem('dews_impairment_type');
        
        if (onboarded === 'true' && impairment && impairment !== 'null') {
          router.replace('/(tabs)');
        } else {
          router.replace('/splash');
        }
      } catch {
        router.replace('/splash');
      } finally {
        setLoading(false);
      }
    };
    checkNavigation();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a8a',
  },
});
