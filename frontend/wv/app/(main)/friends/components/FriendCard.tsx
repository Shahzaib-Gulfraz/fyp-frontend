import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { UserPlus, UserMinus, MessageCircle, MoreVertical } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface FriendCardProps {
    friend: {
        id?: string;
        _id?: string;
        username: string;
        fullName: string;
        profileImage?: { url: string } | string;
        bio?: string;
        isOnline?: boolean;
        lastSeen?: string | Date;
        mutualFriendsCount?: number;
        friendsCount?: number;
    };
    showAddButton?: boolean;
    onAdd?: () => void;
    onRemove?: () => void;
    onPress?: () => void;
    onMessage?: () => void;
}

/**
 * FriendCard Component
 * Displays a friend or friend suggestion card
 */
const FriendCard: React.FC<FriendCardProps> = ({
    friend,
    showAddButton = false,
    onAdd,
    onRemove,
    onPress,
    onMessage,
}) => {
    const { colors } = useTheme();
    const { spacing, radius, fonts } = appTheme.tokens;
    const [showMenu, setShowMenu] = useState(false);

    const handleRemove = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Are you sure you want to remove ${friend.fullName} from your friends?`);
            if (confirmed) {
                onRemove?.();
                setShowMenu(false);
            }
        } else {
            Alert.alert(
                'Remove Friend',
                `Are you sure you want to remove ${friend.fullName} from your friends?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                            onRemove?.();
                            setShowMenu(false);
                        },
                    },
                ]
            );
        }
    };

    const getStatusColor = () => {
        if (friend.isOnline) return colors.success;
        return colors.textTertiary;
    };

    const getLastSeenText = () => {
        if (friend.isOnline) return 'Online';
        if (!friend.lastSeen) return 'Offline';

        const lastSeen = new Date(friend.lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - lastSeen.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return 'Offline';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderRadius: radius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                },
            ]}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {/* Profile Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: typeof friend.profileImage === 'string'
                                ? friend.profileImage
                                : friend.profileImage?.url || 'https://placehold.co/60x60/png?text=User',
                        }}
                        style={[
                            styles.profileImage,
                            { borderRadius: radius.full },
                        ]}
                    />
                    {/* Online Status Indicator */}
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor: getStatusColor(),
                                borderColor: colors.surface,
                            },
                        ]}
                    />
                </View>

                {/* User Info */}
                <View style={styles.info}>
                    <Text
                        style={[
                            styles.name,
                            { color: colors.text, fontFamily: fonts.semiBold },
                        ]}
                        numberOfLines={1}
                    >
                        {friend.fullName}
                    </Text>
                    <Text
                        style={[
                            styles.username,
                            { color: colors.textSecondary, fontFamily: fonts.regular },
                        ]}
                        numberOfLines={1}
                    >
                        @{friend.username}
                    </Text>
                    {friend.bio && (
                        <Text
                            style={[
                                styles.bio,
                                { color: colors.textTertiary, fontFamily: fonts.regular },
                            ]}
                            numberOfLines={1}
                        >
                            {friend.bio}
                        </Text>
                    )}
                    {!showAddButton && (
                        <Text
                            style={[
                                styles.status,
                                {
                                    color: friend.isOnline ? colors.success : colors.textTertiary,
                                    fontFamily: fonts.medium,
                                },
                            ]}
                        >
                            {getLastSeenText()}
                        </Text>
                    )}
                    {showAddButton && friend.mutualFriendsCount && friend.mutualFriendsCount > 0 && (
                        <Text
                            style={[
                                styles.mutualFriends,
                                { color: colors.textSecondary, fontFamily: fonts.regular },
                            ]}
                        >
                            {friend.mutualFriendsCount} mutual friend{friend.mutualFriendsCount !== 1 ? 's' : ''}
                        </Text>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {showAddButton ? (
                        <TouchableOpacity
                            onPress={onAdd}
                            style={[
                                styles.addButton,
                                {
                                    backgroundColor: colors.primary,
                                    borderRadius: radius.md,
                                    padding: spacing.sm,
                                },
                            ]}
                        >
                            <UserPlus size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <>
                            {onMessage && (
                                <TouchableOpacity
                                    onPress={onMessage}
                                    style={[
                                        styles.actionButton,
                                        {
                                            backgroundColor: colors.primary + '20',
                                            borderRadius: radius.md,
                                            padding: spacing.sm,
                                            marginRight: spacing.xs,
                                        },
                                    ]}
                                >
                                    <MessageCircle size={20} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => setShowMenu(!showMenu)}
                                style={[
                                    styles.actionButton,
                                    {
                                        backgroundColor: colors.background,
                                        borderRadius: radius.md,
                                        padding: spacing.sm,
                                    },
                                ]}
                            >
                                <MoreVertical size={20} color={colors.text} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* Menu */}
            {showMenu && !showAddButton && (
                <View
                    style={[
                        styles.menu,
                        {
                            backgroundColor: colors.background,
                            borderRadius: radius.md,
                            marginTop: spacing.sm,
                            padding: spacing.xs,
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={handleRemove}
                        style={[
                            styles.menuItem,
                            {
                                padding: spacing.sm,
                                borderRadius: radius.sm,
                            },
                        ]}
                    >
                        <UserMinus size={18} color={colors.error} />
                        <Text
                            style={[
                                styles.menuText,
                                {
                                    color: colors.error,
                                    fontFamily: fonts.medium,
                                    marginLeft: spacing.sm,
                                },
                            ]}
                        >
                            Remove Friend
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 60,
        height: 60,
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        marginBottom: 2,
    },
    username: {
        fontSize: 14,
        marginBottom: 2,
    },
    bio: {
        fontSize: 12,
        marginTop: 2,
    },
    status: {
        fontSize: 12,
        marginTop: 4,
    },
    mutualFriends: {
        fontSize: 12,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    addButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButton: {},
    menu: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 14,
    },
});

export default FriendCard;
