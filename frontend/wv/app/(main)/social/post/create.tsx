import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import postService from '@/src/api/postService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen() {
    const { theme, tokens } = useTheme();
    const { colors } = theme;
    const { spacing, radius, fonts } = tokens;
    const router = useRouter();
    const params = useLocalSearchParams();

    // Image can come from Try-On (params) or Picker
    const [image, setImage] = useState<string | null>(params.image as string || null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('friends');

    useEffect(() => {
        if (params.image) {
            setImage(params.image as string);
        }
    }, [params.image]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square posts preference
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = async () => {
        if (!image) {
            Alert.alert('Error', 'Please select an image');
            return;
        }

        setLoading(true);
        try {
            const tryOnId = params.tryOnId && params.tryOnId.length === 24 ? params.tryOnId : undefined;
            const productId = params.productId && params.productId.length === 24 ? params.productId : undefined;

            await postService.createPost({
                image,
                caption,
                visibility,
                tryOnId: tryOnId as string,
                productId: productId as string,
            });

            if (Platform.OS === 'web') {
                alert('Post created successfully!');
                router.replace('/social/feed');
            } else {
                Alert.alert(
                    'Success',
                    'Post created successfully!',
                    [{ text: 'OK', onPress: () => router.replace('/social/feed') }]
                );
            }
        } catch (error: any) {
            console.error('Create post error:', error);
            Alert.alert('Error', error.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Stack.Screen
                options={{
                    title: 'New Post',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handlePost}
                            disabled={loading || !image}
                            style={{ opacity: loading || !image ? 0.5 : 1 }}
                        >
                            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                                Share
                            </Text>
                        </TouchableOpacity>
                    ),
                    headerTintColor: colors.text,
                    headerStyle: { backgroundColor: colors.surface },
                }}
            />

            <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
                {/* Image Section */}
                <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
                    {image ? (
                        <Image source={{ uri: image }} style={[styles.image, { borderRadius: radius.lg }]} />
                    ) : (
                        <TouchableOpacity onPress={pickImage} style={styles.placeholder}>
                            <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>Tap to select image</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Attached Product Indicator */}
                {params.productId && (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        padding: 12,
                        borderRadius: radius.md,
                        marginBottom: spacing.lg,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}>
                        <Ionicons name="pricetag" size={20} color={colors.primary} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Attached Product</Text>
                            <Text style={{ fontWeight: 'bold', color: colors.text }}>
                                {params.productName || 'Product'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Caption Input */}
                <TextInput
                    style={[styles.input, {
                        color: colors.text,
                        borderBottomColor: colors.border,
                        fontSize: 16
                    }]}
                    placeholder="Write a caption..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                />

                {/* Visibility Settings - Simplified for now */}
                <View style={{ marginTop: spacing.xl }}>
                    <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>Visibility</Text>
                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        {['public', 'friends', 'private'].map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                onPress={() => setVisibility(mode as any)}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 20,
                                    backgroundColor: visibility === mode ? colors.primary : colors.surface,
                                    borderWidth: 1,
                                    borderColor: visibility === mode ? colors.primary : colors.border
                                }}
                            >
                                <Text style={{
                                    color: visibility === mode ? '#fff' : colors.text,
                                    textTransform: 'capitalize'
                                }}>
                                    {mode}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Explicit Share Button (Fallback if header is missing) */}
                <TouchableOpacity
                    onPress={handlePost}
                    disabled={loading || !image}
                    style={{
                        backgroundColor: loading || !image ? colors.disabled : colors.primary,
                        paddingVertical: 16,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        marginTop: spacing.xl,
                        marginBottom: spacing.xl
                    }}
                >
                    <Text style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 16
                    }}>
                        {loading ? 'Sharing...' : 'Share Post'}
                    </Text>
                </TouchableOpacity>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        alignItems: 'center',
    },
    changeOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    changeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    input: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
