'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTasks, FaUsers, FaChartLine, FaArrowRight, FaStar, FaRocket } from 'react-icons/fa';

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      } 
    },
  };

  const buttonVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 20px 25px -5px rgba(13, 148, 136, 0.3), 0 10px 10px -5px rgba(13, 148, 136, 0.2)",
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      } 
    },
  };

  const featureCardVariants = {
    rest: { 
      scale: 1,
      y: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: { 
      scale: 1.05,
      y: -8,
      boxShadow: "0 25px 50px -12px rgba(13, 148, 136, 0.25)",
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 overflow-hidden cursor-pointer">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Premium badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
            variants={itemVariants}
          >
            <FaStar className="text-yellow-400" />
            <span className="text-white text-sm font-medium">Trusted by 10,000+ teams worldwide</span>
            <FaRocket className="text-cyan-400 ml-2" />
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              BoardHub
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Transform your workflow with our <span className="text-cyan-300 font-semibold">intuitive</span> task management platform. 
            Designed for <span className="text-emerald-300 font-semibold">seamless collaboration</span> and maximum productivity.
          </motion.p>

          {/* Enhanced Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            variants={itemVariants}
          >
            <Link href="/login">
              <motion.button
                className="relative bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center group overflow-hidden"
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                onMouseEnter={() => {
                  setIsHovered(true);
                  setHoveredButton('login');
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setHoveredButton(null);
                }}
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                
                {/* Button shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.button>
            </Link>

            <Link href="/register">
              <motion.button
                className="relative bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center group overflow-hidden"
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                onMouseEnter={() => {
                  setIsHovered(true);
                  setHoveredButton('register');
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setHoveredButton(null);
                }}
              >
                <span className="relative z-10 flex items-center">
                  Try Free
                  <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                
                {/* Button shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-12 text-gray-400 text-sm"
            variants={itemVariants}
          >
            <p>No credit card required • 14-day free trial • Cancel anytime</p>
          </motion.div>
        </motion.div>

        {/* Enhanced Features Section */}
        <motion.div
          className="mt-32 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl hover:border-cyan-400/30 transition-all duration-300 group"
            variants={itemVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaTasks className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Smart Organization
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Create beautiful boards, lists, and cards with intelligent automation 
              that adapts to your workflow.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl hover:border-emerald-400/30 transition-all duration-300 group"
            variants={itemVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Team Collaboration
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Work together in real-time with advanced commenting, mentions, 
              and seamless team coordination features.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl hover:border-cyan-400/30 transition-all duration-300 group"
            variants={itemVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Advanced Analytics
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Gain deep insights with comprehensive progress tracking, 
              performance metrics, and predictive analytics.
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-24"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-400/30 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who have revolutionized their project management with BoardHub.
            </p>
            <Link href="/register">
              <motion.button
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Free Trial Today
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Enhanced background hover effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              hoveredButton === 'login' 
                ? 'from-cyan-400 to-emerald-400' 
                : 'from-cyan-300 to-emerald-300'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}