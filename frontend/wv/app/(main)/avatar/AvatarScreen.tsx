import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/context/ThemeContext';
import AvatarHeader from './components/AvatarHeader';
import AvatarPreview from './components/AvatarPreview';
import PoseSelection from './components/PoseSelection';
import QualitySettings from './components/QualitySettings';
import BodyMeasurements from './components/BodyMeasurements';
import ScanCard from './components/ScanCard';
import InstructionCard from './components/InstructionCard';
import QuickCreateCard from './components/QuickCreateCard';
import { DEFAULT_MEASUREMENTS } from './constants/mockData';

const AvatarScreen = () => {
  const { colors, isDark } = useTheme();
  const [hasAvatar, setHasAvatar] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPose, setSelectedPose] = useState('standing');
  const [is3DView, setIs3DView] = useState(true);
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENTS);
  const [avatarQuality, setAvatarQuality] = useState('premium');

  const handleScanBody = () => {
    Alert.alert(
      '3D Body Scan',
      'Stand 2 meters away from camera in well-lit area. Wear fitted clothing for best results.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Scan',
          onPress: () => {
            setIsScanning(true);
            setTimeout(() => {
              setIsScanning(false);
              setHasAvatar(true);
              Alert.alert('Scan Complete', 'Your 3D avatar has been created!');
            }, 3000);
          },
        },
      ]
    );
  };

  const handleSaveAvatar = () => {
    Alert.alert('Success', 'Your avatar has been saved to your profile!');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Avatar',
      'Are you sure you want to reset all measurements?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setMeasurements(DEFAULT_MEASUREMENTS);
          },
        },
      ]
    );
  };

  const updateMeasurement = (key: string, value: number) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  const handleManualSetup = () => {
    setHasAvatar(true);
  };

  const handleRescan = () => {
    setHasAvatar(false);
  };

  if (!hasAvatar) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        <AvatarHeader
          title="Create Your Avatar"
          subtitle="Your digital twin for virtual try-ons"
          hasAvatar={false}
        />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Placeholder */}
          <LinearGradient
            colors={[colors.primary, colors.primary + 'DD']}
            style={{
              width: 180,
              height: 180,
              borderRadius: 90,
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              alignSelf: 'center',
              marginTop: 30,
              marginBottom: 30,
            }}
          >
            {/* This would be replaced with a proper 3D avatar */}
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          </LinearGradient>

          <InstructionCard />
          <ScanCard isScanning={isScanning} onScanPress={handleScanBody} />
          <QuickCreateCard onManualSetup={handleManualSetup} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <AvatarHeader
        title="My Avatar"
        subtitle="Edit and customize your 3D model"
        hasAvatar={true}
        onReset={handleReset}
        onSave={handleSaveAvatar}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <AvatarPreview
          is3DView={is3DView}
          avatarQuality={avatarQuality}
          measurements={measurements}
          onToggleView={() => setIs3DView(!is3DView)}
        />

        <PoseSelection
          selectedPose={selectedPose}
          onSelectPose={setSelectedPose}
        />

        <QualitySettings
          avatarQuality={avatarQuality}
          onSelectQuality={setAvatarQuality}
        />

        <BodyMeasurements
          measurements={measurements}
          onUpdateMeasurement={updateMeasurement}
          onRescan={handleRescan}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AvatarScreen;