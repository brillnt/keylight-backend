
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(`
    -- Create a temporary table to store unique users
    CREATE TEMPORARY TABLE temp_users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) UNIQUE,
        email_address VARCHAR(255) UNIQUE
    );

    -- Insert unique users from intake_submissions into temp_users
    INSERT INTO temp_users (full_name, email_address)
    SELECT DISTINCT full_name, email_address
    FROM intake_submissions
    ON CONFLICT (full_name) DO NOTHING;

    -- Insert new users into the users table from temp_users
    INSERT INTO users (full_name, email_address)
    SELECT tu.full_name, tu.email_address
    FROM temp_users tu
    ON CONFLICT (email_address) DO NOTHING;

    -- Create a temporary table to store unique projects
    CREATE TEMPORARY TABLE temp_projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT
    );

    -- Insert unique projects from intake_submissions into temp_projects
    INSERT INTO temp_projects (name, description)
    SELECT DISTINCT project_description, project_description
    FROM intake_submissions;

    -- Insert new projects into the projects table from temp_projects
    INSERT INTO projects (name, description)
    SELECT tp.name, tp.description
    FROM temp_projects tp;

    -- Update intake_submissions with user_id and project_id
    UPDATE intake_submissions
    SET
        user_id = u.id,
        project_id = p.id
    FROM
        users u,
        projects p
    WHERE
        intake_submissions.email_address = u.email_address AND
        intake_submissions.project_description = p.description;

    -- Clean up temporary tables
    DROP TABLE temp_users;
    DROP TABLE temp_projects;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    -- Revert user_id and project_id in intake_submissions
    UPDATE intake_submissions
    SET user_id = NULL, project_id = NULL;

    -- Delete all records from users and projects tables
    -- WARNING: This will delete all users and projects, including those not from intake_submissions.
    -- In a real-world scenario, a more sophisticated rollback would be needed.
    DELETE FROM users;
    DELETE FROM projects;
  `);
};
