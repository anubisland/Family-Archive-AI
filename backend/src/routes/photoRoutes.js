import express from 'express';
import {
  uploadPhotos,
  getAllPhotos,
  getPhotoById,
  getPhotosByPerson,
  searchPhotos,
  updatePhoto,
  deletePhoto,
  getPhotoStats,
  upload
} from '../controllers/photoController.js';

const router = express.Router();

// @route   POST /api/photos
// @desc    Upload photos
router.post('/', upload.array('photos', 10), uploadPhotos);

// @route   GET /api/photos/stats
// @desc    Get photo statistics
router.get('/stats', getPhotoStats);

// @route   GET /api/photos/search
// @desc    Search photos by filename, event name, or person
router.get('/search', searchPhotos);

// @route   GET /api/photos/person/:personId
// @desc    Get photos by person
router.get('/person/:personId', getPhotosByPerson);

// @route   GET /api/photos
// @desc    Get all photos with pagination
router.get('/', getAllPhotos);

// @route   GET /api/photos/:id
// @desc    Get photo by ID
router.get('/:id', getPhotoById);

// @route   PUT /api/photos/:id
// @desc    Update photo
router.put('/:id', updatePhoto);

// @route   DELETE /api/photos/:id
// @desc    Delete photo
router.delete('/:id', deletePhoto);

export default router;
