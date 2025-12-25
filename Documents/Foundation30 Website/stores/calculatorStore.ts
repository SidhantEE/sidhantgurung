import { create } from 'zustand';

interface CalculatorState {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  formData: Record<string, unknown>;
  openModal: () => void;
  closeModal: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateFormData: (data: Record<string, unknown>) => void;
  reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  isOpen: false,
  currentStep: 1,
  totalSteps: 8,
  formData: {},
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  setStep: (step) => set({ currentStep: step }),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () => set({ currentStep: 1, formData: {} }),
}));
