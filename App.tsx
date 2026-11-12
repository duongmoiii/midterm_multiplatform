import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User } from 'firebase/auth';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { isFirebaseConfigured } from './src/config/firebase';
import { COLORS } from './src/constants/theme';
import { subscribeAuthState } from './src/services/authService';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        {initializing ? (
          <View style={styles.splash}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.splashText}>Đang khởi động QLHocPhan...</Text>
          </View>
        ) : user ? (
          <DashboardScreen user={user} />
        ) : (
          <LoginScreen isFirebaseConfigured={isFirebaseConfigured} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
  },
  splashText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
