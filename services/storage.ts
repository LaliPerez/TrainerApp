
import { AppState } from '../types';

const STORAGE_KEY = 'trainerpro_data';

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {
      instructor: null,
      companies: [],
      trainings: [],
      attendances: []
    };
  }
  return JSON.parse(saved);
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
