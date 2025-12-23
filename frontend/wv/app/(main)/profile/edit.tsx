import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../../src/context/UserContext';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [changesMade, setChangesMade] = useState(false);

  // Form state
  const [userData, setUserData] = useState({
    username: '',
    name: '', // This maps to fullName
    bio: '',
    email: '',
    location: '',
    phone: '',
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState({
    username: '',
    name: '',
    bio: '',
    email: '',
    location: '',
    phone: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [isFetchingData, setIsFetchingData] = useState(true);

  // Initialize data from context and fetch latest
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshProfile();
      } catch (error) {
        console.error('Failed to refresh profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to load latest profile data',
        });
      } finally {
        setIsFetchingData(false);
      }
    };
    loadData();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      const initialData = {
        username: user.username || '',
        name: user.fullName || '', // Map fullName to name field
        bio: user.bio || '',
        email: user.email || '',
        location: user.location || '',
        phone: user.phone || '',
      };

      setUserData(initialData);
      setOriginalData(initialData);
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    const hasChanges =
      userData.username !== originalData.username ||
      userData.name !== originalData.name ||
      userData.bio !== originalData.bio ||
      userData.location !== originalData.location ||
      userData.phone !== originalData.phone;

    setChangesMade(hasChanges);
  }, [userData, originalData]);

  if (isFetchingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading latest profile...</Text>
      </View>
    );
  }

  const handleBack = () => {
    if (changesMade) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri: string) => {
    setIsLoading(true);
    try {
      const { authService } = await import('../../../src/api');

      // Upload to Cloudinary via backend
      const response = await authService.uploadAvatar(uri);

      // Update local state
      setProfileImage(response.profileImage);

      // Refresh context to update app-wide
      await refreshProfile();

      Toast.show({
        type: 'success',
        text1: 'Profile photo updated',
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to upload image',
        text2: error.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!userData.username.trim()) {
      Toast.show({ type: 'error', text1: 'Username is required' });
      return false;
    }
    if (!userData.name.trim()) {
      Toast.show({ type: 'error', text1: 'Name is required' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { authService } = await import('../../../src/api');

      // Prepare payload
      const updatePayload = {
        username: userData.username,
        fullName: userData.name, // Map back to fullName
        bio: userData.bio,
        location: userData.location,
        phone: userData.phone,
      };

      await authService.updateProfile(updatePayload);

      // Update original data to current
      setOriginalData({ ...userData });
      setChangesMade(false);

      // Refresh global user state
      await refreshProfile();

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
      });

      // Optional: Go back after save
      // router.back();
    } catch (error: any) {
      console.error('Profile update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile',
        text2: error.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButtonHeader, !changesMade && styles.disabledButton]}
          disabled={!changesMade || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={[styles.saveButtonText, !changesMade && styles.disabledButtonText]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]}>
                  <Ionicons name="person" size={40} color="#999" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={userData.username}
                onChangeText={(text) => handleInputChange('username', text)}
                placeholder="Username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={userData.bio}
                onChangeText={(text) => handleInputChange('bio', text)}
                placeholder="Write a short bio..."
                multiline
                numberOfLines={4}
                maxLength={150}
              />
              <Text style={styles.charCount}>{userData.bio.length}/150</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={userData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="Your location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={userData.email}
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  disabledButtonText: {
    color: '#ccc',
  },
  disabledButton: {
    // opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  spacer: {
    height: 40,
  },
});