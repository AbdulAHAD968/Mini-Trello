'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Card as CardType } from '@/lib/models';
import { EditCardModal } from './EditCardModal';

interface CardActionsProps {
  card: CardType;
  onCardUpdate?: () => void;
  onCardDelete?: () => void;
}

export function CardActions({ card, onCardUpdate, onCardDelete }: CardActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${card._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      onCardDelete?.();
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card');
    }
  };

  const buttonVariants = {
    rest: { scale: 1, opacity: 0.8 },
    hover: { scale: 1.1, opacity: 1, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.div
        className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditModalOpen(true);
          }}
          className="p-1.5 text-stone-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors duration-200"
          title="Edit card"
          variants={buttonVariants}
          whileHover="hover"
        >
          <FaEdit className="w-3.5 h-3.5" />
        </motion.button>
        
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteConfirmOpen(true);
          }}
          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
          title="Delete card"
          variants={buttonVariants}
          whileHover="hover"
        >
          <FaTrash className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>

      {/* Edit Card Modal */}
      <EditCardModal
        card={card}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCardUpdated={onCardUpdate}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Card</h3>
              <p className="text-stone-600 mb-4">
                Are you sure you want to delete "{card.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <motion.button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 bg-stone-200 rounded-lg transition-colors duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}