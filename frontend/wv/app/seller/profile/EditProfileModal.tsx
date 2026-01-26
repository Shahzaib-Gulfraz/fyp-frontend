import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import {
    Modal,
    Portal,
    Text,
    Button,
    TextInput,
    Card,
    IconButton,
    Avatar,
    Divider,
    Switch,
    HelperText,
} from 'react-native-paper';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ShopProfile {
    name: string;
    description: string;
    contact: {
        email: string;
        phone: string;
        address: string;
        website: string;
    };
    hours: { [key: string]: string };
    social: { instagram: string; facebook: string; twitter: string };
    settings: { notifications: boolean; showOnline: boolean; privateAccount: boolean };
    avatar?: string;
    banner?: string;
    ownerName?: string;
    stats?: any; // or define proper Stats type
    [key: string]: any; // allow extra fields
}


interface EditProfileModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSave: (profile: any) => void; // temporarily use 'any' or extend ShopProfile
    initialProfile: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onDismiss,
    onSave,
    initialProfile,
}) => {
    const { theme, tokens } = useTheme();
    const styles = makeStyles(theme, tokens);

    const [profile, setProfile] = useState<ShopProfile>({
        ...initialProfile,
        settings: initialProfile?.settings || {
            notifications: true,
            showOnline: true,
            privateAccount: false,
        }
    });
    const [avatarUri, setAvatarUri] = useState<string | null>(initialProfile.avatar || initialProfile.logo?.url || null);
    const [bannerUri, setBannerUri] = useState<string | null>(initialProfile.banner || initialProfile.bannerImage || null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Reset form whenever modal opens
    useEffect(() => {
        setProfile(initialProfile);
        setAvatarUri(initialProfile.avatar || initialProfile.logo?.url || null);
        setBannerUri(initialProfile.banner || initialProfile.bannerImage || null);
        setErrors({});
    }, [visible, initialProfile]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!profile.name.trim()) {
            newErrors.name = 'Shop name is required';
        }

        if (!profile.contact.email.includes('@')) {
            newErrors.email = 'Invalid email address';
        }

        if (profile.contact.phone && !/^\d{10,}$/.test(profile.contact.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const pickImage = async (type: 'avatar' | 'banner') => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: type === 'avatar' ? [1, 1] : [16, 9],
                quality: 0.8,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                if (type === 'avatar') {
                    setAvatarUri(uri);
                } else {
                    setBannerUri(uri);
                }
            }
        } catch {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSave = () => {
        if (!validateForm()) return;

        setIsLoading(true);

        const updatedProfile = {
            ...profile,
            avatar: avatarUri || profile.avatar,
            banner: bannerUri || profile.banner,
        };

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onSave(updatedProfile);
            onDismiss();
            Alert.alert('Success', 'Profile updated successfully');
        }, 1500);
    };

    const updateContact = (field: keyof typeof profile.contact, value: string) => {
        setProfile(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const updateSocial = (field: keyof typeof profile.social, value: string) => {
        setProfile(prev => ({ ...prev, social: { ...prev.social, [field]: value } }));
    };

    const updateSettings = (field: keyof typeof profile.settings, value: boolean) => {
        setProfile(prev => ({ ...prev, settings: { ...prev.settings, [field]: value } }));
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Edit Shop Profile</Text>
                        <IconButton icon="close" iconColor={theme.colors.text} size={24} onPress={onDismiss} />
                    </View>

                    {/* Banner Section */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Banner Image</Text>
                            <TouchableOpacity style={styles.bannerUpload} onPress={() => pickImage('banner')}>
                                {bannerUri ? (
                                    <ImageBackground source={{ uri: bannerUri }} style={styles.bannerPreview} />
                                ) : (
                                    <View style={styles.bannerPlaceholder}>
                                        <Ionicons name="image-outline" size={40} color={theme.colors.textSecondary} />
                                        <Text style={styles.uploadText}>Tap to upload banner</Text>
                                        <Text style={styles.uploadSubtext}>Recommended: 1200×300px</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Card.Content>
                    </Card>

                    {/* Avatar Section */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Profile Picture</Text>
                            <View style={styles.avatarSection}>
                                <TouchableOpacity onPress={() => pickImage('avatar')}>
                                    <Avatar.Image
                                        size={100}
                                        source={avatarUri ? { uri: avatarUri } : { uri: 'https://placehold.co/100' }}
                                        style={styles.avatar}
                                    />
                                    <View style={[styles.avatarOverlay, { opacity: 0.7 }]}>
                                        <Ionicons name="camera" size={24} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.avatarInfo}>
                                    <Text style={styles.avatarTitle}>Profile Photo</Text>
                                    <Text style={styles.avatarDescription}>
                                        Upload a clear photo of your shop logo or storefront
                                    </Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Basic Info */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                            <TextInput
                                label="Shop Name *"
                                value={profile.name}
                                onChangeText={text => setProfile(prev => ({ ...prev, name: text }))}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.name}
                            />
                            <HelperText type="error" visible={!!errors.name}>
                                {errors.name}
                            </HelperText>

                            <TextInput
                                label="Description"
                                value={profile.description}
                                onChangeText={text => setProfile(prev => ({ ...prev, description: text }))}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                style={styles.textArea}
                            />
                        </Card.Content>
                    </Card>

                    {/* Contact Info */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            <TextInput
                                label="Email *"
                                value={profile.contact.email}
                                onChangeText={text => updateContact('email', text)}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                error={!!errors.email}
                            />
                            <HelperText type="error" visible={!!errors.email}>
                                {errors.email}
                            </HelperText>

                            <TextInput
                                label="Phone Number"
                                value={profile.contact.phone}
                                onChangeText={text => updateContact('phone', text)}
                                mode="outlined"
                                keyboardType="phone-pad"
                                style={styles.input}
                                error={!!errors.phone}
                            />
                            <HelperText type="error" visible={!!errors.phone}>
                                {errors.phone}
                            </HelperText>

                            <TextInput
                                label="Address"
                                value={profile.contact.address}
                                onChangeText={text => updateContact('address', text)}
                                mode="outlined"
                                style={styles.input}
                            />

                            <TextInput
                                label="Website"
                                value={profile.contact.website}
                                onChangeText={text => updateContact('website', text)}
                                mode="outlined"
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </Card.Content>
                    </Card>

                    {/* Social Media */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Social Media</Text>
                            {(['instagram', 'facebook', 'twitter'] as const).map(platform => (
                                <View key={platform} style={styles.socialInputContainer}>
                                    <Ionicons
                                        name={`logo-${platform}`}
                                        size={20}
                                        color={platform === 'instagram' ? '#E4405F' : platform === 'facebook' ? '#1877F2' : '#1DA1F2'}
                                    />
                                    <TextInput
                                        placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} username`}
                                        value={profile.social[platform]}
                                        onChangeText={text => updateSocial(platform, text)}
                                        mode="outlined"
                                        style={[styles.input, styles.socialInput]}
                                    />
                                </View>
                            ))}
                        </Card.Content>
                    </Card>

                    {/* Shop Settings */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Shop Settings</Text>
                            {(['notifications', 'showOnline', 'privateAccount'] as const).map(setting => (
                                <View key={setting}>
                                    <View style={styles.settingRow}>
                                        <View style={styles.settingInfo}>
                                            <Text style={styles.settingTitle}>
                                                {setting === 'notifications'
                                                    ? 'Order Notifications'
                                                    : setting === 'showOnline'
                                                        ? 'Show Online Status'
                                                        : 'Private Account'}
                                            </Text>
                                            <Text style={styles.settingDescription}>
                                                {setting === 'notifications'
                                                    ? 'Get notified for new orders'
                                                    : setting === 'showOnline'
                                                        ? "Display when you're available"
                                                        : 'Approve followers manually'}
                                            </Text>
                                        </View>
                                        <Switch
                                            value={profile?.settings?.[setting] ?? true}
                                            onValueChange={value => updateSettings(setting, value)}
                                            color={theme.colors.primary}
                                        />
                                    </View>
                                    {setting !== 'privateAccount' && <Divider style={styles.divider} />}
                                </View>
                            ))}
                        </Card.Content>
                    </Card>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <Button mode="outlined" onPress={onDismiss} style={[styles.button, styles.cancelButton]} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button mode="contained" onPress={handleSave} style={[styles.button, styles.saveButton]} loading={isLoading} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </View>
                </ScrollView>
            </Modal>
        </Portal>
    );
};

const makeStyles = (theme: any, tokens: any) =>
    StyleSheet.create({
        modalContainer: {
            backgroundColor: theme.colors.background,
            marginHorizontal: 20,
            marginVertical: 40,
            borderRadius: tokens.radius.lg,
            maxHeight: '90%',
        },
        scrollView: {
            padding: tokens.spacing.md,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing.lg,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.text,
        },
        section: {
            marginBottom: tokens.spacing.md,
            backgroundColor: theme.colors.surface,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: tokens.spacing.md,
        },
        bannerUpload: {
            height: 120,
            borderRadius: tokens.radius.sm,
            overflow: 'hidden',
            backgroundColor: theme.colors.border,
        },
        bannerPreview: {
            width: '100%',
            height: '100%',
        },
        bannerPlaceholder: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        uploadText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: tokens.spacing.sm,
        },
        uploadSubtext: {
            fontSize: 12,
            color: theme.colors.textTertiary,
            marginTop: 2,
        },
        avatarSection: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatar: {
            borderWidth: 2,
            borderColor: theme.colors.background,
        },
        avatarOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarInfo: {
            marginLeft: tokens.spacing.md,
            flex: 1,
        },
        avatarTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        avatarDescription: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            lineHeight: 16,
        },
        input: {
            marginBottom: tokens.spacing.sm,
            backgroundColor: theme.colors.background,
        },
        textArea: {
            marginBottom: tokens.spacing.sm,
            backgroundColor: theme.colors.background,
            minHeight: 80,
        },
        socialInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: tokens.spacing.sm,
        },
        socialInput: {
            flex: 1,
            marginLeft: tokens.spacing.sm,
            backgroundColor: theme.colors.background,
        },
        settingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: tokens.spacing.sm,
        },
        settingInfo: {
            flex: 1,
            marginRight: tokens.spacing.md,
        },
        settingTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 2,
        },
        settingDescription: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        divider: {
            backgroundColor: theme.colors.divider,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: tokens.spacing.sm,
            marginBottom: tokens.spacing.md,
        },
        button: {
            flex: 1,
        },
        cancelButton: {
            marginRight: tokens.spacing.sm,
            borderColor: theme.colors.error,
        },
        saveButton: {
            marginLeft: tokens.spacing.sm,
            backgroundColor: theme.colors.primary,
        },
    });

export default EditProfileModal;
