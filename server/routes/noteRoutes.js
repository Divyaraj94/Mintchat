import express from 'express';
import {
  getNotes,
  createNote,
  getNotesByCategory,
  deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/category/:category').get(protect, getNotesByCategory);
router.route('/:id').delete(protect, deleteNote);

export default router;
