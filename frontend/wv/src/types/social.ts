export interface Comment {
    _id: string;
    userId: {
        _id: string;
        username: string;
        fullName: string;
        profileImage?: string;
    };
    text: string;
    createdAt: string;
}

export interface Post {
    _id: string;
    userId: {
        _id: string;
        username: string;
        fullName: string;
        profileImage?: string;
    };
    image: string;
    caption?: string;
    likes: Array<{ _id: string; username: string; fullName: string; profileImage?: string } | string>;
    comments: Comment[];
    productId?: string;
    tryOnId?: string;
    visibility: 'public' | 'friends' | 'private';
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    // Computed client-side
    isLiked?: boolean;
    likesCount?: number;
    commentsCount?: number;
}
