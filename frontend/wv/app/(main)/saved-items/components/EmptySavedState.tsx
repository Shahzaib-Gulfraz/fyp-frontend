import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Heart } from 'lucide-react-native';
import { Button } from 'react-native-paper';

interface EmptySavedStateProps {
  onExplore: () => void;
}

const EmptySavedState: React.FC<EmptySavedStateProps> = ({ onExplore }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.emptyHeart, { backgroundColor: colors.surface }]}>
        <Heart size={64} color={colors.textTertiary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>No saved items yet</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Items you save will appear here. Start exploring and save your favorite outfits!
      </Text>
      <Button
        mode="contained"
        onPress={onExplore}
        style={[styles.button, { backgroundColor: colors.primary }]}
        labelStyle={styles.buttonText}
      >
        Explore Now
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyHeart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptySavedState;