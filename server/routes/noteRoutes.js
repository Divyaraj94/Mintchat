import express from 'express';
import {
  getNotes,
  createNote,
  getNotesByChat,
  deleteNote,
  updateNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/chat/:chatId').get(protect, getNotesByChat);
router.route('/:id').delete(protect, deleteNote).put(protect, updateNote);

export default router;
