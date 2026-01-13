import express from 'express';
import {
  createPerson,
  getAllPersons,
  getPersonById,
  updatePerson,
  deletePerson,
  searchPersons,
  getPersonFamily,
  getPersonTimeline
} from '../controllers/personController.js';

const router = express.Router();

// @route   POST /api/persons
// @desc    Create a new person
router.post('/', createPerson);

// @route   GET /api/persons/search
// @desc    Search persons by name
router.get('/search', searchPersons);

// @route   GET /api/persons
// @desc    Get all persons with pagination
router.get('/', getAllPersons);

// @route   GET /api/persons/:id
// @desc    Get person by ID
router.get('/:id', getPersonById);

// @route   PUT /api/persons/:id
// @desc    Update person
router.put('/:id', updatePerson);

// @route   DELETE /api/persons/:id
// @desc    Delete person
router.delete('/:id', deletePerson);

// @route   GET /api/persons/:id/family
// @desc    Get person's family relationships
router.get('/:id/family', getPersonFamily);

// @route   GET /api/persons/:id/timeline
// @desc    Get person's timeline
router.get('/:id/timeline', getPersonTimeline);

export default router;
