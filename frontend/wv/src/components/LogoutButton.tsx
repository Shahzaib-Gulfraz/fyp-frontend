import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Import authService
                            const { authService } = await import('../api');

                            // Clear auth data
                            await authService.logout();

                            // Navigate to login
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            // Still navigate to login even if there's an error
                            router.replace('/(auth)/login');
                        }
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.text}>Logout</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFF1F0',
        borderRadius: 8,
        marginHorizontal: 16,
    },
    text: {
        marginLeft: 8,
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
});
