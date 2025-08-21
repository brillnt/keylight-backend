# Database Schema Documentation

This document provides a comprehensive overview of the current database structure for the Keylight Backend system.

**Last Updated:** August 21, 2025  
**Database:** keylight_intake_db  

---

## Database Overview

The system uses a PostgreSQL database with three main tables that handle user management, project tracking, and intake submissions. The database implements a clean separation between users, projects, and submissions with proper foreign key relationships.

### Table Relationships

```
Users (1) ──→ (Many) Projects
Users (1) ──→ (Many) Intake Submissions  
Projects (1) ──→ (Many) Intake Submissions
```

---

## 👥 Users Table

Stores user account information and contact details.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | Integer | Yes | Auto-increment | Primary key |
| **full_name** | String (255) | Yes | - | User's complete name |
| **email_address** | String (255) | Yes | - | Primary email (unique) |
| **phone_number** | String (20) | No | - | Contact phone number |
| **company_name** | String (255) | No | - | Business/company name |
| **created_at** | Timestamp | No | Current time | Record creation date |
| **updated_at** | Timestamp | No | Current time | Last modification date |

### Constraints & Indexes

- **Primary Key:** `id`
- **Unique Constraint:** `email_address` 
- **Indexes:**
  - `idx_users_email` on `email_address`
  - `idx_users_created_at` on `created_at`

### Relationships

- **One-to-Many with Projects:** `users.id` → `projects.user_id` (CASCADE DELETE)
- **One-to-Many with Submissions:** `users.id` → `intake_submissions.user_id` (SET NULL on DELETE)

---

## 📁 Projects Table

Stores project information and details from intake forms.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | Integer | Yes | Auto-increment | Primary key |
| **name** | String (255) | Yes | - | Project name/title |
| **description** | Text | No | - | Detailed project description |
| **status** | String (50) | No | 'planning' | Current project status |
| **user_id** | Integer | No | - | Foreign key to users table |

#### Project Details from Intake Forms

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| **buyer_category** | String (50) | - | 'homebuyer' or 'developer' |
| **financing_plan** | String (50) | - | 'self_funding' or 'finance_build' |
| **interested_in_preferred_lender** | Boolean | false | Wants lender recommendations |
| **land_status** | String (50) | - | 'own_land' or 'need_land' |
| **lot_address** | Text | - | Property address if land owned |
| **needs_help_finding_land** | Boolean | false | Requires land finding assistance |
| **preferred_area_description** | Text | - | Desired location description |
| **build_budget** | String (50) | - | Budget range category |
| **construction_timeline** | String (50) | - | Timeline for construction start |

#### ClickUp Integration (Prepared for Phase 2)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| **clickup_task_id** | String (255) | - | ClickUp task identifier |
| **clickup_list_id** | String (255) | - | ClickUp list identifier |

#### System Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| **created_at** | Timestamp | Current time | Record creation date |
| **updated_at** | Timestamp | Current time | Last modification date |

### Constraints & Indexes

- **Primary Key:** `id`
- **Foreign Key:** `user_id` → `users.id` (CASCADE DELETE)
- **Indexes:**
  - `idx_projects_user_id` on `user_id`
  - `idx_projects_status` on `status`
  - `idx_projects_created_at` on `created_at`
  - `idx_projects_clickup_task_id` on `clickup_task_id`

---

## 📋 Intake Submissions Table

Stores intake form submissions with rich business logic and validation.

### Contact Information

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **id** | Integer | Yes | Primary key (auto-increment) |
| **full_name** | String (255) | Yes | Customer's complete name |
| **email_address** | String (255) | Yes | Primary contact email |
| **phone_number** | String (20) | Yes | Contact phone number |
| **company_name** | String (255) | No | Business/company name |

### Business Classification

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| **buyer_category** | String (50) | Yes | 'homebuyer', 'developer' | Customer type |
| **financing_plan** | String (50) | Yes | 'self_funding', 'finance_build' | Payment method |
| **interested_in_preferred_lender** | Boolean | No | Default: false | Wants lender recommendations |

