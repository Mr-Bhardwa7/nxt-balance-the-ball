import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserProfileState {
    name: string,
    countryCode: string,
    mobile: string,
    otp?: string,
    address: string,
    isVerified: boolean,
    otpSent: boolean,
    loading: boolean,
    message: {
        text: string;
        type: "success" | "warning" | "error";
    } | null,
    errors: {
        name?: string;
        mobile?: string;
        address?: string;
        otp?: string;
    }
}

const initialState: UserProfileState = {
    name: '',
    countryCode: '+91',
    mobile: '',
    otp: '',
    address: '',
    isVerified: false,
    otpSent: false,
    loading: false,
    message: null,
    errors: {}
}

export const userProfileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateField: (state, action: PayloadAction<{field: keyof UserProfileState, value: any}>) => {
      const { field, value } = action.payload;
      (state as any)[field] = value;
      
      // Clear field-specific error when user starts typing
      if (field in state.errors) {
        delete state.errors[field as keyof typeof state.errors];
      }
      
      // Clear message when user makes changes
      if (state.message) {
        state.message = null;
      }
    },
    
    setValidationErrors: (state, action: PayloadAction<UserProfileState['errors']>) => {
      state.errors = action.payload;
    },
    
    clearValidationErrors: (state) => {
      state.errors = {};
    },
    
    setMessage: (state, action: PayloadAction<UserProfileState['message']>) => {
      state.message = action.payload;
    },
    
    clearMessage: (state) => {
      state.message = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    sendOtpRequest: (state) => {
      state.loading = true;
      state.message = null;
    },
    
    sendOtpSuccess: (state) => {
      state.loading = false;
      state.otpSent = true;
      state.message = {
        text: "OTP sent to your mobile number successfully!",
        type: "success"
      };
    },
    
    sendOtpFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.message = {
        text: action.payload || "Failed to send OTP. Please try again.",
        type: "error"
      };
    },
    
    verifyOtpRequest: (state) => {
      state.loading = true;
      state.message = null;
    },
    
    verifyOtpSuccess: (state) => {
      state.loading = false;
      state.isVerified = true;
      state.message = {
        text: "Mobile number verified successfully!",
        type: "success"
      };
    },
    
    verifyOtpFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.message = {
        text: action.payload || "Invalid OTP. Please try again.",
        type: "error"
      };
    },
    
    saveProfileRequest: (state) => {
      state.loading = true;
      state.message = null;
    },
    
    saveProfileSuccess: (state) => {
      state.loading = false;
      state.message = {
        text: "Profile saved successfully!",
        type: "success"
      };
    },
    
    saveProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.message = {
        text: action.payload || "Failed to save profile. Please try again.",
        type: "error"
      };
    },
    
    resetForm: (state) => {
      return initialState;
    },
    
    // Legacy actions for backward compatibility
    createProfile: (state, action: PayloadAction<Partial<UserProfileState>>) => {
      Object.assign(state, action.payload);
    },
    
    setOtp: (state, action: PayloadAction<string>) => {
      state.otp = action.payload;
      if (state.errors.otp) {
        delete state.errors.otp;
      }
    },
    
    verifyOtp: (state) => {
      state.isVerified = true;
    }
  },
})

export const { 
  updateField,
  setValidationErrors,
  clearValidationErrors,
  setMessage,
  clearMessage,
  setLoading,
  sendOtpRequest,
  sendOtpSuccess,
  sendOtpFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  saveProfileRequest,
  saveProfileSuccess,
  saveProfileFailure,
  resetForm,
  createProfile, 
  setOtp, 
  verifyOtp 
} = userProfileSlice.actions

export default userProfileSlice.reducer