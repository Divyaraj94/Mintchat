import express from 'express';
import {
  getNotes,
  createNote,
  getNotesByChat,
  deleteNote,
  updateNote,
  updateNoteStatus,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/chat/:chatId').get(protect, getNotesByChat);
router.route('/:id').delete(protect, deleteNote).put(protect, updateNote);
router.route('/:id/status').put(protect, updateNoteStatus);

export default router;