### Land & Location

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| **land_status** | String (50) | Yes | 'own_land', 'need_land' | Land ownership status |
| **lot_address** | Text | No | - | Property address (if owned) |
| **needs_help_finding_land** | Boolean | No | Default: false | Requires land assistance |
| **preferred_area_description** | Text | No | - | Desired location details |

### Project Specifications

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| **build_budget** | String (50) | Yes | '200k_250k', '250k_350k', '350k_400k', '400k_500k', '500k_plus' | Budget range |
| **construction_timeline** | String (50) | Yes | 'less_than_3_months', '3_to_6_months', '6_to_12_months', 'more_than_12_months' | Start timeline |
| **project_description** | Text | No | - | Detailed project requirements |

### System & Admin Fields

| Field | Type | Required | Valid Values | Default | Description |
|-------|------|----------|--------------|---------|-------------|
| **status** | String (50) | No | 'new', 'reviewed', 'qualified', 'disqualified', 'contacted' | 'new' | Processing status |
| **admin_notes** | Text | No | - | - | Internal team notes |
| **referral_source** | String (100) | No | - | 'Ritz-Craft' | How customer found us |
| **created_at** | Timestamp | No | - | Current time | Submission date |
| **updated_at** | Timestamp | No | - | Current time | Last modification |

### Relationship Fields

| Field | Type | Description |
|-------|------|-------------|
| **user_id** | Integer | Foreign key to users table |
| **project_id** | Integer | Foreign key to projects table |

### Constraints & Validation

#### Check Constraints
- **buyer_category:** Must be 'homebuyer' or 'developer'
- **financing_plan:** Must be 'self_funding' or 'finance_build'  
- **land_status:** Must be 'own_land' or 'need_land'
- **build_budget:** Must be one of the defined budget ranges
- **construction_timeline:** Must be one of the defined timeline options
- **status:** Must be one of the defined status values

#### Indexes
- **Primary Key:** `id`
- **Performance Indexes:**
  - `idx_intake_submissions_email` on `email_address`
  - `idx_intake_submissions_created_at` on `created_at`
  - `idx_intake_submissions_status` on `status`
  - `idx_intake_submissions_buyer_category` on `buyer_category`
  - `idx_intake_submissions_land_status` on `land_status`
  - `idx_intake_submissions_status_created` on `(status, created_at)`
  - `idx_intake_submissions_buyer_budget` on `(buyer_category, build_budget)`
  - `idx_intake_submissions_timeline_status` on `(construction_timeline, status)`
  - `idx_intake_submissions_active` on `created_at` WHERE status IN ('new', 'reviewed', 'qualified')
  - `idx_intake_submissions_referral_source` on `referral_source`

#### Foreign Key Constraints
- **user_id** → `users.id` (SET NULL on DELETE)
- **project_id** → `projects.id` (SET NULL on DELETE)

#### Triggers
- **update_intake_submissions_updated_at:** Automatically updates `updated_at` timestamp on record modifications

---

## 🔧 Migration System

The database uses **Knex.js** for migration management:

- **knex_migrations** - Tracks applied migrations
- **knex_migrations_lock** - Prevents concurrent migrations
- **schema_migrations** - Legacy migration tracking (archived)

### Current Migration Status
- ✅ Initial schema baseline established
- ✅ User and project ID population completed
- ✅ All foreign key relationships established
- ✅ Full indexing and constraints implemented

---

## 📊 Data Relationships Summary

### User → Projects Relationship
- **Type:** One-to-Many
- **Cascade:** DELETE on user removes all projects
- **Business Rule:** A user can have multiple projects

### User → Submissions Relationship  
- **Type:** One-to-Many
- **Cascade:** SET NULL on user delete (preserve submission data)
- **Business Rule:** A user can have multiple submissions

### Project → Submissions Relationship
- **Type:** One-to-Many  
- **Cascade:** SET NULL on project delete (preserve submission data)
- **Business Rule:** A project can have multiple submissions

---

## 🚀 Future Extensions

The database is prepared for:

- **ClickUp Integration:** Task and list ID fields ready
- **Enhanced Project Management:** Status workflows and milestone tracking
- **Audit Trails:** Comprehensive change tracking
- **Performance Optimization:** Strategic indexing for complex queries

