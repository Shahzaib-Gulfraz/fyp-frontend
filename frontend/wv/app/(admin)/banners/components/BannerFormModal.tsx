import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton, Switch, ActivityIndicator } from 'react-native-paper';
import { useTheme } from '@/src/context/ThemeContext';
import { bannerService } from '@/src/api';
import * as ImagePicker from 'expo-image-picker';

interface BannerFormModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: () => void;
    banner: any | null;
}

const BannerFormModal: React.FC<BannerFormModalProps> = ({ visible, onDismiss, onSubmit, banner }) => {
    const { colors } = useTheme();

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [imageUri, setImageUri] = useState(''); // Stores local URI or remote URL
    const [link, setLink] = useState('/search');
    const [ctaText, setCtaText] = useState('Shop Now');
    const [order, setOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (banner) {
            setTitle(banner.title);
            setSubtitle(banner.subtitle || '');
            setImageUri(banner.imageUrl);
            setLink(banner.link || '/search');
            setCtaText(banner.ctaText || 'Shop Now');
            setOrder(String(banner.order || 0));
            setIsActive(banner.isActive);
        } else {
            setTitle('');
            setSubtitle('');
            setImageUri('');
            setLink('/search');
            setCtaText('Shop Now');
            setOrder('0');
            setIsActive(true);
        }
    }, [banner, visible]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9], // Banner aspect ratio
                quality: 0.8,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSave = async () => {
        if (!title) {
            Alert.alert('Error', 'Title is required');
            return;
        }
        if (!imageUri) {
            Alert.alert('Error', 'Banner image is required');
            return;
        }

        setLoading(true);

        // Prepare simple data fields (image is passed separately)
        const bannerData = {
            title,
            subtitle,
            link,
            ctaText,
            order: Number(order),
            isActive: String(isActive) // FormData expects strings usually
        };

        try {
            if (banner) {
                // Determine if we need to upload a new image
                const isNewImage = !imageUri.startsWith('http');
                await bannerService.updateBanner(banner._id, bannerData, isNewImage ? imageUri : null);
                Alert.alert('Success', 'Banner updated');
            } else {
                await bannerService.createBanner(bannerData, imageUri);
                Alert.alert('Success', 'Banner created');
            }
            onSubmit();
        } catch (error: any) {
            console.error('Save banner error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save banner');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <IconButton icon="close" onPress={onDismiss} />
                    <Text style={[styles.title, { color: colors.text }]}>
                        {banner ? 'Edit Banner' : 'New Banner'}
                    </Text>
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={loading}
                        disabled={loading}
                    >
                        Save
                    </Button>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Image Picker */}
                    <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { borderColor: colors.border }]}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.placeholder}>
                                <IconButton icon="camera" size={40} iconColor={colors.primary} />
                                <Text style={{ color: colors.text }}>Tap to upload Banner Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        label="Title (Required)"
                        value={title}
                        onChangeText={setTitle}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Subtitle"
                        value={subtitle}
                        onChangeText={setSubtitle}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="CTA Text"
                        value={ctaText}
                        onChangeText={setCtaText}
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Link Route"
                        value={link}
                        onChangeText={setLink}
                        mode="outlined"
                        style={styles.input}
                    />

                    <View style={styles.row}>
                        <TextInput
                            label="Order Priority"
                            value={order}
                            onChangeText={setOrder}
                            keyboardType="numeric"
                            mode="outlined"
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                        />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: colors.text, marginBottom: 5 }}>Active?</Text>
                            <Switch value={isActive} onValueChange={setIsActive} />
                        </View>
                    </View>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: 'transparent' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    imagePicker: {
        width: '100%',
        height: 180,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
    }
});

export default BannerFormModal;
