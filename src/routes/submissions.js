/**
 * Submissions API Routes
 * REST endpoints for intake submission management
 */

import express from 'express';
import SubmissionService from '../services/SubmissionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();
const submissionService = new SubmissionService();

/**
 * POST /api/submissions
 * Create a new intake submission (public endpoint)
 */
router.post('/', asyncHandler(async (req, res) => {
  const result = await submissionService.createSubmission(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Submission created successfully',
    data: result.data
  });
}));

/**
 * GET /api/submissions
 * Get all submissions with filtering and pagination (admin endpoint)
 */
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    pageSize = 20,
    status,
    buyer_category,
    build_budget,
    construction_timeline
  } = req.query;

  // Build filters object
  const filters = {};
  if (status) filters.status = status;
  if (buyer_category) filters.buyer_category = buyer_category;
  if (build_budget) filters.build_budget = build_budget;
  if (construction_timeline) filters.construction_timeline = construction_timeline;

  const result = await submissionService.getSubmissions(
    filters,
    parseInt(page),
    parseInt(pageSize)
  );

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
    stats: result.stats,
    filters: filters
  });
}));

/**
 * GET /api/submissions/stats
 * Get submission statistics (admin endpoint)
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const result = await submissionService.getSubmissionStats();
  
  res.json({
    success: true,
    data: result.data
  });
}));

/**
 * GET /api/submissions/search
 * Search submissions by text (admin endpoint)
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q: searchTerm, page = 1, pageSize = 20 } = req.query;

  if (!searchTerm) {
    throw new ValidationError('Search term (q) is required');
  }

  const result = await submissionService.searchSubmissions(
    searchTerm,
    parseInt(page),
    parseInt(pageSize)
  );

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
    searchTerm: result.searchTerm
  });
}));

/**
 * GET /api/submissions/recent
 * Get recent submissions (admin endpoint)
 */
router.get('/recent', asyncHandler(async (req, res) => {
  const { days = 7, limit = 10 } = req.query;

  const result = await submissionService.getRecentSubmissions(
    parseInt(days),
    parseInt(limit)
  );

  res.json({
    success: true,
    data: result.data,
    count: result.count,
    days: result.days
  });
}));

/**
 * GET /api/submissions/:id
 * Get a single submission by ID (admin endpoint)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await submissionService.getSubmissionById(id);
  
  res.json({
    success: true,
    data: result.data
  });
}));

/**
 * PUT /api/submissions/:id/status
 * Update submission status (admin endpoint)
 */
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  if (!status) {
    throw new ValidationError('Status is required');
  }

  const result = await submissionService.updateSubmissionStatus(
    id,
    status,
    admin_notes
  );

  res.json({
    success: true,
    message: result.message,
    data: result.data
  });
}));

/**
 * DELETE /api/submissions/:id
 * Delete a submission (admin endpoint)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await submissionService.deleteSubmission(id);
  
  res.json({
    success: true,
    message: result.message,
    data: result.data
  });
}));

/**
 * GET /api/submissions/status/:status
 * Get submissions by status (admin endpoint)
 */
router.get('/status/:status', asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page = 1, pageSize = 20 } = req.query;

  const result = await submissionService.getSubmissionsByStatus(
    status,
    parseInt(page),
    parseInt(pageSize)
  );

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
    stats: result.stats,
    status: status
  });
}));

/**
 * GET /api/submissions (root endpoint documentation)
 */
router.get('/', (req, res, next) => {
  // If no query parameters, show API documentation
  if (Object.keys(req.query).length === 0) {
    res.json({
      message: 'Keylight Submissions API',
      version: '1.0.0',
      endpoints: {
        'POST /api/submissions': {
          description: 'Create a new intake submission',
          access: 'public',
          body: 'Submission data object'
        },
        'GET /api/submissions': {
          description: 'Get all submissions with filtering',
          access: 'admin',
          query: 'page, pageSize, status, buyer_category, build_budget, construction_timeline'
        },
        'GET /api/submissions/stats': {
          description: 'Get submission statistics',
          access: 'admin'
        },
        'GET /api/submissions/search': {
          description: 'Search submissions by text',
          access: 'admin',
          query: 'q (search term), page, pageSize'
        },
        'GET /api/submissions/recent': {
          description: 'Get recent submissions',
          access: 'admin',
          query: 'days, limit'
        },
        'GET /api/submissions/:id': {
          description: 'Get single submission by ID',
          access: 'admin'
        },
        'PUT /api/submissions/:id/status': {
          description: 'Update submission status',
          access: 'admin',
          body: 'status, admin_notes (optional)'
        },
        'DELETE /api/submissions/:id': {
          description: 'Delete submission',
          access: 'admin'
        },
        'GET /api/submissions/status/:status': {
          description: 'Get submissions by status',
          access: 'admin',
          query: 'page, pageSize'
        }
      },
      validStatuses: ['new', 'reviewed', 'qualified', 'disqualified', 'contacted'],
      validBuyerCategories: ['homebuyer', 'developer'],
      validBuildBudgets: ['200k_250k', '250k_350k', '350k_400k', '400k_500k', '500k_plus'],
      validTimelines: ['less_than_3_months', '3_to_6_months', '6_to_12_months', 'more_than_12_months']
    });
  } else {
    // If query parameters exist, proceed to the GET handler above
    next();
  }
});

export default router;

