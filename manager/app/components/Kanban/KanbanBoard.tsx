'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { Board, List as ListType, Card as CardType } from '@/lib/models';
import { List } from './List';
import { AddList } from './AddList';
import { BoardHeader } from './BoardHeader';
import { Toast } from '../ui/Toast';

interface KanbanBoardProps {
  board: Board;
}

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

// Memoize the initial state
const initialToastState: ToastState = {
  message: '',
  type: 'info',
  visible: false,
};

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const [lists, setLists] = useState<ListType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);
  
  // Use refs to prevent unnecessary re-renders
  const listsRef = useRef<ListType[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update ref when lists change
  useEffect(() => {
    listsRef.current = lists;
  }, [lists]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Memoized fetch functions
  const fetchCardsForList = useCallback(async (listId: string, token: string): Promise<CardType[]> => {
    try {
      const cardsResponse = await fetch(`/api/cards?listId=${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current?.signal,
      });
      
      if (cardsResponse.ok) {
        return await cardsResponse.json();
      }
      return [];
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error(`Error fetching cards for list ${listId}:`, error);
      }
      return [];
    }
  }, []);

  const fetchLists = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/lists?boardId=${board._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }
      
      const data = await response.json();
      
      // Fetch cards for each list in parallel with limit
      const listsWithCards = await Promise.all(
        data.map(async (list: ListType) => {
          const cards = await fetchCardsForList(list._id, token);
          return { ...list, cards };
        })
      );
      
      // Sort lists by position
      const sortedLists = listsWithCards.sort((a, b) => a.position - b.position);
      setLists(sortedLists);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching lists:', error);
        showToast('Failed to load board data', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [board._id, fetchCardsForList, showToast]);

  useEffect(() => {
    fetchLists();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLists]);

  // Memoized API calls
  const updateListPosition = useCallback(async (listId: string, position: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ position }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update list position');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating list position:', error);
      throw error;
    }
  }, []);

  const updateCardPosition = useCallback(async (cardId: string, listId: string, position: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          listId, 
          position 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update card position');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating card position:', error);
      throw error;
    }
  }, []);

  // Optimized drag handlers
  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(async (result: DropResult) => {
    setIsDragging(false);
    const { destination, source, draggableId, type } = result;

    // Early returns for invalid operations
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Store original lists for rollback
    const originalLists = [...listsRef.current];

    try {
      // Handle list reordering
      if (type === 'list') {
        const newLists = Array.from(listsRef.current);
        const [removed] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, removed);
        
        const updatedLists = newLists.map((list, index) => ({
          ...list,
          position: index,
        }));
        
        // Optimistic update
        setLists(updatedLists);
        
        // Update positions in background
        Promise.all(
          updatedLists.map((list, index) => 
            updateListPosition(list._id, index).catch(error => {
              console.error(`Failed to update list ${list._id}:`, error);
              throw error;
            })
          )
        ).then(() => {
          showToast('List order updated successfully', 'success');
        }).catch(() => {
          // Revert on error
          setLists(originalLists);
          showToast('Failed to update list positions', 'error');
        });
        
        return;
      }

      // Handle card movement
      if (type === 'card') {
        const sourceListId = source.droppableId;
        const destinationListId = destination.droppableId;
        const cardId = draggableId;

        // Create deep copy of lists
        const newLists = listsRef.current.map(list => ({
          ...list,
          cards: list.cards ? [...list.cards] : [],
        }));
        
        // Find source and destination lists
        const sourceList = newLists.find(list => list._id === sourceListId);
        const destinationList = newLists.find(list => list._id === destinationListId);

        if (!sourceList || !destinationList) {
          throw new Error('Invalid list IDs');
        }

        // Find and move the card
        const cardIndex = sourceList.cards?.findIndex((card: CardType) => card._id === cardId) ?? -1;
        if (cardIndex === -1) {
          throw new Error('Card not found in source list');
        }

        const [movedCard] = sourceList.cards?.splice(cardIndex, 1) || [];
        if (!movedCard) {
          throw new Error('Failed to move card');
        }

        // Update card's listId if moving to different list
        if (sourceListId !== destinationListId) {
          movedCard.listId = destinationListId;
        }

        // Ensure cards array exists
        if (!destinationList.cards) {
          destinationList.cards = [];
        }

        // Add card to destination
        destinationList.cards.splice(destination.index, 0, movedCard);

        // Update positions for all cards in both lists
        const updateCardPositions = (cards: CardType[]) => 
          cards.map((card, index) => ({ ...card, position: index }));

        if (sourceList.cards) {
          sourceList.cards = updateCardPositions(sourceList.cards);
        }
        if (destinationList.cards) {
          destinationList.cards = updateCardPositions(destinationList.cards);
        }

        // Optimistic update
        setLists(newLists);
        
        // Update in background
        updateCardPosition(cardId, destinationListId, destination.index)
          .then(() => {
            const sourceListTitle = sourceList.title;
            const destListTitle = destinationList.title;
            const cardTitle = movedCard.title;
            
            const message = sourceListId === destinationListId 
              ? `Moved "${cardTitle}" within ${sourceListTitle}`
              : `Moved "${cardTitle}" from ${sourceListTitle} to ${destListTitle}`;
            
            showToast(message, 'success');
          })
          .catch(() => {
            // Revert on error
            setLists(originalLists);
            showToast('Failed to update card position', 'error');
          });
      }
    } catch (error) {
      // Revert optimistic update on error
      setLists(originalLists);
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      showToast(errorMessage, 'error');
      console.error('Drag operation failed:', error);
    }
  }, [updateListPosition, updateCardPosition, showToast]);

  // Memoized event handlers for child components
  const handleListUpdate = useCallback(() => {
    fetchLists();
  }, [fetchLists]);

  const handleListDelete = useCallback(() => {
    fetchLists();
  }, [fetchLists]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen transition-all duration-300 ${
      isDragging ? 'bg-blue-50' : ''
    }`}>
      <BoardHeader 
        board={board} 
        listCount={lists.length} 
        totalCards={lists.reduce((acc, list) => acc + (list.cards?.length || 0), 0)}
      />

      <DragDropContext 
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <Droppable 
          droppableId="all-lists" 
          direction="horizontal" 
          type="list"
        >
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex space-x-6 overflow-x-auto pb-8 pt-2 min-h-96 ${
                snapshot.isDraggingOver ? 'bg-blue-100/50 rounded-2xl' : ''
              } transition-all duration-300 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent`}
            >
              {lists.map((list, index) => (
                <List 
                  key={list._id} 
                  list={list} 
                  index={index}
                  onListUpdate={handleListUpdate}
                  onListDelete={handleListDelete}
                />
              ))}
              {provided.placeholder}
              <AddList 
                boardId={board._id} 
                onListAdded={handleListUpdate}
                position={lists.length}
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}