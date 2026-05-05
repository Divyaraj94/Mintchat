import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [chats, setChats] = useState([]);
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
      const url = activeCategory === 'All' || activeCategory === 'Home'
        ? '/api/notes' 
        : `/api/notes/category/${activeCategory}`;
      
      const { data } = await axios.get(url, config);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [user, activeCategory]);

  useEffect(() => {
    fetchNotes();
    fetchChats();
  }, [fetchNotes, fetchChats]);

  const createChat = async (name) => {
    if (!user) return null;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/chats', { name }, config);
      await fetchChats();
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  };

  const addNote = async (content, category = 'New Chat') => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/notes', { content, category }, config);
      
      if (activeCategory === 'All' || activeCategory === 'Home' || activeCategory === category) {
        setNotes(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding note:', error);
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
      
      // We don't have oldName easily here unless we pass it.
      // We will refetch chats.
      await fetchChats();
      await fetchNotes(); // this might need adjusting if activeCategory uses string names
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const deleteChatHistory = async (chatId) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/chats/${chatId}`, config);
      
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
      activeCategory, 
      setActiveCategory, 
      searchQuery,
      setSearchQuery,
      addNote, 
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
