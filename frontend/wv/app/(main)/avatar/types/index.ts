export type ViewMode = '3d' | 'ar';

export interface AvatarMeasurements {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
}

export interface Pose {
  id: string;
  name: string;
  emoji: string;
}

export interface QualityOption {
  id: string;
  name: string;
  desc: string;
}

export interface MeasurementSlider {
  key: keyof AvatarMeasurements;
  label: string;
  unit: string;
  min: number;
  max: number;
}