import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 items-center justify-center p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Image Container */}
        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
            <img
              src="https://myclassesimages.s3.ap-south-1.amazonaws.com/Our/console-login.png"
              alt="My Classes Console"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>

          {/* Bottom Text */}
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Manage Your Institute
            </h2>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              Streamline your operations, track admissions, and grow your educational business with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-200">
                <GraduationCap size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Institute Console Hehe</h1>
              <p className="text-sm text-slate-500 mt-1">Sign in to manage your institute</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@myclasses.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
