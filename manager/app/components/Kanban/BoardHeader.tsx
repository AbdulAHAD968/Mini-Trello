'use client';
import { motion } from 'framer-motion';
import { FaList, FaTasks, FaInfoCircle, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface BoardHeaderProps {
  board: {
    title: string;
    description?: string;
  };
  listCount: number;
  totalCards: number;
}

export function BoardHeader({ board, listCount, totalCards }: BoardHeaderProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const counterVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.3,
        delay: 0.1 
      } 
    },
    hover: { 
      scale: 1.02,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Teal Background */}
      <motion.div 
        className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-8 mb-6 text-white shadow-lg relative overflow-hidden"
        variants={itemVariants}
      >
        {/* Optional: Add subtle pattern or decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Back Button and Breadcrumb */}
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link 
                    href="/boards" 
                    className="flex items-center text-teal-100 hover:text-white transition-colors duration-200 group"
                  >
                    <FaArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="font-medium">Back to Boards</span>
                  </Link>
                </motion.div>

                {/* Breadcrumb */}
                <motion.div 
                  className="flex items-center text-teal-100 text-sm"
                  variants={itemVariants}
                >
                  <span className="opacity-80">Workspace</span>
                  <FaChevronRight className="mx-2 w-3 h-3 opacity-60" />
                  <span className="opacity-80">Boards</span>
                  <FaChevronRight className="mx-2 w-3 h-3 opacity-60" />
                  <span className="font-medium text-white">{board.title}</span>
                </motion.div>
              </div>

              {/* Main Title */}
              <motion.h1
                className="text-4xl font-bold mb-4"
                variants={itemVariants}
              >
                {board.title}
              </motion.h1>
              
              {/* Description */}
              {board.description && (
                <motion.p
                  className="text-teal-100 text-lg max-w-2xl leading-relaxed opacity-90"
                  variants={itemVariants}
                >
                  {board.description}
                </motion.p>
              )}
            </div>
            
            {/* Stats Cards */}
            <div className="flex space-x-4 ml-6">
              <motion.div
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20 min-w-28"
                variants={counterVariants}
                whileHover="hover"
              >
                <div className="text-2xl font-bold text-white flex items-center justify-center">
                  <FaList className="mr-2 opacity-90" />
                  {listCount}
                </div>
                <div className="text-sm text-teal-100 opacity-90">Lists</div>
              </motion.div>
              <motion.div
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20 min-w-28"
                variants={counterVariants}
                whileHover="hover"
              >
                <div className="text-2xl font-bold text-white flex items-center justify-center">
                  <FaTasks className="mr-2 opacity-90" />
                  {totalCards}
                </div>
                <div className="text-sm text-teal-100 opacity-90">Cards</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Helper Text */}
      <motion.div
        className="flex items-center space-x-3 text-sm bg-teal-50 text-teal-700 px-4 py-3 rounded-lg border border-teal-200"
        variants={itemVariants}
      >
        <FaInfoCircle className="text-teal-500 flex-shrink-0" />
        <span>Drag and drop lists and cards to reorganize your board</span>
      </motion.div>
    </motion.div>
  );
}