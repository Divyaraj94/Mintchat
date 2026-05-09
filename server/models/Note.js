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
    category: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
