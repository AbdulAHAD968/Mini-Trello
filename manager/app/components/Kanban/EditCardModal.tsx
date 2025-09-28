'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Card as CardType } from '@/lib/models';
import { PriorityBadge } from './PriorityBadge';

interface EditCardModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated: () => void;
}

type Priority = 'low' | 'medium' | 'high' | 'urgent';

export function EditCardModal({ card, isOpen, onClose, onCardUpdated }: EditCardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState<Priority>(card.priority || 'medium');
  const [dueDate, setDueDate] = useState(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority || 'medium');
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
    }
  }, [isOpen, card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${card._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate: dueDate || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }

      onCardUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating card:', error);
      alert('Failed to update card');
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Edit Card</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors duration-200 bg-stone-50"
                  placeholder="Enter card title..."
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none transition-colors duration-200 bg-stone-50"
                  placeholder="Enter card description..."
                  disabled={isLoading}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                        priority === p
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                      disabled={isLoading}
                      variants={buttonVariants}
                      whileHover="hover"
                    >
                      <PriorityBadge priority={p} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors duration-200 bg-stone-50"
                  disabled={isLoading}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-stone-600 hover:text-stone-800 disabled:text-stone-400 bg-stone-200 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading || !title.trim()}
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:bg-teal-300 transition-colors duration-200 flex items-center justify-center"
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {isLoading ? 'Updating...' : 'Update Card'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}