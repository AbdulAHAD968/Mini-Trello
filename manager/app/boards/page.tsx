'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Board {
  _id: string;
  title: string;
  description: string;
  owner: User;
  members: User[];
  createdAt: string;
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMembersForm, setShowMembersForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [managingMembersBoard, setManagingMembersBoard] = useState<Board | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hoveredBoard, setHoveredBoard] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
    fetchBoards();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (newMemberEmail.trim()) {
        searchUsers(newMemberEmail);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [newMemberEmail]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/boards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newBoardTitle,
          description: newBoardDescription,
        }),
      });

      if (response.ok) {
        const newBoard = await response.json();
        setBoards([...boards, newBoard]);
        setNewBoardTitle('');
        setNewBoardDescription('');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleEditBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard || !editBoardTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/boards/${editingBoard._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editBoardTitle,
          description: editBoardDescription,
        }),
      });

      if (response.ok) {
        const updatedBoard = await response.json();
        setBoards(boards.map(board => 
          board._id === updatedBoard._id ? updatedBoard : board
        ));
        setShowEditForm(false);
        setEditingBoard(null);
        setEditBoardTitle('');
        setEditBoardDescription('');
      }
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  const handleDeleteBoard = async () => {
    if (!deletingBoard) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/boards/${deletingBoard._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setBoards(boards.filter(board => board._id !== deletingBoard._id));
        setShowDeleteConfirm(false);
        setDeletingBoard(null);
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const searchUsers = async (email: string) => {
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (user: User) => {
    if (!managingMembersBoard) return;

    try {
      setIsAddingMember(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/boards/${managingMembersBoard._id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          email: user.email,
        }),
      });

      if (response.ok) {
        const updatedBoard = await response.json();
        setBoards(boards.map(board => 
          board._id === updatedBoard._id ? updatedBoard : board
        ));
        setManagingMembersBoard(updatedBoard);
        setNewMemberEmail('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!managingMembersBoard) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/boards/${managingMembersBoard._id}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      if (response.ok) {
        const updatedBoard = await response.json();
        setBoards(boards.map(board => 
          board._id === updatedBoard._id ? updatedBoard : board
        ));
        setManagingMembersBoard(updatedBoard);
      } else {
        const errorData = await response.json();
        console.error('Error removing member:', errorData.error);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error removing member. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const openEditForm = (board: Board) => {
    setEditingBoard(board);
    setEditBoardTitle(board.title);
    setEditBoardDescription(board.description || '');
    setShowEditForm(true);
  };

  const openMembersForm = (board: Board) => {
    setManagingMembersBoard(board);
    setShowMembersForm(true);
  };

  const openDeleteConfirm = (board: Board) => {
    setDeletingBoard(board);
    setShowDeleteConfirm(true);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(boards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBoards(items);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mb-4"></div>
          <p className="text-teal-700 font-medium">Loading your boards...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <header className="relative bg-white/80 backdrop-blur-md shadow-sm border-b border-teal-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg mr-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              BoardHub
            </Link>
          </motion.div>
          <div className="flex items-center">
            <motion.button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </motion.button>
            <div className="hidden md:flex items-center space-x-6">
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-teal-800 font-medium flex items-center bg-teal-50 px-3 py-1 rounded-full border border-teal-100"
              >
                <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {currentUser.name}
              </motion.span>
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleLogout}
                className="bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 border border-teal-200 transition-all duration-300 font-semibold flex items-center shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </motion.button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white/90 backdrop-blur-sm border-t border-teal-100"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-teal-800 font-medium flex items-center bg-teal-50 px-3 py-2 rounded-full border border-teal-100"
                >
                  <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {currentUser.name}
                </motion.span>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleLogout}
                  className="bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 border border-teal-200 transition-all duration-300 font-semibold flex items-center shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-900 to-cyan-800 bg-clip-text text-transparent mb-2">
              My Boards
            </h1>
            <p className="text-teal-700 text-sm sm:text-base">Manage your workspaces and collaborate with your team</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Board
          </motion.button>
        </motion.div>

        {/* Create Board Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md sm:max-w-lg shadow-2xl border border-teal-100"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2">Create New Board</h2>
                <p className="text-teal-600 mb-6 text-sm sm:text-base">Start organizing your projects and tasks</p>
                <form onSubmit={handleCreateBoard}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-teal-800 mb-2">
                      Board Title
                    </label>
                    <input
                      type="text"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      className="w-full p-3 border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter board title"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-teal-800 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                      className="w-full p-3 border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                      placeholder="What's this board about?"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Create Board
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Board Modal */}
        <AnimatePresence>
          {showEditForm && editingBoard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md sm:max-w-lg shadow-2xl border border-teal-100"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2">Edit Board</h2>
                <p className="text-teal-600 mb-6 text-sm sm:text-base">Update your board details</p>
                <form onSubmit={handleEditBoard}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-teal-800 mb-2">
                      Board Title
                    </label>
                    <input
                      type="text"
                      value={editBoardTitle}
                      onChange={(e) => setEditBoardTitle(e.target.value)}
                      className="w-full p-3 border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter board title"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-teal-800 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editBoardDescription}
                      onChange={(e) => setEditBoardDescription(e.target.value)}
                      className="w-full p-3 border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                      placeholder="What's this board about?"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Update Board
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingBoard(null);
                      }}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manage Members Modal */}
        <AnimatePresence>
          {showMembersForm && managingMembersBoard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md sm:max-w-lg shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2">
                  Team Members
                </h2>
                <p className="text-teal-600 mb-6 text-sm sm:text-base">{managingMembersBoard.title}</p>
                
                {/* Add Member Section */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-teal-800 mb-3">
                    Add Team Member
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="flex-1 p-3 border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  {/* Search Results */}
                  {isSearching && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 flex items-center justify-center p-4"
                    >
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent"></div>
                    </motion.div>
                  )}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 border border-teal-200 rounded-xl overflow-hidden bg-teal-50/50 backdrop-blur-sm"
                      >
                        {searchResults.map((user) => (
                          <motion.div
                            key={user._id}
                            whileHover={{ scale: 1.02 }}
                            className="flex justify-between items-center p-3 hover:bg-teal-100 cursor-pointer transition-all duration-200 border-b border-teal-100 last:border-b-0"
                            onClick={() => handleAddMember(user)}
                          >
                            <div>
                              <div className="font-semibold text-teal-900">{user.name}</div>
                              <div className="text-sm text-teal-600">{user.email}</div>
                            </div>
                            {isAddingMember ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent"></div>
                            ) : (
                              <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {newMemberEmail && !isSearching && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-center text-teal-600 bg-teal-50 rounded-xl p-3"
                    >
                      No users found with this email
                    </motion.div>
                  )}
                </div>

                {/* Current Members List */}
                <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-4">Current Members</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {/* Owner */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white shadow-lg"
                    >
                      <div>
                        <div className="font-semibold flex items-center">
                          {managingMembersBoard.owner.name}
                          <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full backdrop-blur-sm">
                            Owner
                          </span>
                        </div>
                        <div className="text-sm text-white/80">{managingMembersBoard.owner.email}</div>
                      </div>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>

                    {/* Other Members */}
                    <AnimatePresence>
                      {managingMembersBoard.members
                        .filter(member => member._id !== managingMembersBoard.owner._id)
                        .map((member, index) => (
                          <motion.div
                            key={member._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex justify-between items-center p-4 border border-teal-200 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-teal-50 transition-all duration-200"
                          >
                            <div>
                              <div className="font-semibold text-teal-900">{member.name}</div>
                              <div className="text-sm text-teal-600">{member.email}</div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-red-500 hover:text-red-600 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                              title="Remove member"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </motion.button>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-teal-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMembersForm(false);
                      setManagingMembersBoard(null);
                      setNewMemberEmail('');
                      setSearchResults([]);
                    }}
                    className="px-6 py-3 rounded-xl font-semibold border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all duration-300"
                  >
                    Done
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && deletingBoard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md sm:max-w-lg shadow-2xl border border-teal-100 text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2">Delete Board</h2>
                <p className="text-teal-600 mb-6 text-sm sm:text-base">
                  Are you sure you want to delete <span className="font-semibold text-teal-800">"{deletingBoard.title}"</span>? 
                  This action cannot be undone and all data will be lost.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteBoard}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  >
                    Delete Board
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletingBoard(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12 sm:py-16 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-teal-100"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-teal-400 mb-6"
            >
              <svg className="w-24 sm:w-32 h-24 sm:h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold text-teal-900 mb-3">No boards yet</h3>
            <p className="text-teal-600 mb-6 text-sm sm:text-base max-w-md mx-auto">Create your first board to start organizing your projects and collaborating with your team</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Your First Board
            </motion.button>
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="boards" direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {boards.map((board, index) => (
                    <Draggable key={board._id} draggableId={board._id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            transition: { delay: index * 0.1 }
                          }}
                          whileHover={{ 
                            y: -8,
                            transition: { duration: 0.2 }
                          }}
                          onHoverStart={() => setHoveredBoard(board._id)}
                          onHoverEnd={() => setHoveredBoard(null)}
                          className={`
                            group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 
                            border-2 transition-all duration-300 cursor-pointer
                            ${snapshot.isDragging 
                              ? 'shadow-2xl border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 scale-105 rotate-2' 
                              : 'shadow-lg hover:shadow-2xl border-teal-200/80 hover:border-teal-400'
                            }
                            ${hoveredBoard === board._id ? 'ring-4 ring-teal-500/20' : ''}
                          `}
                        >
                          {/* Gradient Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <Link href={`/boards/${board._id}`} className="flex-1">
                                <h3 className="font-bold text-lg sm:text-xl text-teal-900 group-hover:text-teal-800 transition-colors duration-200 line-clamp-2 leading-tight">
                                  {board.title}
                                </h3>
                              </Link>
                              <div {...provided.dragHandleProps} className="text-teal-400 group-hover:text-teal-600 transition-colors duration-200 p-2 cursor-move ml-2 hover:bg-teal-50 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                            </div>

                            {board.description && (
                              <p className="text-teal-700 text-sm mb-6 line-clamp-3 leading-relaxed">{board.description}</p>
                            )}

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-teal-600 font-medium">
                                {new Date(board.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center text-teal-700 font-medium">
                                  <svg className="w-4 h-4 mr-1 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                                  </svg>
                                  {board.members.length + 1}
                                </span>
                                {currentUser && board.owner._id === currentUser._id && (
                                  <span className="px-2 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold rounded-full shadow-sm">
                                    Owner
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons - Animated on Hover */}
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ 
                                opacity: hoveredBoard === board._id ? 1 : 0.7, 
                                y: hoveredBoard === board._id ? 0 : 10 
                              }}
                              className="flex justify-end space-x-2 mt-4 pt-4 border-t border-teal-200/50"
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openMembersForm(board);
                                }}
                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-2 rounded-lg transition-all duration-200"
                                title="Manage members"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openEditForm(board);
                                }}
                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-2 rounded-lg transition-all duration-200"
                                title="Edit board"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDeleteConfirm(board);
                                }}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                title="Delete board"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>
    </div>
  );
}