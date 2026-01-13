import express from 'express';
import {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentsByPerson,
  searchDocuments,
  updateDocument,
  deleteDocument,
  reprocessDocument,
  upload
} from '../controllers/documentController.js';

const router = express.Router();

// @route   POST /api/documents
// @desc    Upload and process document
router.post('/', upload.single('document'), uploadDocument);

// @route   GET /api/documents/search
// @desc    Search documents by text or type
router.get('/search', searchDocuments);

// @route   GET /api/documents/person/:personId
// @desc    Get documents by person
router.get('/person/:personId', getDocumentsByPerson);

// @route   GET /api/documents
// @desc    Get all documents with pagination
router.get('/', getAllDocuments);

// @route   GET /api/documents/:id
// @desc    Get document by ID
router.get('/:id', getDocumentById);

// @route   PUT /api/documents/:id
// @desc    Update document
router.put('/:id', updateDocument);

// @route   DELETE /api/documents/:id
// @desc    Delete document
router.delete('/:id', deleteDocument);

// @route   POST /api/documents/:id/reprocess
// @desc    Reprocess document with OCR
router.post('/:id/reprocess', reprocessDocument);

export default router;
