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
    const { name, type = 'chat' } = req.body;

    // Prevent duplicate names for the same user
    const existing = await Chat.findOne({ userId: req.user._id, name });
    if (existing) {
      return res.status(400).json({ message: `A ${existing.type} with this name already exists. Please choose a different name.` });
    }

    const newChat = new Chat({
      userId: req.user._id,
      name,
      type,
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

    // Prevent renaming to an existing name
    const existing = await Chat.findOne({ userId: req.user._id, name: newName, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: `A ${existing.type} with this name already exists. Please choose a different name.` });
    }

    chat.name = newName;
    const updatedChat = await chat.save();

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

    await chat.deleteOne();

    // Delete all notes linked to this chat by chatId
    await Note.deleteMany({ chatId: id });

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
