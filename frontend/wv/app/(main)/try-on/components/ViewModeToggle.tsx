import React from 'react';
import { View, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Chip } from 'react-native-paper';
import { Grid, Camera } from 'lucide-react-native';
import { ViewMode } from '../types';

interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ mode, onModeChange }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant || colors.surface + '20' }]}>
      <TouchableWithoutFeedback onPress={() => onModeChange('3d')}>
        <View style={[
          styles.toggleOption,
          mode === '3d' && [
            styles.activeOption,
            { backgroundColor: colors.primary }
          ]
        ]}>
          <Grid 
            size={18} 
            color={mode === '3d' ? colors.onPrimary || '#FFFFFF' : colors.textSecondary} 
            style={styles.icon}
          />
          <Animated.Text style={[
            styles.optionText,
            { color: mode === '3d' ? colors.onPrimary || '#FFFFFF' : colors.textSecondary },
            mode === '3d' && styles.activeOptionText
          ]}>
            3D
          </Animated.Text>
        </View>
      </TouchableWithoutFeedback>
      
      <TouchableWithoutFeedback onPress={() => onModeChange('ar')}>
        <View style={[
          styles.toggleOption,
          mode === 'ar' && [
            styles.activeOption,
            { backgroundColor: colors.primary }
          ]
        ]}>
          <Camera 
            size={18} 
            color={mode === 'ar' ? colors.onPrimary || '#FFFFFF' : colors.textSecondary}
            style={styles.icon}
          />
          <Animated.Text style={[
            styles.optionText,
            { color: mode === 'ar' ? colors.onPrimary || '#FFFFFF' : colors.textSecondary },
            mode === 'ar' && styles.activeOptionText
          ]}>
            AR
          </Animated.Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    alignSelf: 'center',
    minWidth: 200,
    maxWidth: 300,
    backgroundColor: '#F1F3F5', // fallback
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  activeOption: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeOptionText: {
    fontWeight: '700',
  },
});

export default ViewModeToggle;