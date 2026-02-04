import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, Image as ImageIcon, Upload, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import shopService from '@/src/api/shopService';

export default function StorefrontSettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shopData, setShopData] = useState<any>(null);

    // Form State
    const [online, setOnline] = useState(true);
    const [address, setAddress] = useState({ street: '', city: '', zip: '' });
    const [images, setImages] = useState({ logo: null as string | null, banner: null as string | null });

    useEffect(() => {
        fetchShopProfile();
    }, []);

    const fetchShopProfile = async () => {
        try {
            setLoading(true);
            const data = await shopService.getMyShop();
            // Handle both structure scenarios just in case
            const shop = data.shop || data;
            setShopData(shop);

            // Map settings.showOnline instead of isActive (which is read-only or admin-only)
            const showOnline = shop.settings?.showOnline ?? shop.isActive ?? true;
            setOnline(showOnline);

            setAddress({
                street: shop.address || '',
                city: shop.city || '',
                zip: shop.zipCode || ''
            });
            setImages({
                logo: shop.logo?.url || shop.logo || null,
                banner: shop.banner?.url || shop.banner || null
            });
        } catch (error) {
            console.error('Failed to fetch shop profile', error);
            Alert.alert('Error', 'Failed to load shop settings');
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

        if (!result.canceled) {
            setImages(prev => ({ ...prev, [type]: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Construct settings object (merge with existing or create new)
            const currentSettings = shopData.settings || {};
            const newSettings = { ...currentSettings, showOnline: online };

            // Prepare update payload
            const updatePayload = {
                settings: JSON.stringify(newSettings), // Backend expects JSON string for object fields in FormData usually, or handle in service
                address: address.street,
                city: address.city,
                zipCode: address.zip,
                // Note: isActive is not in allowedFields on backend, so we rely on settings.showOnline
            };

            const imagePayload = {
                logo: images.logo !== (shopData.logo?.url || shopData.logo) ? images.logo : undefined,
                banner: images.banner !== (shopData.banner?.url || shopData.banner) ? images.banner : undefined,
            };

            console.log('F-DEBUG: Sending update:', { updatePayload, imagePayload });

            await shopService.updateShop(shopData._id, updatePayload, imagePayload);
            Alert.alert('Success', 'Shop settings updated successfully');
            // Refresh local data to sync with server response (optional but good practice)
            fetchShopProfile();
        } catch (error) {
            console.error('Update failed', error);
            Alert.alert('Error', 'Failed to update shop settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.replace('/seller/dashboard')} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Storefront Settings</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 16 }}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Store Status */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Store size={20} color={online ? colors.primary : colors.textSecondary} />
                            <View>
                                <Text style={[styles.label, { color: colors.text }]}>Store Online</Text>
                                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                                    {online ? 'Your shop is visible to customers' : 'Your shop is currently hidden'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={online}
                            onValueChange={setOnline}
                            trackColor={{ true: colors.primary, false: colors.border }}
                        />
                    </View>
                </View>

                {/* Branding */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Branding</Text>
                <View style={[styles.section, { backgroundColor: colors.surface, padding: 16 }]}>

                    {/* Banner */}
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Shop Banner</Text>
                    <TouchableOpacity onPress={() => pickImage('banner')} style={styles.bannerContainer}>
                        {images.banner ? (
                            <Image source={{ uri: typeof images.banner === 'string' ? images.banner : (images.banner as any)?.url || 'https://via.placeholder.com/800x200' }} style={styles.bannerImage} />
                        ) : (
                            <View style={[styles.placeholderBanner, { backgroundColor: colors.background }]}>
                                <ImageIcon size={32} color={colors.textSecondary} />
                                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Tap to upload banner</Text>
                            </View>
                        )}
                        <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                            <Upload size={14} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Logo */}
                    <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 20 }]}>Shop Logo</Text>
                    <View style={{ alignItems: 'flex-start' }}>
                        <TouchableOpacity onPress={() => pickImage('logo')} style={styles.logoContainer}>
                            {images.logo ? (
                                <Image source={{ uri: typeof images.logo === 'string' ? images.logo : (images.logo as any)?.url || 'https://via.placeholder.com/100' }} style={styles.logoImage} />
                            ) : (
                                <View style={[styles.placeholderLogo, { backgroundColor: colors.background }]}>
                                    <ImageIcon size={24} color={colors.textSecondary} />
                                </View>
                            )}
                            <View style={[styles.editBadge, { backgroundColor: colors.primary, right: -4, bottom: -4 }]}>
                                <Upload size={12} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Address */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Shop Location</Text>
                <View style={[styles.section, { backgroundColor: colors.surface, padding: 16 }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Street Address</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                            value={address.street}
                            onChangeText={(text) => setAddress(prev => ({ ...prev, street: text }))}
                            placeholder="123 Fashion St"
                            placeholderTextColor={colors.textSecondary + '80'}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>City</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                value={address.city}
                                onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
                                placeholder="New York"
                                placeholderTextColor={colors.textSecondary + '80'}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Zip Code</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                value={address.zip}
                                onChangeText={(text) => setAddress(prev => ({ ...prev, zip: text }))}
                                placeholder="10001"
                                placeholderTextColor={colors.textSecondary + '80'}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 16 },
    section: { borderRadius: 12, marginBottom: 24, overflow: 'hidden' },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    label: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
    subLabel: { fontSize: 13, marginLeft: 12, marginTop: 2 },

    // Images
    fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    bannerContainer: { width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', position: 'relative' },
    bannerImage: { width: '100%', height: '100%' },
    placeholderBanner: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    logoContainer: { width: 80, height: 80, borderRadius: 40, position: 'relative' },
    logoImage: { width: 80, height: 80, borderRadius: 40 },
    placeholderLogo: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd' },
    editBadge: { position: 'absolute', bottom: 8, right: 8, padding: 6, borderRadius: 20 },

    // Inputs
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
    input: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
});
