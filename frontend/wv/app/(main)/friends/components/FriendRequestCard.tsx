import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface FriendRequestCardProps {
    request: {
        requestId: string;
        from: {
            id: string;
            username: string;
            fullName: string;
            profileImage?: { url: string } | string;
            bio?: string;
        };
        createdAt: string | Date;
    };
    onAccept: () => void | Promise<void>;
    onReject: () => void | Promise<void>;
}

/**
 * FriendRequestCard Component
 * Displays a friend request with accept/reject actions
 */
const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ request, onAccept, onReject }) => {
    const { colors } = useTheme();
    const { spacing, radius, fonts } = appTheme.tokens;
    const [accepting, setAccepting] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await onAccept();
        } finally {
            setAccepting(false);
        }
    };

    const handleReject = async () => {
        setRejecting(true);
        try {
            await onReject();
        } finally {
            setRejecting(false);
        }
    };

    const getTimeAgo = () => {
        const createdAt = new Date(request.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return createdAt.toLocaleDateString();
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderRadius: radius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    borderWidth: 1,
                    borderColor: colors.primary + '30',
                },
            ]}
        >
            <View style={styles.content}>
                {/* Profile Image */}
                <Image
                    source={{
                        uri: typeof request.from.profileImage === 'string'
                            ? request.from.profileImage
                            : request.from.profileImage?.url || 'https://placehold.co/60x60/png?text=User',
                    }}
                    style={[
                        styles.profileImage,
                        { borderRadius: radius.full },
                    ]}
                />

                {/* User Info */}
                <View style={styles.info}>
                    <Text
                        style={[
                            styles.name,
                            { color: colors.text, fontFamily: fonts.semiBold },
                        ]}
                        numberOfLines={1}
                    >
                        {request.from.fullName}
                    </Text>
                    <Text
                        style={[
                            styles.username,
                            { color: colors.textSecondary, fontFamily: fonts.regular },
                        ]}
                        numberOfLines={1}
                    >
                        @{request.from.username}
                    </Text>
                    {request.from.bio && (
                        <Text
                            style={[
                                styles.bio,
                                { color: colors.textTertiary, fontFamily: fonts.regular },
                            ]}
                            numberOfLines={1}
                        >
                            {request.from.bio}
                        </Text>
                    )}
                    <Text
                        style={[
                            styles.timeAgo,
                            { color: colors.textTertiary, fontFamily: fonts.regular },
                        ]}
                    >
                        {getTimeAgo()}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View style={[styles.actions, { marginTop: spacing.md }]}>
                <TouchableOpacity
                    onPress={handleAccept}
                    disabled={accepting || rejecting}
                    style={[
                        styles.acceptButton,
                        {
                            backgroundColor: colors.success,
                            borderRadius: radius.md,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.md,
                            flex: 1,
                            marginRight: spacing.xs,
                        },
                    ]}
                >
                    {accepting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Check size={18} color="#fff" />
                            <Text
                                style={[
                                    styles.buttonText,
                                    { color: '#fff', fontFamily: fonts.semiBold, marginLeft: spacing.xs },
                                ]}
                            >
                                Accept
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleReject}
                    disabled={accepting || rejecting}
                    style={[
                        styles.rejectButton,
                        {
                            backgroundColor: colors.background,
                            borderRadius: radius.md,
                            paddingVertical: spacing.sm,
                            paddingHorizontal: spacing.md,
                            flex: 1,
                            marginLeft: spacing.xs,
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {rejecting ? (
                        <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                        <>
                            <X size={18} color={colors.text} />
                            <Text
                                style={[
                                    styles.buttonText,
                                    { color: colors.text, fontFamily: fonts.semiBold, marginLeft: spacing.xs },
                                ]}
                            >
                                Reject
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 60,
        height: 60,
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
    timeAgo: {
        fontSize: 12,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    rejectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
    },
});

export default FriendRequestCard;
