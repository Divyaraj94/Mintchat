import Note from '../models/Note.js';
import Chat from '../models/Chat.js';

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { chatId, content, parentId = null, status = 'active', tags = [] } = req.body;

    // Verify the chat exists and belongs to this user
    const chat = await Chat.findById(chatId);
    if (!chat || chat.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // If parentId is provided, verify it exists and belongs to same user/chat
    if (parentId) {
      const parentNote = await Note.findById(parentId);
      if (!parentNote || parentNote.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Parent note not found' });
      }
    }

    const note = new Note({
      userId: req.user._id,
      chatId,
      parentId: parentId || null,
      category: chat.name,
      content,
      status,
      tags,
    });

    const createdNote = await note.save();

    // Touch the chat's updatedAt so it sorts to top
    chat.updatedAt = new Date();
    await chat.save();

    res.status(201).json(createdNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotesByChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const notes = await Note.find({ userId: req.user._id, chatId }).sort({ createdAt: 1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note && note.userId.toString() === req.user._id.toString()) {
      // Also delete all child notes of this note
      await Note.deleteMany({ parentId: note._id, userId: req.user._id });
      await note.deleteOne();
      res.json({ message: 'Note and its children removed' });
    } else {
      res.status(404).json({ message: 'Note not found or user not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { content, tags } = req.body;
    const note = await Note.findById(req.params.id);

    if (note && note.userId.toString() === req.user._id.toString()) {
      note.content = content;
      if (tags !== undefined) note.tags = tags;
      const updatedNote = await note.save();
      res.json(updatedNote);
    } else {
      res.status(404).json({ message: 'Note not found or user not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New: Update only the status of a note
export const updateNoteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active, pending, or completed.' });
    }

    const note = await Note.findById(req.params.id);

    if (note && note.userId.toString() === req.user._id.toString()) {
      note.status = status;
      const updatedNote = await note.save();
      res.json(updatedNote);
    } else {
      res.status(404).json({ message: 'Note not found or user not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
