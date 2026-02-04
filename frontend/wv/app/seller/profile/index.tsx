import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import { shopService } from '@/src/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ShopData {
  _id: string;
  shopName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  description?: string;
  website?: string;
  logo?: { url: string; publicId: string };
  banner?: { url: string; publicId: string };
}

const ShopProfileScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    shopName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    description: '',
    website: '',
  });
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);

  useEffect(() => {
    fetchShopProfile();
  }, []);

  const fetchShopProfile = async () => {
    try {
      setLoading(true);
      const response = await shopService.getMyShop();
      const shop = response.shop;
      setShopData(shop);
      
      // Initialize form data
      setFormData({
        shopName: shop.shopName || '',
        email: shop.email || '',
        phone: shop.phone || '',
        address: shop.address || '',
        city: shop.city || '',
        country: shop.country || '',
        zipCode: shop.zipCode || '',
        description: shop.description || '',
        website: shop.website || '',
      });
    } catch (error: any) {
      console.error('Failed to fetch shop profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'logo' | 'banner') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'logo') {
        setLogoUri(result.assets[0].uri);
      } else {
        setBannerUri(result.assets[0].uri);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);

      // Prepare shop data (text fields only)
      const shopDataToSend: any = {};
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value) {
          shopDataToSend[key] = value;
        }
      });

      // Prepare images object
      const images: any = {};
      if (logoUri) {
        images.logo = logoUri;
      }
      if (bannerUri) {
        images.banner = bannerUri;
      }

      const response = await shopService.updateShop(shopData!._id, shopDataToSend, images);
      
      setShopData(response.shop);
      setLogoUri(null);
      setBannerUri(null);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!shopData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: shopData.banner?.url || 'https://placehold.co/600x200/png' }}
            style={styles.banner}
          />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: shopData.logo?.url || 'https://placehold.co/150/png' }}
            style={[styles.logo, { borderColor: colors.background }]}
          />
        </View>

        {/* Shop Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.shopName, { color: colors.text }]}>
            {shopData.shopName}
          </Text>
          
          {shopData.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {shopData.description}
            </Text>
          )}

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {shopData.email}
              </Text>
            </View>

            {shopData.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {shopData.phone}
                </Text>
              </View>
            )}

            {shopData.website && (
              <View style={styles.infoRow}>
                <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {shopData.website}
                </Text>
              </View>
            )}
          </View>

          {/* Location */}
          {(shopData.address || shopData.city) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  {shopData.address && (
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      {shopData.address}
                    </Text>
                  )}
                  {(shopData.city || shopData.country) && (
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      {[shopData.city, shopData.country].filter(Boolean).join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Banner Image */}
              <View style={styles.imageSection}>
                <Text style={[styles.label, { color: colors.text }]}>Banner Image</Text>
                <TouchableOpacity 
                  style={styles.imagePickerButton}
                  onPress={() => pickImage('banner')}
                >
                  <Image
                    source={{ uri: bannerUri || shopData.banner?.url || 'https://placehold.co/600x200/png' }}
                    style={styles.bannerPreview}
                  />
                  <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.imageOverlayText}>Change Banner</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Logo Image */}
              <View style={styles.imageSection}>
                <Text style={[styles.label, { color: colors.text }]}>Logo</Text>
                <TouchableOpacity 
                  style={styles.logoPickerButton}
                  onPress={() => pickImage('logo')}
                >
                  <Image
                    source={{ uri: logoUri || shopData.logo?.url || 'https://placehold.co/150/png' }}
                    style={styles.logoPreview}
                  />
                  <View style={styles.logoOverlay}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Shop Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.shopName}
                  onChangeText={(text) => setFormData({ ...formData, shopName: text })}
                  placeholder="Enter shop name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Tell customers about your shop"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Email address"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Website</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.website}
                  onChangeText={(text) => setFormData({ ...formData, website: text })}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Street address"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>City</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Country</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                  placeholder="Country"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>ZIP Code</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={formData.zipCode}
                  onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                  placeholder="ZIP / Postal code"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  infoContainer: {
    padding: 20,
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  imagePickerButton: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  logoPickerButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default ShopProfileScreen;
