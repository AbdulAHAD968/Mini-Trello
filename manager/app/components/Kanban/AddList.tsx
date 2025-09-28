'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSave, FaTimes } from 'react-icons/fa';

interface AddListProps {
  boardId: string;
  onListAdded: () => void;
}

export function AddList({ boardId, onListAdded }: AddListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, boardId }),
      });

      if (!response.ok) throw new Error('Failed to create list');

      setTitle('');
      setIsAdding(false);
      onListAdded();
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="w-80 flex-shrink-0"
      initial="rest"
      whileHover="hover"
      variants={buttonVariants}
    >
      {isAdding ? (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-stone-200 p-4"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title..."
            className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-stone-50"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex space-x-2 mt-3">
            <motion.button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-teal-300 transition-colors flex items-center justify-center"
              variants={buttonVariants}
              whileHover="hover"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FaSave className="mr-2" />
              )}
              {isLoading ? 'Adding...' : 'Add List'}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsAdding(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-800 disabled:text-stone-400 bg-stone-200 transition-colors flex items-center justify-center"
              variants={buttonVariants}
              whileHover="hover"
            >
              <FaTimes className="mr-2" />
              Cancel
            </motion.button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          onClick={() => setIsAdding(true)}
          className="bg-white hover:bg-stone-50 border-2 border-dashed border-stone-300 hover:border-stone-400 rounded-xl p-6 w-full h-fit transition-all duration-200 group"
          variants={buttonVariants}
        >
          <div className="flex items-center justify-center text-stone-500 group-hover:text-stone-700">
            <FaPlus className="text-2xl mr-2" />
            <span className="font-medium">Add another list</span>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
}