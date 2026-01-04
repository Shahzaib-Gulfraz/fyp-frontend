import { Pose, QualityOption, MeasurementSlider } from '../types';

export const POSES: Pose[] = [
  { id: 'standing', name: 'Standing', emoji: '🧍' },
  { id: 'walking', name: 'Walking', emoji: '🚶' },
  { id: 'posing', name: 'Pose', emoji: '💃' },
  { id: 'running', name: 'Running', emoji: '🏃' },
];

export const QUALITY_OPTIONS: QualityOption[] = [
  { id: 'basic', name: 'Basic', desc: 'Fast rendering' },
  { id: 'standard', name: 'Standard', desc: 'Good quality' },
  { id: 'premium', name: 'Premium', desc: 'Photorealistic' },
];

export const MEASUREMENT_SLIDERS: MeasurementSlider[] = [
  { key: 'height', label: 'Height', unit: 'cm', min: 140, max: 220 },
  { key: 'chest', label: 'Chest', unit: 'cm', min: 60, max: 140 },
  { key: 'waist', label: 'Waist', unit: 'cm', min: 50, max: 120 },
  { key: 'hips', label: 'Hips', unit: 'cm', min: 60, max: 140 },
  { key: 'shoulder', label: 'Shoulder', unit: 'cm', min: 30, max: 60 },
  { key: 'inseam', label: 'Inseam', unit: 'cm', min: 60, max: 100 },
];

export const DEFAULT_MEASUREMENTS = {
  height: 175,
  chest: 95,
  waist: 80,
  hips: 100,
  shoulder: 45,
  inseam: 82,
};

export const SCAN_STEPS = [
  { step: '1', title: 'Stand in Good Light', desc: 'Face camera in a well-lit room' },
  { step: '2', title: 'Wear Fitted Clothes', desc: 'Tight clothing for accurate scans' },
  { step: '3', title: 'Follow Instructions', desc: 'Move as guided by the app' },
  { step: '4', title: 'Wait for Processing', desc: 'AI creates your 3D model' },
];