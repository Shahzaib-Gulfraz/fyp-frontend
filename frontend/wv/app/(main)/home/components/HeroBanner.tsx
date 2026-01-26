import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { bannerService } from '@/src/api';
// import { useRouter } from 'expo-router'; // Uncomment if using router for CTA

const { width } = Dimensions.get('window');

export const HeroBanner = () => {
    const { colors } = useTheme();
    // const router = useRouter(); 
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannerService.getBanners();
                if (data && data.banners) {
                    setBanners(data.banners);
                }
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading || banners.length === 0) {
        // Fallback or skeleton could go here
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {banners.map((banner, index) => (
                    <View key={banner._id || index} style={styles.slide}>
                        <ImageBackground
                            source={{ uri: typeof banner.imageUrl === 'string' ? banner.imageUrl : banner.imageUrl?.url || 'https://via.placeholder.com/800x400' }}
                            style={styles.imageBackground}
                            imageStyle={{ borderRadius: 16 }}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                style={styles.gradient}
                            >
                                <View style={styles.content}>
                                    {banner.subtitle && <Text style={styles.subtitle}>{banner.subtitle}</Text>}
                                    <Text style={styles.title}>{banner.title}</Text>
                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: colors.primary }]}
                                        activeOpacity={0.8}
                                    // onPress={() => router.push(banner.link)}
                                    >
                                        <Text style={styles.buttonText}>{banner.ctaText || 'Shop Now'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            {banners.length > 1 && (
                <View style={styles.pagination}>
                    {banners.map((_, index) => {
                        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 16, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={index}
                                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: colors.primary }]}
                            />
                        );
                    })}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 10,
        width: '100%',
        overflow: 'hidden', // Prevents horizontal scroll on web due to scrollbar width mismatch
    },
    slide: {
        width: width, // Full width for carousel logic, but padding inside
        paddingHorizontal: 20,
        height: 200,
    },
    imageBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    gradient: {
        flex: 1,
        borderRadius: 16,
        justifyContent: 'flex-end',
        padding: 20,
    },
    content: {
        alignItems: 'flex-start',
    },
    subtitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        opacity: 0.9,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    }
});
