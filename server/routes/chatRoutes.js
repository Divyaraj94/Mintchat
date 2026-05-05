import express from 'express';
import {
  getChats,
  createChat,
  renameChat,
  deleteChat,
  togglePinChat,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getChats).post(protect, createChat);
router.route('/:id').put(protect, renameChat).delete(protect, deleteChat);
router.route('/:id/pin').put(protect, togglePinChat);

export default router;
