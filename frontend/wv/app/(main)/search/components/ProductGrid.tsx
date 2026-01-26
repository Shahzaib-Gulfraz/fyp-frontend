import React from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { Play, Heart } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';

const COLUMN_COUNT = 3;

export default function ProductGrid({ products }: { products: any[] }) {
  useTheme();

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          marginRight: (index + 1) % COLUMN_COUNT === 0 ? 0 : 1,
          marginBottom: 1,
        }
      ]}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: typeof item.mediaUrl === 'string' ? item.mediaUrl : item.mediaUrl?.url || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Overlay for video/trending indicators */}
      <View style={styles.overlay}>
        {item.type === 'video' && (
          <View style={styles.videoIcon}>
            <Play size={16} color="#fff" fill="#fff" />
          </View>
        )}

        {/* Like count overlay (Instagram-style) */}
        <View style={styles.bottomOverlay}>
          <View style={styles.likeContainer}>
            <Heart size={12} color="#fff" fill="#fff" />
            <Text style={styles.likeCount}>{(Math.random() * 1000).toFixed(0)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={COLUMN_COUNT}
      scrollEnabled={false}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 0,
  },
  columnWrapper: {
    marginBottom: 1,
  },
  item: {
    flex: 1,
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  videoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
  },
  likeCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});