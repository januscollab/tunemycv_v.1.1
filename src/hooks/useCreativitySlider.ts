
import { useState, useEffect } from 'react';

export interface CreativityLevel {
  level: number;
  temperature: number;
  label: string;
  description: string;
}

export const CREATIVITY_LEVELS: CreativityLevel[] = [
  { level: 0, temperature: 0.2, label: 'Safe & Professional', description: 'Conservative, formal language' },
  { level: 1, temperature: 0.6, label: 'Confident but Measured', description: 'Balanced professional tone' },
  { level: 2, temperature: 1.2, label: 'Bold & Memorable', description: 'Creative with impact' },
  { level: 3, temperature: 1.6, label: 'Expressive and Visionary', description: 'Highly creative and unique' }
];

const STORAGE_KEY = 'ai-creativity-level';
const DEFAULT_LEVEL = 1; // 0.6 temperature

export const useCreativitySlider = () => {
  const [creativityLevel, setCreativityLevel] = useState<number>(DEFAULT_LEVEL);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const level = parseInt(saved, 10);
      if (level >= 0 && level <= 3) {
        setCreativityLevel(level);
      }
    }
  }, []);

  // Save preference when changed
  const updateCreativityLevel = (level: number) => {
    setCreativityLevel(level);
    localStorage.setItem(STORAGE_KEY, level.toString());
  };

  const getCurrentLevel = () => CREATIVITY_LEVELS[creativityLevel];
  const getTemperature = () => CREATIVITY_LEVELS[creativityLevel].temperature;

  return {
    creativityLevel,
    updateCreativityLevel,
    getCurrentLevel,
    getTemperature,
    levels: CREATIVITY_LEVELS
  };
};
