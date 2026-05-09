import mongoose from 'mongoose';

const chatSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['chat', 'notebook', 'gem'],
      default: 'chat',
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
