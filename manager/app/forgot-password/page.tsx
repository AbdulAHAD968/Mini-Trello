'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaRocket, FaPaperPlane } from 'react-icons/fa';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
            Reset Password
          </h2>
          <p className="text-gray-300 text-lg">
            {isSubmitted 
              ? 'Check your email for instructions' 
              : 'Enter your email to reset your password'
            }
          </p>
          
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-200 text-sm font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Back to Sign In
            </Link>
          </div>
        </motion.div>

        {!isSubmitted ? (
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            <div className="space-y-4">
              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Instructions
                      <FaPaperPlane className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </motion.form>
        ) : (
          <motion.div
            className="mt-8 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <FaPaperPlane className="text-white text-xl" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              Check Your Email
            </h3>
            
            <p className="text-gray-300 mb-4">
              We've sent password reset instructions to:
            </p>
            
            <p className="text-cyan-400 font-medium mb-6">
              {email}
            </p>

            <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-lg p-4 mb-6">
              <p className="text-cyan-200 text-sm">
                <strong>Note:</strong> For password reset assistance, please contact{' '}
                <a 
                  href="mailto:ab.zarinc@gmail.com"
                  className="underline hover:text-cyan-100 transition-colors"
                >
                  ab.zarinc@gmail.com
                </a>
              </p>
            </div>

            <p className="text-gray-400 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
              >
                try again
              </button>
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div 
          className="text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          <p>Need help? Contact our support team</p>
        </motion.div>
      </motion.div>
    </div>
  );
}