const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Validation middleware for submission data
const validateSubmission = (req, res, next) => {
  const {
    full_name,
    email_address,
    phone_number,
    buyer_category,
    financing_plan,
    land_status,
    build_budget,
    construction_timeline
  } = req.body;

  // Required fields validation
  const requiredFields = [
    'full_name',
    'email_address', 
    'phone_number',
    'buyer_category',
    'financing_plan',
    'land_status',
    'build_budget',
    'construction_timeline'
  ];

  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missing_fields: missingFields
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email_address)) {
    return res.status(400).json({
      error: 'Invalid email address format'
    });
  }

  // Enum validation
  const validBuyerCategories = ['homebuyer', 'developer'];
  const validFinancingPlans = ['self_funding', 'finance_build'];
  const validLandStatuses = ['own_land', 'need_land'];
  const validBuildBudgets = ['200k_250k', '250k_350k', '350k_400k', '400k_500k', '500k_plus'];
  const validTimelines = ['less_than_3_months', '3_to_6_months', '6_to_12_months', 'more_than_12_months'];

  if (!validBuyerCategories.includes(buyer_category)) {
    return res.status(400).json({
      error: 'Invalid buyer_category',
      valid_options: validBuyerCategories
    });
  }

  if (!validFinancingPlans.includes(financing_plan)) {
    return res.status(400).json({
      error: 'Invalid financing_plan',
      valid_options: validFinancingPlans
    });
  }

  if (!validLandStatuses.includes(land_status)) {
    return res.status(400).json({
      error: 'Invalid land_status',
      valid_options: validLandStatuses
    });
  }

  if (!validBuildBudgets.includes(build_budget)) {
    return res.status(400).json({
      error: 'Invalid build_budget',
      valid_options: validBuildBudgets
    });
  }

  if (!validTimelines.includes(construction_timeline)) {
    return res.status(400).json({
      error: 'Invalid construction_timeline',
      valid_options: validTimelines
    });
  }

  next();
};

// POST /api/submissions - Create new submission
router.post('/', validateSubmission, async (req, res) => {
  try {
    const {
      full_name,
      email_address,
      phone_number,
      company_name,
      buyer_category,
      financing_plan,
      interested_in_preferred_lender,
      land_status,
      lot_address,
      needs_help_finding_land,
      preferred_area_description,
      build_budget,
      construction_timeline,
      project_description
    } = req.body;

    const query = `
      INSERT INTO intake_submissions (
        full_name, email_address, phone_number, company_name,
        buyer_category, financing_plan, interested_in_preferred_lender,
        land_status, lot_address, needs_help_finding_land, preferred_area_description,
        build_budget, construction_timeline, project_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      full_name,
      email_address,
      phone_number,
      company_name || null,
      buyer_category,
      financing_plan,
      interested_in_preferred_lender || false,
      land_status,
      lot_address || null,
      needs_help_finding_land || null,
      preferred_area_description || null,
      build_budget,
      construction_timeline,
      project_description || null
    ];

    const result = await pool.query(query, values);
    const submission = result.rows[0];

    console.log(`✅ New submission created: ID ${submission.id} - ${submission.full_name}`);

    res.status(201).json({
      message: 'Submission created successfully',
      submission: submission
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({
      error: 'Failed to create submission',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/submissions - List all submissions (for admin)
router.get('/', async (req, res) => {
  try {
    const { status, buyer_category, land_status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM intake_submissions';
    let values = [];
    let whereConditions = [];

    // Add filtering
    if (status) {
      whereConditions.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (buyer_category) {
      whereConditions.push(`buyer_category = $${values.length + 1}`);
      values.push(buyer_category);
    }

    if (land_status) {
      whereConditions.push(`land_status = $${values.length + 1}`);
      values.push(land_status);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM intake_submissions';
    let countValues = [];
    
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
      countValues = values.slice(0, -2); // Remove limit and offset
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      submissions: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      error: 'Failed to fetch submissions',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/submissions/:id - Get single submission
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid submission ID'
      });
    }

    const query = 'SELECT * FROM intake_submissions WHERE id = $1';
    const result = await pool.query(query, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Submission not found'
      });
    }

    res.json({
      submission: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      error: 'Failed to fetch submission',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/submissions/:id - Update submission (for admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    // Validate ID is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid submission ID'
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['new', 'reviewed', 'qualified', 'disqualified', 'contacted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          valid_options: validStatuses
        });
      }
    }

    // Build dynamic update query
    let updateFields = [];
    let values = [];

    if (status) {
      updateFields.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (admin_notes !== undefined) {
      updateFields.push(`admin_notes = $${values.length + 1}`);
      values.push(admin_notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update'
      });
    }

    const query = `
      UPDATE intake_submissions 
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    values.push(parseInt(id));

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Submission not found'
      });
    }

    console.log(`✅ Submission updated: ID ${id} - Status: ${status || 'unchanged'}`);

    res.json({
      message: 'Submission updated successfully',
      submission: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      error: 'Failed to update submission',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

