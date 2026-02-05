
export type Step = 
  | 'INTRO' 
  | 'COLLECT' 
  | 'LABEL' 
  | 'TRAIN' 
  | 'TEST'      // Initial prediction result
  | 'EVALUATE'  // New: AI Detective
  | 'OPTIMIZE'  // New: AI Doctor
  | 'REWARD';   // Final Badge

export type RiceStatus = 'healthy' | 'sick';

export interface RiceImage {
  id: string;
  status: RiceStatus;
  url: string; 
  isCollected: boolean;
  userLabel?: RiceStatus; 
  aiPrediction?: RiceStatus; // For Evaluation phase
}

export interface OptimizationState {
  hasPotion: boolean;     // Data Augmentation
  blockCount: number;     // Model Complexity (1-5)
  learningSpeed: number;  // Learning Rate (1-10)
  isCuring: boolean;      // Animation state
}

export interface GameState {
  step: Step;
  aiName: string;
  collection: RiceImage[];
  trainingProgress: number; 
  accuracy: number;
  
  // Detective Phase
  detectiveScore: number;
  currentEvalIndex: number;

  // Doctor Phase
  optimization: OptimizationState;
}

export const COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
  gray: '#5f6368',
  bg: '#f8f9fa'
};
