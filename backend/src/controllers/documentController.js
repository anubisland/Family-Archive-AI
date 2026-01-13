import Document from '../models/Document.js';
import OCRService from '../services/ocrService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Joi from 'joi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/documents');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Validation schema
const updateDocumentSchema = Joi.object({
  person_id: Joi.string().uuid().optional(),
  document_type: Joi.string().optional(),
  extracted_text: Joi.string().optional(),
  clean_text: Joi.string().optional(),
  confidence_score: Joi.number().min(0).max(100).optional(),
  tags: Joi.string().optional()
});

// @desc    Upload and process document
// @route   POST /api/documents
// @access  Public
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { person_id } = req.body;
    const file = req.file;
    
    console.log(`Processing uploaded file: ${file.originalname}`);

    // Process document with OCR if it's an image
    let ocrResult = null;
    if (file.mimetype.startsWith('image/')) {
      try {
        ocrResult = await OCRService.processDocument(file.path, file.originalname);
      } catch (error) {
        console.error('OCR processing failed:', error);
        // Continue without OCR data
      }
    }

    // Create document record
    const documentData = {
      person_id: person_id || null,
      file_path: file.path,
      original_filename: file.originalname,
      document_type: ocrResult?.documentType || 'unknown',
      extracted_text: ocrResult?.originalText || null,
      clean_text: ocrResult?.cleanedText || null,
      confidence_score: ocrResult?.confidence || 0,
      tags: ocrResult?.keyInfo ? JSON.stringify(ocrResult.keyInfo) : null,
      file_size: file.size,
      mime_type: file.mimetype
    };

    const document = await Document.create(documentData);

    res.status(201).json({
      success: true,
      data: {
        document,
        ocr_result: ocrResult
      },
      message: 'Document uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      message: error.message
    });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Public
export const getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const documents = await Document.findAll(limit, offset);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total: documents.length
      }
    });
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Public
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document',
      message: error.message
    });
  }
};

// @desc    Get documents by person
// @route   GET /api/documents/person/:personId
// @access  Public
export const getDocumentsByPerson = async (req, res) => {
  try {
    const { personId } = req.params;

    const documents = await Document.findByPerson(personId);

    res.json({
      success: true,
      data: documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Get documents by person error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
};

// @desc    Search documents
// @route   GET /api/documents/search?q=searchTerm
// @access  Public
export const searchDocuments = async (req, res) => {
  try {
    const { q: searchTerm, type } = req.query;

    let documents;
    if (searchTerm) {
      documents = await Document.searchByText(searchTerm);
    } else if (type) {
      documents = await Document.findByType(type);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Search term or type is required'
      });
    }

    res.json({
      success: true,
      data: documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search documents',
      message: error.message
    });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Public
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateDocumentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const document = await Document.update(id, value);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document',
      message: error.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Public
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document to find file path
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from filesystem
    try {
      fs.unlinkSync(document.file_path);
    } catch (error) {
      console.warn('Could not delete file:', document.file_path);
    }

    // Delete from database
    const deleted = await Document.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
      message: error.message
    });
  }
};

// @desc    Reprocess document with OCR
// @route   POST /api/documents/:id/reprocess
// @access  Public
export const reprocessDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Only reprocess image files
    if (!document.mime_type.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Only image documents can be reprocessed'
      });
    }

    // Process with OCR
    const ocrResult = await OCRService.processDocument(document.file_path, document.original_filename);

    // Update document with new OCR results
    const updateData = {
      document_type: ocrResult.documentType,
      extracted_text: ocrResult.originalText,
      clean_text: ocrResult.cleanedText,
      confidence_score: ocrResult.confidence,
      tags: JSON.stringify(ocrResult.keyInfo)
    };

    const updatedDocument = await Document.update(id, updateData);

    res.json({
      success: true,
      data: {
        document: updatedDocument,
        ocr_result: ocrResult
      },
      message: 'Document reprocessed successfully'
    });
  } catch (error) {
    console.error('Reprocess document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reprocess document',
      message: error.message
    });
  }
};
