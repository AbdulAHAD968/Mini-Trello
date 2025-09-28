'use client';
import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';
import { Card as CardType } from '@/lib/models';
import { PriorityBadge } from './PriorityBadge';
import { CardActions } from './CardActions';

interface CardProps {
  card: CardType;
  index: number;
  onCardUpdate?: () => void;
  onCardDelete?: () => void;
}

export function Card({ card, index, onCardUpdate, onCardDelete }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get border color based on priority
  const getPriorityBorderColor = () => {
    if (!card.priority || card.priority === 'medium') return 'border-stone-200';
    
    switch (card.priority) {
      case 'low':
        return 'border-teal-200';
      case 'high':
        return 'border-amber-200';
      case 'urgent':
        return 'border-red-200';
      default:
        return 'border-stone-200';
    }
  };

  // Get background color based on priority (subtle effect)
  const getPriorityBackgroundColor = () => {
    if (!card.priority || card.priority === 'medium') return 'bg-white';
    
    switch (card.priority) {
      case 'low':
        return 'bg-teal-50';
      case 'high':
        return 'bg-amber-50';
      case 'urgent':
        return 'bg-red-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            ${getPriorityBackgroundColor()} ${getPriorityBorderColor()} 
            p-4 rounded-lg border cursor-grab active:cursor-grabbing relative group
            transition-shadow duration-200
            ${snapshot.isDragging ? 'shadow-2xl bg-white' : 'shadow-sm hover:shadow-lg'}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Card Actions (Edit/Delete) - Show on hover */}
          {(isHovered || snapshot.isDragging) && (
            <CardActions 
              card={card} 
              onCardUpdate={onCardUpdate}
              onCardDelete={onCardDelete}
            />
          )}

          {/* Priority Badge */}
          {card.priority && card.priority !== 'medium' && (
            <div className="mb-2">
              <PriorityBadge priority={card.priority} />
            </div>
          )}

          {/* Card Title */}
          <h3 className={`font-medium text-sm mb-2 pr-8 ${
            card.priority === 'urgent' ? 'text-red-900' : 'text-stone-900'
          }`}>
            {card.title}
          </h3>
          
          {/* Card Description */}
          {card.description && (
            <p className={`text-xs line-clamp-3 mb-3 ${
              card.priority === 'urgent' ? 'text-red-700' : 'text-stone-600'
            }`}>
              {card.description}
            </p>
          )}

          {/* Card Footer - Due Date & Assigned */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
            <div className="flex items-center space-x-2">
              {card.dueDate && (
                <span className={`text-xs flex items-center ${
                  card.priority === 'urgent' ? 'text-red-600' : 'text-stone-500'
                }`}>
                  <FaCalendarAlt className="mr-1 w-3 h-3" />
                  {new Date(card.dueDate).toLocaleDateString()}
                  
                  {/* Show overdue indicator */}
                  {new Date(card.dueDate) < new Date() && (
                    <FaExclamationCircle className="ml-1 w-3 h-3 text-red-500" title="Overdue" />
                  )}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Priority Indicator Dot (small visual cue) */}
              {card.priority && card.priority !== 'medium' && (
                <div className={`w-2 h-2 rounded-full ${
                  card.priority === 'low' ? 'bg-teal-500' :
                  card.priority === 'high' ? 'bg-amber-500' :
                  card.priority === 'urgent' ? 'bg-red-500' : 'bg-stone-400'
                }`} />
              )}
              
              {card.assignedTo && card.assignedTo.length > 0 && (
                <div className="flex -space-x-1">
                  {card.assignedTo.slice(0, 2).map((user, userIndex) => (
                    <div
                      key={userIndex}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white ${
                        card.priority === 'urgent' ? 'bg-red-500' : 'bg-teal-500'
                      }`}
                      title={typeof user === 'object' ? user.name : 'Unknown User'}
                    >
                      {typeof user === 'object' 
                        ? user.name?.charAt(0)?.toUpperCase() || 'U'
                        : 'U'
                      }
                    </div>
                  ))}
                  {card.assignedTo.length > 2 && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white ${
                      card.priority === 'urgent' ? 'bg-red-400' : 'bg-stone-400'
                    }`}>
                      +{card.assignedTo.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subtle priority indicator on the left side */}
          {card.priority && card.priority !== 'medium' && (
            <div 
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                card.priority === 'low' ? 'bg-teal-400' :
                card.priority === 'high' ? 'bg-amber-400' :
                card.priority === 'urgent' ? 'bg-red-400' : ''
              }`}
            />
          )}
        </div>
      )}
    </Draggable>
  );
}