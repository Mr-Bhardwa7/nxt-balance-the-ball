import { useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateField, 
  setValidationErrors, 
  clearValidationErrors,
  sendOtpRequest,
  sendOtpSuccess,
  sendOtpFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  saveProfileRequest,
  saveProfileSuccess,
  saveProfileFailure,
  clearMessage
} from "@/app/features/profile/userProfileSlice";
import type { RootState } from '@/store';

export default function UserProfileForm() {
  const profile = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  // Validation functions
  const validateName = (name: string): string | null => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name can only contain letters and spaces";
    return null;
  };

  const validateMobile = (mobile: string): string | null => {
    if (!mobile) return "Mobile number is required";
    if (mobile.length < 10) return "Please enter a valid mobile number";
    return null;
  };

  const validateAddress = (address: string): string | null => {
    if (!address.trim()) return "Address is required";
    if (address.trim().length < 10) return "Please enter a complete address";
    return null;
  };

  const validateOtp = (otp: string): string | null => {
    if (!otp) return "OTP is required";
    if (otp.length !== 6) return "OTP must be 6 digits";
    if (!/^\d{6}$/.test(otp)) return "OTP must contain only numbers";
    return null;
  };

  const validateForm = (): boolean => {
    const errors: any = {};
    
    const nameError = validateName(profile.name);
    if (nameError) errors.name = nameError;

    const mobileError = validateMobile(profile.mobile);
    if (mobileError) errors.mobile = mobileError;

    const addressError = validateAddress(profile.address);
    if (addressError) errors.address = addressError;

    if (profile.otpSent && !profile.isVerified) {
      const otpError = validateOtp(profile.otp || '');
      if (otpError) errors.otp = otpError;
    }

    if (Object.keys(errors).length > 0) {
      dispatch(setValidationErrors(errors));
      return false;
    }

    dispatch(clearValidationErrors());
    return true;
  };

  // Simulate OTP sending
  const sendOtp = async () => {
    dispatch(sendOtpRequest());
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success (you can add failure logic here)
      dispatch(sendOtpSuccess());
    } catch (error) {
      dispatch(sendOtpFailure("Network error. Please check your connection."));
    }
  };

  // Simulate OTP verification
  const verifyOtp = async () => {
    dispatch(verifyOtpRequest());
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple OTP validation (in real app, this would be server-side)
      if (profile.otp === "123456") {
        dispatch(verifyOtpSuccess());
      } else {
        dispatch(verifyOtpFailure("Invalid OTP. Please try again."));
      }
    } catch (error) {
      dispatch(verifyOtpFailure("Verification failed. Please try again."));
    }
  };

  // Simulate profile saving
  const saveProfile = async () => {
    dispatch(saveProfileRequest());
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      dispatch(saveProfileSuccess());
    } catch (error) {
      dispatch(saveProfileFailure("Failed to save profile. Please try again."));
    }
  };

  const handleButtonClick = () => {
    // Clear previous messages
    dispatch(clearMessage());
    
    // Validate current step
    if (!validateForm()) {
      return;
    }

    if (!profile.otpSent && !profile.isVerified) {
      sendOtp();
    } else if (profile.otpSent && !profile.isVerified) {
      verifyOtp();
    } else if (profile.isVerified) {
      saveProfile();
    }
  };

  const getButtonText = () => {
    if (profile.loading) {
      if (!profile.otpSent) return "Sending OTP...";
      if (!profile.isVerified) return "Verifying...";
      return "Saving...";
    }
    
    if (!profile.otpSent && !profile.isVerified) return "Send OTP";
    if (profile.otpSent && !profile.isVerified) return "Verify OTP";
    return "Save Profile";
  };

  const isButtonDisabled = () => {
    if (profile.loading) return true;
    
    if (!profile.otpSent && !profile.isVerified) {
      return !profile.name || !profile.mobile || !profile.address;
    }
    
    if (profile.otpSent && !profile.isVerified) {
      return !profile.otp || profile.otp.length !== 6;
    }
    
    return false;
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (profile.message) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [profile.message, dispatch]);

  const getMessageIcon = () => {
    switch (profile.message?.type) {
      case "success": return <CheckCircle2 size={18} className="shrink-0" />;
      case "error": return <XCircle size={18} className="shrink-0" />;
      case "warning": return <AlertTriangle size={18} className="shrink-0" />;
      default: return null;
    }
  };

  const getMessageStyles = () => {
    switch (profile.message?.type) {
      case "success":
        return "bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600";
      case "error":
        return "bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600";
      case "warning":
        return "bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-600";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col gap-3 p-4 text-sm"
    >
      {/* Message Bar */}
      <AnimatePresence>
        {profile.message && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`flex items-center gap-2 px-4 py-2 mb-2 rounded-lg border text-sm font-medium ${getMessageStyles()}`}
            role="alert"
            aria-live="polite"
          >
            {getMessageIcon()}
            <span>{profile.message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={profile.name}
            onChange={(e) => dispatch(updateField({ field: 'name', value: e.target.value }))}
            placeholder="Enter your full name"
            className={`w-full px-3 py-2 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:ring-2 focus:outline-none ${
              profile.errors.name 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-700 focus:ring-blue-500"
            }`}
            disabled={profile.isVerified}
          />
          <AnimatePresence>
            {profile.errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-1 text-xs text-red-400 flex items-center gap-1"
              >
                <XCircle size={12} />
                {profile.errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Number Field */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-200 mb-1">
            Mobile Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <PhoneInput
              country={"in"}
              value={profile.mobile}
              onChange={(val) => dispatch(updateField({ field: 'mobile', value: val }))}
              disabled={profile.isVerified}
              inputProps={{
                name: "mobile",
                required: true,
                id: "mobile",
                className: `pl-12 pr-3 py-2 w-full rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:outline-none ${
                  profile.errors.mobile 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-700 focus:ring-blue-500"
                }`,
              }}
              buttonStyle={{
                background: "#1f2937",
                border: `1px solid ${profile.errors.mobile ? '#ef4444' : '#374151'}`,
                borderRight: "none",
                borderRadius: "0.5rem 0 0 0.5rem",
                paddingLeft: "8px",
                paddingRight: "8px",
              }}
              inputStyle={{
                background: "#1f2937",
                border: `1px solid ${profile.errors.mobile ? '#ef4444' : '#374151'}`,
                color: "white",
                width: "100%",
                height: "40px",
                paddingLeft: "52px",
                borderRadius: "0.5rem",
              }}
              dropdownStyle={{
                backgroundColor: "#fff",
                color: "#111",
              }}
            />
          </div>
          
          <AnimatePresence>
            {profile.errors.mobile && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-1 text-xs text-red-400 flex items-center gap-1"
              >
                <XCircle size={12} />
                {profile.errors.mobile}
              </motion.p>
            )}
          </AnimatePresence>

          {/* OTP Field */}
          <AnimatePresence>
            {profile.otpSent && !profile.isVerified && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-2"
              >
                <input
                  type="text"
                  value={profile.otp}
                  onChange={(e) => dispatch(updateField({ field: 'otp', value: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="Enter 6-digit OTP"
                  className={`w-full px-3 py-2 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:ring-2 focus:outline-none ${
                    profile.errors.otp 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-700 focus:ring-blue-500"
                  }`}
                  maxLength={6}
                  inputMode="numeric"
                  aria-label="Enter 6-digit OTP"
                />
                {profile.errors.otp && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <XCircle size={12} />
                    {profile.errors.otp}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  💡 Tip: Use "123456" for demo purposes
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {profile.isVerified && (
            <motion.span 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-green-400 flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Mobile number verified
            </motion.span>
          )}
        </div>

        {/* Address Field */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-1">
            Address <span className="text-red-400">*</span>
          </label>
          <textarea
            id="address"
            value={profile.address}
            onChange={(e) => dispatch(updateField({ field: 'address', value: e.target.value }))}
            placeholder="Enter your complete address (Street, City, Pincode)"
            className={`w-full px-3 py-2 rounded-lg bg-gray-800 border text-white placeholder-gray-400 focus:ring-2 focus:outline-none resize-none ${
              profile.errors.address 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-700 focus:ring-blue-500"
            }`}
            rows={3}
            disabled={profile.isVerified && profile.otpSent}
          />
          <AnimatePresence>
            {profile.errors.address && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-1 text-xs text-red-400 flex items-center gap-1"
              >
                <XCircle size={12} />
                {profile.errors.address}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Smart Action Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isButtonDisabled()}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isButtonDisabled()
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {getButtonText()}
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          <div className={`w-2 h-2 rounded-full ${profile.name && profile.mobile && profile.address ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-2 h-2 rounded-full ${profile.otpSent ? 'bg-blue-500' : 'bg-gray-600'}`} />
          <div className={`w-2 h-2 rounded-full ${profile.isVerified ? 'bg-green-500' : 'bg-gray-600'}`} />
        </div>
      </form>
    </motion.div>
  );
}