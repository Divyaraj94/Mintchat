import mongoose from 'mongoose';

const noteSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Chat',
    },
    // parentId: null means this note is a direct child of the gem root.
    // parentId: <noteId> means this is a sub-note (grandchild of the gem).
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      default: null,
    },
    category: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
    // Progress/status of this node in the graph
    status: {
      type: String,
      enum: ['active', 'pending', 'completed'],
      default: 'active',
    },
    // Optional tags for filtering in the graph view
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
