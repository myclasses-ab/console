import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api';
import {
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Step = 'details' | 'email' | 'send-phone' | 'phone' | 'creating';

interface ProgressBarProps {
  step: Step;
  emailVerified: boolean;
  phoneVerified: boolean;
}

function ProgressBar({ step, emailVerified, phoneVerified }: ProgressBarProps) {
  const items = [
    { label: 'Details', icon: Building2, active: true, completed: step !== 'details' },
    {
      label: 'Email',
      icon: Mail,
      active: step === 'email' || step === 'send-phone' || step === 'phone' || step === 'creating',
      completed: emailVerified || step === 'send-phone' || step === 'phone' || step === 'creating',
    },
    {
      label: 'Phone',
      icon: Phone,
      active: step === 'send-phone' || step === 'phone' || step === 'creating',
      completed: phoneVerified || step === 'creating',
    },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {items.map((item, index, arr) => (
        <div key={item.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                item.completed
                  ? 'bg-green-500 text-white'
                  : item.active
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {item.completed ? <CheckCircle2 size={20} /> : <item.icon size={18} />}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium ${
                item.active || item.completed ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </div>
          {index < arr.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${
                item.completed ? 'bg-green-500' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface FormData {
  instituteName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: { error?: string } } };
    return axiosErr.response?.data?.error || 'Something went wrong. Please try again.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong. Please try again.';
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, completeSignup } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState<FormData>({
    instituteName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [emailCode, setEmailCode] = useState(['', '', '', '', '', '']);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '']);

  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const emailCodeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Resend countdown
  useEffect(() => {
    if (canResend) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [canResend, step]);

  const resetCountdown = () => {
    setCountdown(60);
    setCanResend(false);
  };

  const normalizePhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'phone' ? normalizePhone(value) : value,
    }));
  };

  const validateDetails = () => {
    if (!formData.instituteName.trim() || formData.instituteName.trim().length < 2) {
      return 'Please enter a valid institute name';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (formData.phone.length !== 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleInitiate = async () => {
    const validationError = validateDetails();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.initiateInstituteSignup({
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        password: formData.password,
        instituteName: formData.instituteName.trim(),
      });

      setMaskedEmail(response.email);
      setMaskedPhone(response.phone);
      setStep('email');
      resetCountdown();
      setTimeout(() => emailCodeRefs.current[0]?.focus(), 300);
      toast.success('Verification code sent to your email');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to start signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    const code = emailCode.join('');
    if (code.length !== 6) return;

    setError('');
    setIsLoading(true);

    try {
      await authApi.verifySignupEmail(formData.email, code);
      setEmailVerified(true);
      toast.success('Email verified successfully');
      setStep('send-phone');
      setPhoneOtp(['', '', '', '']);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Invalid email code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.sendSignupPhoneOtp(formData.email);
      setMaskedPhone(response.phone);
      setStep('phone');
      resetCountdown();
      setPhoneOtp(['', '', '', '']);
      setTimeout(() => phoneOtpRefs.current[0]?.focus(), 300);
      toast.success('Phone OTP sent');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to send phone OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    const otp = phoneOtp.join('');
    if (otp.length !== 4) return;

    setError('');
    setIsLoading(true);

    try {
      await authApi.verifySignupPhone(formData.email, otp);
      setPhoneVerified(true);
      toast.success('Phone verified successfully');
      await completeAccountCreation();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Invalid phone OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeAccountCreation = async () => {
    setStep('creating');
    try {
      const response = await authApi.signup({
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        password: formData.password,
        instituteName: formData.instituteName.trim(),
      });
      completeSignup(response);
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setStep('phone');
      setError(getErrorMessage(err) || 'Failed to create account. Please try again.');
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authApi.resendSignupEmail(formData.email);
      resetCountdown();
      setEmailCode(['', '', '', '', '', '']);
      setTimeout(() => emailCodeRefs.current[0]?.focus(), 100);
      toast.success('Email verification code resent');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to resend email code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPhone = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authApi.resendSignupPhone(formData.email);
      resetCountdown();
      setPhoneOtp(['', '', '', '']);
      setTimeout(() => phoneOtpRefs.current[0]?.focus(), 100);
      toast.success('Phone OTP resent');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to resend phone OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (
    index: number,
    value: string,
    otp: string[],
    setOtp: (val: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onComplete?: () => void
  ) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d !== '')) {
      onComplete?.();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    otp: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (
    e: React.ClipboardEvent,
    length: number,
    setOtp: (val: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onComplete?: () => void
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = Array(length).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, length - 1);
    refs.current[focusIndex]?.focus();
    if (pasted.length === length) {
      onComplete?.();
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 items-center justify-center p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
            <img
              src="https://myclassesimages.s3.ap-south-1.amazonaws.com/Our/console-signup.png"
              alt="My Classes Console"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Grow Your Institute</h2>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              Join thousands of institutes using My Classes to reach more students and manage their growth.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-200">
                <GraduationCap size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Institute Console</h1>
              <p className="text-sm text-slate-500 mt-1">Create your verified institute account</p>
            </div>

            <ProgressBar step={step} emailVerified={emailVerified} phoneVerified={phoneVerified} />

            <AnimatePresence mode="wait">
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Institute Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={formData.instituteName}
                          onChange={(e) => handleChange('instituteName', e.target.value)}
                          placeholder="e.g. Leo Coaching Centre"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="admin@myclasses.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium border-r border-slate-200 pr-3">
                          +91
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="9999999999"
                          required
                          maxLength={10}
                          className="w-full pl-24 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          placeholder="Create a password"
                          required
                          minLength={6}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="button"
                    onClick={handleInitiate}
                    disabled={isLoading}
                    className="w-full mt-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                      <Mail className="text-primary-600" size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Verify your email</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{maskedEmail}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-6">
                    {emailCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { emailCodeRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value, emailCode, setEmailCode, emailCodeRefs, () =>
                            handleVerifyEmail()
                          )
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e, emailCode, emailCodeRefs)}
                        onPaste={(e) =>
                          handleOtpPaste(e, 6, setEmailCode, emailCodeRefs, () => handleVerifyEmail())
                        }
                        className="w-11 h-12 text-center text-lg font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        maxLength={1}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-red-600 text-sm mb-4"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isLoading || emailCode.some((d) => !d)}
                    className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify Email
                        <ShieldCheck size={18} />
                      </>
                    )}
                  </button>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-sm text-slate-500 hover:text-primary-600 font-medium flex items-center gap-1"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={isLoading}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <RefreshCw size={16} />
                        Resend code
                      </button>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Resend in <span className="font-semibold text-slate-700">{countdown}s</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 'send-phone' && (
                <motion.div
                  key="send-phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="text-green-600" size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Email verified</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Next, we'll send a 4-digit OTP to{' '}
                      <span className="font-semibold text-slate-700">{maskedPhone || `+91 ${formData.phone}`}</span>
                    </p>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-red-600 text-sm mb-4"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Phone OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-sm text-slate-500 hover:text-primary-600 font-medium flex items-center gap-1"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'phone' && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                      <Phone className="text-primary-600" size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Verify your phone</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Enter the 4-digit OTP sent to <span className="font-semibold text-slate-700">{maskedPhone}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-6">
                    {phoneOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { phoneOtpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value, phoneOtp, setPhoneOtp, phoneOtpRefs, () =>
                            handleVerifyPhone()
                          )
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e, phoneOtp, phoneOtpRefs)}
                        onPaste={(e) =>
                          handleOtpPaste(e, 4, setPhoneOtp, phoneOtpRefs, () => handleVerifyPhone())
                        }
                        className="w-11 h-12 text-center text-lg font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        maxLength={1}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-red-600 text-sm mb-4"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isLoading || phoneOtp.some((d) => !d)}
                    className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify Phone
                        <ShieldCheck size={18} />
                      </>
                    )}
                  </button>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('send-phone')}
                      className="text-sm text-slate-500 hover:text-primary-600 font-medium flex items-center gap-1"
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendPhone}
                        disabled={isLoading}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <RefreshCw size={16} />
                        Resend OTP
                      </button>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Resend in <span className="font-semibold text-slate-700">{countdown}s</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 'creating' && (
                <motion.div
                  key="creating"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-6" />
                  <h2 className="text-xl font-bold text-slate-900">Creating your account...</h2>
                  <p className="text-sm text-slate-500 mt-2">Setting up your institute profile</p>
                </motion.div>
              )}
            </AnimatePresence>

            {step === 'details' && (
              <p className="text-center text-sm text-slate-600 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
