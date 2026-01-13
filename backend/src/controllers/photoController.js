import Photo from '../models/Photo.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import Joi from 'joi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/photos');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for photos
  fileFilter
});

// Validation schemas
const updatePhotoSchema = Joi.object({
  person_id: Joi.string().uuid().optional().allow(null),
  event_name: Joi.string().optional().allow(''),
  date_taken: Joi.date().optional().allow(null),
  detected_faces: Joi.number().integer().min(0).optional(),
  width: Joi.number().integer().min(1).optional(),
  height: Joi.number().integer().min(1).optional()
});

// Helper function to get image dimensions and process image
const processImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Create optimized versions
    const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg');
    const mediumPath = filePath.replace(/\.[^/.]+$/, '_medium.jpg');
    
    // Generate thumbnail (200x200)
    await sharp(filePath)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    // Generate medium size (800x800)
    await sharp(filePath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);
    
    return {
      width: metadata.width,
      height: metadata.height,
      thumbnailPath,
      mediumPath
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    return { width: null, height: null };
  }
};

// @desc    Upload photos
// @route   POST /api/photos
// @access  Public
export const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const { person_id, event_name, date_taken } = req.body;
    const uploadedPhotos = [];

    for (const file of req.files) {
      try {
        console.log(`Processing uploaded photo: ${file.originalname}`);

        // Process image to get dimensions and create optimized versions
        const imageData = await processImage(file.path);

        // Create photo record
        // Store relative path from uploads directory for proper URL construction
        const relativePath = `/uploads/photos/${file.filename}`;
        
        const photoData = {
          person_id: person_id || null,
          file_path: relativePath,
          original_filename: file.originalname,
          event_name: event_name || null,
          date_taken: date_taken || null,
          detected_faces: 0, // TODO: Implement face detection
          file_size: file.size,
          width: imageData.width,
          height: imageData.height
        };

        const photo = await Photo.create(photoData);
        uploadedPhotos.push(photo);

      } catch (error) {
        console.error(`Failed to process photo ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    if (uploadedPhotos.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to upload any photos'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        photos: uploadedPhotos,
        count: uploadedPhotos.length
      },
      message: `Successfully uploaded ${uploadedPhotos.length} photo(s)`
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photos',
      message: error.message
    });
  }
};

// @desc    Get all photos
// @route   GET /api/photos
// @access  Public
export const getAllPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Photo.findAll(page, limit);

    res.status(200).json({
      success: true,
      data: result.photos,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Get all photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos',
      message: error.message
    });
  }
};

// @desc    Get photo by ID
// @route   GET /api/photos/:id
// @access  Public
export const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: photo
    });
  } catch (error) {
    console.error('Get photo by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photo',
      message: error.message
    });
  }
};

// @desc    Get photos by person ID
// @route   GET /api/photos/person/:personId
// @access  Public
export const getPhotosByPerson = async (req, res) => {
  try {
    const photos = await Photo.findByPersonId(req.params.personId);

    res.status(200).json({
      success: true,
      data: photos,
      count: photos.length
    });
  } catch (error) {
    console.error('Get photos by person error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos for person',
      message: error.message
    });
  }
};

// @desc    Search photos
// @route   GET /api/photos/search
// @access  Public
export const searchPhotos = async (req, res) => {
  try {
    const { q: query, date_from, date_to } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let result;

    if (date_from && date_to) {
      // Search by date range
      result = await Photo.findByDateRange(date_from, date_to, page, limit);
    } else if (query) {
      // Search by text
      result = await Photo.search(query, page, limit);
    } else {
      // Return all photos if no search criteria
      result = await Photo.findAll(page, limit);
    }

    res.status(200).json({
      success: true,
      data: result.photos,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Search photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search photos',
      message: error.message
    });
  }
};

// @desc    Update photo
// @route   PUT /api/photos/:id
// @access  Public
export const updatePhoto = async (req, res) => {
  try {
    // Validate request body
    const { error } = updatePhotoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.details[0].message
      });
    }

    const photo = await Photo.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: photo,
      message: 'Photo updated successfully'
    });
  } catch (error) {
    console.error('Update photo error:', error);
    
    if (error.message === 'Photo not found or no changes made') {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update photo',
      message: error.message
    });
  }
};

// @desc    Delete photo
// @route   DELETE /api/photos/:id
// @access  Public
export const deletePhoto = async (req, res) => {
  try {
    // Get photo info before deletion to clean up files
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    // Delete the photo record
    await Photo.delete(req.params.id);

    // Clean up files
    try {
      if (fs.existsSync(photo.file_path)) {
        fs.unlinkSync(photo.file_path);
      }
      
      // Clean up generated versions
      const thumbnailPath = photo.file_path.replace(/\.[^/.]+$/, '_thumb.jpg');
      const mediumPath = photo.file_path.replace(/\.[^/.]+$/, '_medium.jpg');
      
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      if (fs.existsSync(mediumPath)) {
        fs.unlinkSync(mediumPath);
      }
    } catch (fileError) {
      console.error('Failed to delete photo files:', fileError);
      // Continue anyway - database record is deleted
    }

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    
    if (error.message === 'Photo not found') {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete photo',
      message: error.message
    });
  }
};

// @desc    Get photo statistics
// @route   GET /api/photos/stats
// @access  Public
export const getPhotoStats = async (req, res) => {
  try {
    const stats = await Photo.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get photo stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get photo statistics',
      message: error.message
    });
  }
};
