import React, { useState } from 'react';
import { ScrollView, Alert, StyleSheet, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useUser } from '@/src/context/UserContext';
import { Button } from 'react-native-paper';
import { LogOut } from 'lucide-react-native';
import SettingsHeader from './components/SettingsHeader';
import SettingsSection from './components/SettingsSection';
import SettingItem from './components/SettingItem';
import AppInfo from './components/AppInfo';
import { SETTINGS_SECTIONS } from './constants/settingsData';

const SettingsScreen = () => {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout } = useUser();
  const [switches, setSwitches] = useState({
    activity_status: true,
    read_receipts: true,
    auto_play: true,
  });

  const handleSwitchToggle = (id: string) => {
    setSwitches(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof switches],
    }));
  };

  const handleAction = (item: any) => {
    const showAlert = (title: string, message: string) => {
      if (Platform.OS === 'web') {
        window.alert(`${title}: ${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    switch (item.id) {
      case 'invite_friends':
        showAlert('Invite Friends', 'Share your invite link with friends!');
        break;
      case 'link_sharing':
        showAlert('Link Sharing', 'Your profile link has been copied to clipboard!');
        break;
      case 'rate_app':
        showAlert('Rate App', 'Redirecting to App Store...');
        break;
      case 'share_app':
        showAlert('Share App', 'Sharing Wear Virtually with friends!');
        break;
      case 'clear_cache':
        const confirmMessage = 'Are you sure you want to clear cache?';
        const successMessage = 'Cache cleared successfully!';

        if (Platform.OS === 'web') {
          if (window.confirm(confirmMessage)) {
            window.alert(successMessage);
          }
        } else {
          Alert.alert('Clear Cache', confirmMessage, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => showAlert('Success', successMessage) },
          ]);
        }
        break;
      case 'delete_account':
        const deleteConfirm = 'This action cannot be undone. All your data will be permanently deleted. Are you sure you want to delete your account?';

        if (Platform.OS === 'web') {
          if (window.confirm(deleteConfirm)) {
            window.alert('Your account has been scheduled for deletion.');
          }
        } else {
          Alert.alert('Delete Account', deleteConfirm, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => showAlert('Account Deleted', 'Your account has been scheduled for deletion.') },
          ]);
        }
        break;
    }
  };

  const handleLogout = async () => {
    const confirmLogout = () => {
      if (Platform.OS === 'web') {
        return window.confirm('Are you sure you want to logout?');
      } else {
        return new Promise(resolve => {
          Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Logout', style: 'destructive', onPress: () => resolve(true) },
          ]);
        });
      }
    };

    try {
      const confirmed = Platform.OS === 'web' ? confirmLogout() : await confirmLogout();

      if (confirmed) {
        await logout();
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <SettingsHeader
        title="Settings"
        onBack={() => router.back()}
        onToggleTheme={toggleTheme}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SETTINGS_SECTIONS.map((section) => (
          <React.Fragment key={section.title}>
            <SettingsSection section={section} />

            <ScrollView style={styles.sectionItems}>
              {section.items.map((item, index) => (
                <SettingItem
                  key={item.id}
                  item={item}
                  switchValue={switches[item.id as keyof typeof switches]}
                  onPress={() => {
                    if (item.type === 'navigation' && item.route) {
                      router.push(item.route);
                    } else if (item.type === 'action') {
                      handleAction(item);
                    }
                  }}
                  onSwitchToggle={handleSwitchToggle}
                />
              ))}
            </ScrollView>
          </React.Fragment>
        ))}

        <AppInfo />

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.error }]}
          icon={() => <LogOut size={20} color={colors.error} />}
          labelStyle={[styles.logoutText, { color: colors.error }]}
        >
          Log Out
        </Button>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  sectionItems: {
    backgroundColor: 'transparent',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SettingsScreen;