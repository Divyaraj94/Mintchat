import Chat from '../models/Chat.js';
import Note from '../models/Note.js';

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const { name } = req.body;
    const newChat = new Chat({
      userId: req.user._id,
      name,
    });
    const createdChat = await newChat.save();
    res.status(201).json(createdChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { id } = req.params; // this is the Chat document _id
    const { newName } = req.body;

    const chat = await Chat.findById(id);
    if (!chat || chat.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const oldName = chat.name;
    chat.name = newName;
    const updatedChat = await chat.save();

    // Also update all notes that used the old name
    await Note.updateMany(
      { userId: req.user._id, category: oldName },
      { $set: { category: newName } }
    );

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat || chat.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const chatName = chat.name;
    await chat.deleteOne();

    // Delete all notes in this chat
    await Note.deleteMany({ userId: req.user._id, category: chatName });

    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePinChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat || chat.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.isPinned = !chat.isPinned;
    const updatedChat = await chat.save();

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
