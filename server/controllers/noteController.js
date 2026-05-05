import Note from '../models/Note.js';

export const getRecentChats = async (req, res) => {
  try {
    const chats = await Note.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$category", lastNoteAt: { $max: "$createdAt" } } },
      { $sort: { lastNoteAt: -1 } }
    ]);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    const { category, content } = req.body;

    const note = new Note({
      userId: req.user._id,
      category,
      content,
    });

    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const notes = await Note.find({ userId: req.user._id, category }).sort({ createdAt: 1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (note && note.userId.toString() === req.user._id.toString()) {
      await note.deleteOne();
      res.json({ message: 'Note removed' });
    } else {
      res.status(404).json({ message: 'Note not found or user not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { oldName } = req.params;
    const { newName } = req.body;
    
    if (!newName || !newName.trim()) {
      return res.status(400).json({ message: 'New name is required' });
    }

    const result = await Note.updateMany(
      { userId: req.user._id, category: oldName },
      { $set: { category: newName } }
    );

    res.json({ message: 'Chat renamed', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await Note.deleteMany({ userId: req.user._id, category: name });
    
    res.json({ message: 'Chat deleted', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
