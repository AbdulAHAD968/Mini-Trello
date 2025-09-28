'use client';
import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { AnimatePresence } from 'framer-motion';
import { List as ListType, Card as CardType } from '@/lib/models';
import { Card } from './Card';
import { AddCard } from './AddCard';
import { FaTrash, FaGripVertical, FaPlus, FaEllipsisH } from 'react-icons/fa';

interface ListProps {
  list: ListType;
  index: number;
  onListUpdate: () => void;
  onListDelete?: () => void;
}

export function List({ list, index, onListUpdate, onListDelete }: ListProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cards = list.cards || [];

  const handleDeleteList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lists/${list._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete list');
      }

      onListDelete?.();
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list');
    }
  };

  return (
    <>
      <Draggable draggableId={list._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`
              bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 
              w-80 flex-shrink-0 hover:shadow-lg transition-shadow duration-200
              ${snapshot.isDragging ? 'shadow-2xl bg-white border-cyan-200' : 'hover:border-gray-300'}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsMenuOpen(false);
            }}
          >
            {/* List Header */}
            <div className="p-4 border-b border-gray-100/60 relative group">
              <div 
                {...provided.dragHandleProps}
                className="flex items-center justify-between cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <FaGripVertical className="w-4 h-4" />
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-lg truncate flex-1">
                    {list.title}
                  </h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Card Count Badge */}
                  <span 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2.5 py-1.5 rounded-full font-semibold shadow-sm"
                  >
                    {cards.length}
                  </span>
                  
                  {/* List Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <FaEllipsisH className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-32"
                        >
                          <button
                            onClick={() => {
                              setIsDeleteConfirmOpen(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                          >
                            <FaTrash className="w-3 h-3" />
                            <span>Delete List</span>
                          </button>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cards Area */}
            <Droppable droppableId={list._id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    p-4 min-h-48 transition-colors duration-200 space-y-3
                    ${snapshot.isDraggingOver ? 'bg-gradient-to-br from-blue-50/50 to-cyan-50/50' : 'bg-gray-50/30'}
                  `}
                >
                  <AnimatePresence>
                    {cards.map((card: CardType, index: number) => (
                      <Card 
                        key={card._id} 
                        card={card} 
                        index={index}
                        onCardUpdate={onListUpdate}
                        onCardDelete={onListUpdate}
                      />
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                  
                  {/* Empty state */}
                  {cards.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaPlus className="w-5 h-5" />
                      </div>
                      <p className="text-sm">No cards yet</p>
                      <p className="text-xs mt-1">Add a card to get started</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
            
            {/* Add Card Section */}
            <div className="p-4 border-t border-gray-100/60 bg-white/50 hover:bg-white/80 transition-colors duration-200">
              <AddCard listId={list._id} onCardAdded={onListUpdate} />
            </div>
          </div>
        )}
      </Draggable>

      {/* Delete List Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="w-6 h-6 text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete List
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "<span className="font-semibold">{list.title}</span>"? 
                This will also delete all {cards.length} card{cards.length !== 1 ? 's' : ''} in this list.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteList}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Delete List
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}