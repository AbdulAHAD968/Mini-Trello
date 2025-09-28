'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSave, FaTimes, FaTag } from 'react-icons/fa';
import { PriorityBadge } from './PriorityBadge';

interface AddCardProps {
  listId: string;
  onCardAdded: () => void;
}

type Priority = 'low' | 'medium' | 'high' | 'urgent';

export function AddCard({ listId, onCardAdded }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          description,
          priority,
          listId,
          dueDate: dueDate || undefined,
          tags
        }),
      });

      if (!response.ok) throw new Error('Failed to create card');

      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setIsAdding(false);
      onCardAdded();
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Failed to create card');
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <motion.div className="w-full">
      {isAdding ? (
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-3 bg-white p-3 sm:p-4 rounded-xl border border-stone-200 shadow-sm"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this card..."
            className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none text-sm transition-all bg-stone-50"
            rows={2}
            autoFocus
            disabled={isLoading}
          />
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description (optional)..."
            className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none text-sm transition-all bg-stone-50"
            rows={2}
            disabled={isLoading}
          />

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-stone-50"
              disabled={isLoading}
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:bg-teal-200 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add a tag..."
                className="flex-1 p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-stone-50"
                disabled={isLoading}
              />
              <motion.button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm font-medium text-stone-700 transition-colors flex items-center justify-center"
                disabled={isLoading}
                variants={buttonVariants}
                whileHover="hover"
              >
                <FaTag className="mr-1 xs:mr-2" />
                <span className="hidden xs:inline">Add</span>
              </motion.button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-2">
            <motion.button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-teal-300 transition-colors flex items-center justify-center"
              variants={buttonVariants}
              whileHover="hover"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FaSave className="mr-2" />
              )}
              {isLoading ? 'Adding...' : 'Add Card'}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setTitle('');
                setDescription('');
                setPriority('medium');
                setDueDate('');
                setTags([]);
              }}
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
          className="w-full text-left text-stone-600 hover:text-stone-800 text-sm font-medium p-2 sm:p-3 rounded-lg hover:bg-stone-100 transition-colors flex items-center justify-center sm:justify-start"
          variants={buttonVariants}
          whileHover="hover"
        >
          <FaPlus className="mr-2" />
          <span className="hidden xs:inline">Add a card</span>
          <span className="xs:hidden">Add Card</span>
        </motion.button>
      )}
    </motion.div>
  );
}