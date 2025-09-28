'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaArrowRight, FaRocket, FaCheck, FaTimes } from 'react-icons/fa';

interface AuthFormProps {
  type: 'login' | 'register';
}

// Password strength validation function
const validatePassword = (password: string) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const strength = Object.values(requirements).filter(Boolean).length;
  const isValid = Object.values(requirements).every(Boolean);

  return { requirements, strength, isValid };
};

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Password strength validation for registration
    if (type === 'register' && !passwordValidation.isValid) {
      setError('Please ensure your password meets all the requirements');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = type === 'login' ? { email, password } : { name, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${type}`);
      }

      // Store token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/boards');
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : `Failed to ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = type === 'login';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(13, 148, 136, 0.2), 0 2px 4px -1px rgba(13, 148, 136, 0.1)"
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(13, 148, 136, 0.3), 0 10px 10px -5px rgba(13, 148, 136, 0.2)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 }
  };

  // Password strength indicator
  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden cursor-pointer">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <motion.div
        className="max-w-md w-full space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <motion.div
            className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaRocket className="text-white text-2xl" />
          </motion.div>
          
          <h2 className="text-4xl font-black text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join BoardHub'}
          </h2>
          <p className="text-gray-300 text-lg">
            {isLogin ? 'Sign in to continue your journey' : 'Start your productivity journey today'}
          </p>
          
          <div className="mt-4">
            <span className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <Link
              href={isLogin ? '/register' : '/login'}
              className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLogin ? 'Create account' : 'Sign in'}
            </Link>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          variants={containerVariants}
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-4">
            {/* Name Field - Only for Register */}
            {!isLogin && (
              <motion.div variants={itemVariants}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    className="block w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator - Only show for registration and when password is not empty */}
              {!isLogin && password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2"
                >
                  {/* Strength Bar */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Password strength:</span>
                    <span className={`font-medium ${
                      passwordValidation.strength <= 2 ? 'text-red-400' :
                      passwordValidation.strength <= 4 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {getStrengthText(passwordValidation.strength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordValidation.strength)}`}
                      style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                    />
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center ${passwordValidation.requirements.minLength ? 'text-green-400' : 'text-red-400'}`}>
                      {passwordValidation.requirements.minLength ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${passwordValidation.requirements.hasUpperCase ? 'text-green-400' : 'text-red-400'}`}>
                      {passwordValidation.requirements.hasUpperCase ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${passwordValidation.requirements.hasLowerCase ? 'text-green-400' : 'text-red-400'}`}>
                      {passwordValidation.requirements.hasLowerCase ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${passwordValidation.requirements.hasNumber ? 'text-green-400' : 'text-red-400'}`}>
                      {passwordValidation.requirements.hasNumber ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                      One number
                    </div>
                    <div className={`flex items-center ${passwordValidation.requirements.hasSpecialChar ? 'text-green-400' : 'text-red-400'}`}>
                      {passwordValidation.requirements.hasSpecialChar ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                      One special character
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading || (!isLogin && !passwordValidation.isValid)}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
              variants={buttonVariants}
              initial="rest"
              whileHover={(!isLoading && (isLogin || passwordValidation.isValid)) ? "hover" : "rest"}
              whileTap={(!isLoading && (isLogin || passwordValidation.isValid)) ? "tap" : "rest"}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%]"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>

          {/* Additional Links */}
          {isLogin && (
            <motion.div variants={itemVariants} className="text-center">
              <Link
                href="/forgot-password"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </motion.div>
          )}
        </motion.form>

        {/* Footer */}
        <motion.div 
          className="text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          <p>By continuing, you agree to our Terms of Service</p>
        </motion.div>
      </motion.div>

      {/* Background hover effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-emerald-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}