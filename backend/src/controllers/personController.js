import Person from '../models/Person.js';
import Joi from 'joi';

// Validation schema for person creation
const createPersonSchema = Joi.object({
  full_name: Joi.string().required().min(2).max(100),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  birth_date: Joi.date().optional(),
  death_date: Joi.date().optional(),
  biography: Joi.string().optional(),
  avatar_url: Joi.string().uri().optional()
});

// Validation schema for person update
const updatePersonSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  birth_date: Joi.date().optional(),
  death_date: Joi.date().optional(),
  biography: Joi.string().optional(),
  avatar_url: Joi.string().uri().optional()
}).min(1); // At least one field must be provided

// @desc    Create a new person
// @route   POST /api/persons
// @access  Public
export const createPerson = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createPersonSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Create person
    const person = await Person.create(value);

    res.status(201).json({
      success: true,
      data: person,
      message: 'Person created successfully'
    });
  } catch (error) {
    console.error('Create person error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create person',
      message: error.message
    });
  }
};

// @desc    Get all persons with pagination
// @route   GET /api/persons
// @access  Public
export const getAllPersons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const persons = await Person.findAll(limit, offset);

    res.json({
      success: true,
      data: persons,
      pagination: {
        page,
        limit,
        total: persons.length
      }
    });
  } catch (error) {
    console.error('Get all persons error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch persons',
      message: error.message
    });
  }
};

// @desc    Get person by ID
// @route   GET /api/persons/:id
// @access  Public
export const getPersonById = async (req, res) => {
  try {
    const { id } = req.params;

    const person = await Person.findById(id);
    if (!person) {
      return res.status(404).json({
        success: false,
        error: 'Person not found'
      });
    }

    res.json({
      success: true,
      data: person
    });
  } catch (error) {
    console.error('Get person by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch person',
      message: error.message
    });
  }
};

// @desc    Update person
// @route   PUT /api/persons/:id
// @access  Public
export const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updatePersonSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const person = await Person.update(id, value);
    if (!person) {
      return res.status(404).json({
        success: false,
        error: 'Person not found'
      });
    }

    res.json({
      success: true,
      data: person,
      message: 'Person updated successfully'
    });
  } catch (error) {
    console.error('Update person error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update person',
      message: error.message
    });
  }
};

// @desc    Delete person
// @route   DELETE /api/persons/:id
// @access  Public
export const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Person.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Person not found'
      });
    }

    res.json({
      success: true,
      message: 'Person deleted successfully'
    });
  } catch (error) {
    console.error('Delete person error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete person',
      message: error.message
    });
  }
};

// @desc    Search persons by name
// @route   GET /api/persons/search?q=searchTerm
// @access  Public
export const searchPersons = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required'
      });
    }

    const persons = await Person.searchByName(searchTerm);

    res.json({
      success: true,
      data: persons,
      total: persons.length
    });
  } catch (error) {
    console.error('Search persons error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search persons',
      message: error.message
    });
  }
};

// @desc    Get person's family relationships
// @route   GET /api/persons/:id/family
// @access  Public
export const getPersonFamily = async (req, res) => {
  try {
    const { id } = req.params;

    const relationships = await Person.getFamilyRelationships(id);

    res.json({
      success: true,
      data: relationships
    });
  } catch (error) {
    console.error('Get person family error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch family relationships',
      message: error.message
    });
  }
};

// @desc    Get person's timeline
// @route   GET /api/persons/:id/timeline
// @access  Public
export const getPersonTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const timeline = await Person.getTimeline(id);

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Get person timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline',
      message: error.message
    });
  }
};
