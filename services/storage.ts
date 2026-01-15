
import { AppState } from '../types';

const STORAGE_KEY = 'trainerpro_data';

export const loadState = (): AppState => {
  try {
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
  } catch (error) {
    console.error("Error loading state from storage:", error);
    return {
      instructor: null,
      companies: [],
      trainings: [],
      attendances: []
    };
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving state to storage:", error);
  }
};
