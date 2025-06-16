// lib/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormData {
  name: string;
  role: string;
  company: string;
  cv: string;
  description: string;
  length: string;
}

interface UserStore {
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  resetFormData: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      formData: {
        name: '',
        role: '',
        company: '',
        cv: '',
        description: '',
        length: '5',
      },
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetFormData: () =>
        set({
          formData: {
            name: '',
            role: '',
            company: '',
            cv: '',
            description: '',
            length: '5',
          },
        }),
    }),
    {
      name: 'user-form-data',
    }
  )
);