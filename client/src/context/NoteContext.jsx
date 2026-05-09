import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/chats', config);
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [user]);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // If we have an active chatId, fetch notes for that specific chat
      // Otherwise fetch all notes
      const url = activeChatId
        ? `/api/notes/chat/${activeChatId}`
        : '/api/notes';
      
      const { data } = await axios.get(url, config);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [user, activeChatId]);

  useEffect(() => {
    fetchNotes();
    fetchChats();
  }, [fetchNotes, fetchChats]);

  const createChat = async (name, type = 'chat') => {
    if (!user) return null;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/chats', { name, type }, config);
      await fetchChats();
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      // Show the duplicate name error to the user
      const msg = error.response?.data?.message || 'Error creating chat';
      alert(msg);
      return null;
    }
  };

  const addNote = async (content, chatId) => {
    if (!user || !chatId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/notes', { content, chatId }, config);
      
      // If we're viewing this chat, add the note to local state
      if (activeChatId === chatId || !activeChatId) {
        setNotes(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const editNote = async (id, content) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/notes/${id}`, { content }, config);
      setNotes(prev => prev.map(note => note._id === id ? data : note));
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  const deleteNote = async (id) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/notes/${id}`, config);
      setNotes(prev => prev.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const renameChat = async (chatId, newName) => {
    if (!user || !newName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      await axios.put(`/api/chats/${chatId}`, { newName }, config);

      await fetchChats();
    } catch (error) {
      console.error('Error renaming chat:', error);
      const msg = error.response?.data?.message || 'Error renaming chat';
      alert(msg);
    }
  };

  const deleteChatHistory = async (chatId) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/chats/${chatId}`, config);
      
      // If we're viewing this chat, clear the active state
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setActiveCategory('All');
      }
      
      await fetchChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const togglePinChat = async (chatId) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/chats/${chatId}/pin`, {}, config);
      await fetchChats();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  return (
    <NoteContext.Provider value={{ 
      notes, 
      chats,
      loading, 
      activeChatId,
      setActiveChatId,
      activeCategory, 
      setActiveCategory, 
      searchQuery,
      setSearchQuery,
      addNote, 
      editNote,
      deleteNote,
      createChat,
      renameChat,
      deleteChatHistory,
      togglePinChat,
      fetchNotes,
      fetchChats
    }}>
      {children}
    </NoteContext.Provider>
  );
};
