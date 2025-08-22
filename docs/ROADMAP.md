# Keylight Backend Development Roadmap

## Overview
This roadmap outlines the development phases for integrating ClickUp API with our intake form system and evolving from a simple submission tracker to a comprehensive project management platform.

---

## Phase 1: Data Model Separation & Restructuring
**Goal:** Separate Users, Applications, and Projects into distinct entities with proper relationships

### 1.1 Database Schema Updates ✅ **COMPLETED**
- [x] Create `users` table (separate from applications)
- [x] Create `projects` table (one-to-many with applications)
- [x] Update `intake_submissions` to reference users and projects
- [x] Add foreign key relationships and constraints
- [x] Create migration scripts for existing data

### 1.2 **Milestone 1: User Management Foundation** ⏱️ *2-3 days*

#### Step 1.2.1: UserModel Implementation ✅ COMPLETED
- [x] Create `src/models/UserModel.js` extending BaseModel
- [x] **Test:** Write unit tests for UserModel instantiation and BaseModel inheritance

#### Step 1.2.1b: Test Infrastructure Enhancement ✅ COMPLETED  
- [x] Debug and resolve test database configuration issues
- [x] Implement complete test isolation approach (Option 1) for integration tests
- [x] Add `beforeEach` database cleanup to ensure each test starts with clean state
- [x] Create comprehensive integration test for empty database state
- [x] Verify all tests pass consistently (14/14 tests passing)

#### Step 1.2.2: UserModel Core Methods 🔄 IN PROGRESS
- [x] Add user-specific validation methods (email format, uniqueness)
- [x] **Test:** Write tests for email format validation (valid/invalid emails)
- [ ] Add email uniqueness check methods
- [ ] **Test:** Write tests for email uniqueness scenarios (new email, duplicate email)
- [ ] Add relationship queries: `getUserProjects()`, `getUserSubmissions()`
- [ ] **Test:** Write tests for relationship queries with mock data
- [ ] Add user search and filtering methods
- [ ] **Test:** Write tests for search functionality and edge cases

#### Step 1.2.3: UserService Implementation
- [ ] Create `src/services/UserService.js` with business logic
- [ ] **Test:** Write unit tests for UserService instantiation
- [ ] Implement user creation with duplicate email handling
- [ ] **Test:** Write tests for user creation (success and duplicate email scenarios)
- [ ] Add user-submission relationship management methods
- [ ] **Test:** Write tests for relationship management operations
- [ ] Add email validation and conflict resolution
- [ ] **Test:** Write tests for validation edge cases and error handling
- [ ] Add user update and deletion with cascade handling
- [ ] **Test:** Write tests for update/delete operations and cascade behavior

#### Step 1.2.3: User API Endpoints
- [ ] Create `src/routes/users.js` with full CRUD endpoints
- [ ] **Test:** Write integration tests for route setup and basic structure
- [ ] Add `GET /api/users` - List users with pagination and filtering
- [ ] **Test:** Write integration tests for GET /api/users (pagination, filtering)
- [ ] Add `POST /api/users` - Create new user with validation
- [ ] **Test:** Write integration tests for POST /api/users (success/validation errors)
- [ ] Add `GET /api/users/:id` - Get single user with relationships
- [ ] **Test:** Write integration tests for GET /api/users/:id (found/not found)
- [ ] Add `PUT /api/users/:id` - Update user information
- [ ] **Test:** Write integration tests for PUT /api/users/:id (success/validation/not found)
- [ ] Add `DELETE /api/users/:id` - Delete user with cascade options
- [ ] **Test:** Write integration tests for DELETE /api/users/:id (success/not found/cascade)
- [ ] Add `GET /api/users/:id/submissions` - Get user's submissions
- [ ] Add `GET /api/users/:id/projects` - Get user's projects
- [ ] **Test:** Write integration tests for relationship endpoints
- [ ] Add routes to main app.js routing
- [ ] **Test:** Create curl script for manual user endpoints testing

### 1.3 **Milestone 2: Project Management Foundation** ⏱️ *2-3 days*

#### Step 1.3.1: ProjectModel Implementation
- [ ] Create `src/models/ProjectModel.js` extending BaseModel
- [ ] **Test:** Write unit tests for ProjectModel instantiation and inheritance
- [ ] Add project-specific validation (name, description requirements)
- [ ] **Test:** Write tests for project validation rules (required fields, lengths)
- [ ] Add relationship queries: `getProjectSubmissions()`, `getProjectUsers()`
- [ ] **Test:** Write tests for relationship queries with various scenarios
- [ ] Add project status management methods
- [ ] **Test:** Write tests for status transitions and validation
- [ ] Add project search and filtering capabilities
- [ ] **Test:** Write tests for search and filtering functionality
- [ ] Add project timeline and budget tracking methods
- [ ] **Test:** Write tests for timeline and budget operations

#### Step 1.3.2: ProjectService Implementation
- [ ] Create `src/services/ProjectService.js` for business logic
- [ ] **Test:** Write unit tests for ProjectService instantiation
- [ ] Implement project lifecycle management (create, update, archive)
- [ ] **Test:** Write tests for project lifecycle operations
- [ ] Add user-project association logic and validation
- [ ] **Test:** Write tests for user-project associations (success/conflicts)
- [ ] Add project status workflow management
- [ ] **Test:** Write tests for status workflow transitions and validation
- [ ] Add project analytics and reporting methods
- [ ] **Test:** Write tests for analytics calculations and edge cases
- [ ] Add project duplicate detection and merging
- [ ] **Test:** Write tests for duplicate detection logic

#### Step 1.3.3: Project API Endpoints
- [ ] Create `src/routes/projects.js` with comprehensive endpoints
- [ ] **Test:** Write integration tests for route setup
- [ ] Add `GET /api/projects` - List projects with filtering and pagination
- [ ] **Test:** Write integration tests for GET /api/projects (filtering, pagination)
- [ ] Add `POST /api/projects` - Create new project
- [ ] **Test:** Write integration tests for POST /api/projects (success/validation)
- [ ] Add `GET /api/projects/:id` - Get single project with relationships
- [ ] **Test:** Write integration tests for GET /api/projects/:id
- [ ] Add `PUT /api/projects/:id` - Update project information
- [ ] **Test:** Write integration tests for PUT /api/projects/:id
- [ ] Add `DELETE /api/projects/:id` - Delete project with cascade handling
- [ ] **Test:** Write integration tests for DELETE /api/projects/:id (cascade behavior)
- [ ] Add `GET /api/projects/:id/submissions` - Get project submissions
- [ ] Add `GET /api/projects/:id/users` - Get project users
- [ ] Add `POST /api/projects/:id/users/:userId` - Associate user with project
- [ ] Add `DELETE /api/projects/:id/users/:userId` - Remove user from project
- [ ] **Test:** Write integration tests for all relationship endpoints
- [ ] Add routes to main app.js routing
- [ ] **Test:** Create curl script for manual project endpoints testing

### 1.4 **Milestone 3: Enhanced Submission Integration** ⏱️ *2-3 days*

#### Step 1.4.1: Update SubmissionModel
- [ ] Add relationship validation methods to SubmissionModel
- [ ] **Test:** Write tests for relationship validation rules
- [ ] Update submission creation to auto-create/link users and projects
- [ ] **Test:** Write tests for auto-creation logic (new users, existing users)
- [ ] Add methods: `findByUserId()`, `findByProjectId()`, `findByUserEmail()`
- [ ] **Test:** Write tests for new find methods with various scenarios
- [ ] Add cascade delete handling and orphan management
- [ ] **Test:** Write tests for cascade delete scenarios and orphan handling
- [ ] Add submission-user-project integrity validation
- [ ] **Test:** Write tests for data integrity validation
- [ ] Add batch operations for relationship updates
- [ ] **Test:** Write tests for batch operations and transaction handling

#### Step 1.4.2: Update SubmissionService
- [ ] Update SubmissionService to coordinate between all three entities
- [ ] **Test:** Write integration tests for multi-entity coordination
- [ ] Modify submission creation to auto-create users from submission data
- [ ] **Test:** Write tests for automatic user creation from submission data
- [ ] Add logic to create/link projects based on submission description
- [ ] **Test:** Write tests for automatic project creation and linking
- [ ] Add business rules for entity relationships and data integrity
- [ ] **Test:** Write tests for business rule enforcement
- [ ] Add conflict resolution for duplicate users/projects
- [ ] **Test:** Write tests for conflict resolution scenarios
- [ ] Add submission migration tools for data cleanup
- [ ] **Test:** Write tests for data migration and cleanup operations

#### Step 1.4.3: Update Submission API
- [ ] Update `POST /api/submissions` to handle automatic user/project creation
- [ ] **Test:** Write integration tests for enhanced submission creation
- [ ] Add relationship-based filtering to `GET /api/submissions`
- [ ] **Test:** Write integration tests for relationship filtering
- [ ] Add query parameters: `?userId=X`, `?projectId=Y`, `?userEmail=Z`
- [ ] **Test:** Write integration tests for new query parameters
- [ ] Add `GET /api/submissions/by-user/:userId` endpoint
- [ ] Add `GET /api/submissions/by-project/:projectId` endpoint
- [ ] **Test:** Write integration tests for new relationship endpoints
- [ ] Update submission response to include user and project data
- [ ] **Test:** Write tests for enhanced response format
- [ ] Add endpoints for bulk submission operations
- [ ] **Test:** Write integration tests for bulk operations

### 1.5 **Milestone 4: Testing & Documentation** ⏱️ *1-2 days*

#### Step 1.5.1: Comprehensive Testing Review
- [ ] Review all unit tests for completeness and coverage
- [ ] **Test:** Run coverage reports and identify gaps
- [ ] Add missing integration tests for multi-entity workflows
- [ ] **Test:** Write end-to-end workflow tests (user creation → project → submission)
- [ ] Add performance tests for relationship queries with large datasets
- [ ] **Test:** Write performance benchmarks for complex queries
- [ ] Update existing curl scripts for all new endpoints
- [ ] **Test:** Verify all curl scripts work with new functionality
- [ ] Add error scenario testing (cascade deletes, orphaned records)
- [ ] **Test:** Write tests for all error scenarios and edge cases
- [ ] Add concurrent operation testing for data integrity
- [ ] **Test:** Write tests for concurrent operations and race conditions

#### Step 1.5.2: Documentation Updates
- [ ] Update API documentation with all new endpoints
- [ ] Create entity relationship diagrams showing Users-Projects-Submissions
- [ ] Update README.md with new endpoint examples
- [ ] Document relationship business rules and constraints
- [ ] Add troubleshooting guide for common relationship issues
- [ ] Update curl-tests/README.md with new test descriptions

**Estimated Time:** 8-11 days total
**Dependencies:** Database schema updates (completed)
**Testing:** Maintain 100% backward compatibility, achieve 90%+ test coverage

---

## Phase 2: Basic ClickUp Integration
**Goal:** Connect with ClickUp API and create tasks for new applications

### 2.1 ClickUp API Setup
- [ ] ClickUp API authentication configuration
- [ ] Environment variables for ClickUp workspace/space/list IDs
- [ ] Create `ClickUpService` class for API interactions
- [ ] Error handling and rate limiting

### 2.2 Task Creation Integration
- [ ] Create ClickUp task when new application is submitted
- [ ] Map application data to ClickUp task fields
- [ ] Store ClickUp task ID in our database
- [ ] Handle ClickUp API failures gracefully

### 2.3 Basic Status Synchronization
- [ ] Map our status values to ClickUp statuses
- [ ] Update ClickUp task status when our status changes
- [ ] Add ClickUp task links to our admin dashboard
- [ ] Basic error logging and retry mechanisms

### 2.4 Configuration Management
- [ ] ClickUp workspace/project configuration
- [ ] Status mapping configuration
- [ ] Task template configuration
- [ ] Admin interface for ClickUp settings

**Estimated Time:** 2-3 weeks
**Dependencies:** Phase 1 completion
**Testing:** ClickUp API integration tests, mock API responses

---

## Phase 3: Advanced Task Management & Real-Time Sync
**Goal:** Bidirectional synchronization and advanced ClickUp features

### 3.1 Custom Fields Mapping
- [ ] Map budget ranges to ClickUp custom fields
- [ ] Map timeline preferences to ClickUp custom fields
- [ ] Map location data to ClickUp custom fields
- [ ] Map customer classification to ClickUp custom fields

### 3.2 Webhook Integration
- [ ] Set up ClickUp webhook endpoints
- [ ] Handle `taskStatusUpdated` events
- [ ] Handle `taskUpdated` events
- [ ] Update our database when ClickUp tasks change
- [ ] Webhook signature verification

### 3.3 Bidirectional Synchronization
- [ ] Real-time status updates from ClickUp to our system
- [ ] Conflict resolution for simultaneous updates
- [ ] Audit trail for all synchronization events
- [ ] Data consistency validation

### 3.4 Enhanced Task Management
- [ ] Task assignment integration
- [ ] Due date synchronization
- [ ] Comment synchronization
- [ ] Attachment handling

**Estimated Time:** 3-4 weeks
**Dependencies:** Phase 2 completion
**Testing:** Webhook testing, real-time sync validation

---

## Phase 4: Project Milestone Tracking
**Goal:** Track project phases and milestones through ClickUp integration

### 4.1 Project Phase Management
- [ ] Define standard project phases (Design, Permits, Construction, etc.)
- [ ] Create ClickUp subtasks for each project phase
- [ ] Track phase completion and dependencies
- [ ] Milestone date tracking and notifications

### 4.2 Timeline Management
- [ ] Project timeline creation and updates
- [ ] Critical path identification
- [ ] Delay tracking and notifications
- [ ] Resource allocation tracking

### 4.3 Progress Reporting
- [ ] Project progress calculation
- [ ] Milestone completion reporting
- [ ] Timeline variance analysis
- [ ] Automated progress updates

### 4.4 Client Communication
- [ ] Automated client notifications for milestone completion
- [ ] Progress sharing with clients
- [ ] Timeline update communications
- [ ] Issue escalation notifications

**Estimated Time:** 4-5 weeks
**Dependencies:** Phase 3 completion
**Testing:** End-to-end project lifecycle testing

---

## Phase 5: Enhanced Workflow & Analytics
**Goal:** Advanced project management features and business intelligence

### 5.1 Automated Workflow Management
- [ ] Rule-based task assignment
- [ ] Automated status transitions
- [ ] Escalation rules for overdue tasks
- [ ] Workflow templates for different project types

### 5.2 Team Management Integration
- [ ] ClickUp team member synchronization
- [ ] Workload balancing
- [ ] Skill-based task assignment
- [ ] Performance tracking

### 5.3 Advanced Analytics
- [ ] Project completion time analysis
- [ ] Bottleneck identification
- [ ] Resource utilization reporting
- [ ] Customer satisfaction tracking

### 5.4 Business Intelligence
- [ ] Lead conversion analytics
- [ ] Project profitability tracking
- [ ] Capacity planning
- [ ] Predictive analytics for project timelines

**Estimated Time:** 5-6 weeks
**Dependencies:** Phase 4 completion
**Testing:** Analytics validation, performance testing

---

## Technical Considerations

### Security
- [ ] ClickUp API key management
- [ ] Webhook signature verification
- [ ] Data encryption for sensitive information
- [ ] Access control for ClickUp integration features

### Performance
- [ ] API rate limiting and throttling
- [ ] Caching strategies for ClickUp data
- [ ] Background job processing for sync operations
- [ ] Database optimization for new relationships

### Monitoring & Logging
- [ ] ClickUp API interaction logging
- [ ] Sync operation monitoring
- [ ] Error tracking and alerting
- [ ] Performance metrics collection

### Documentation
- [ ] ClickUp integration setup guide
- [ ] API documentation updates
- [ ] Workflow configuration documentation
- [ ] Troubleshooting guides

---

## Success Metrics

### Phase 1
- All existing functionality preserved
- New data model supports future phases
- Zero data loss during migration

### Phase 2
- 100% of new applications create ClickUp tasks
- Status synchronization accuracy > 99%
- API response time < 2 seconds

### Phase 3
- Real-time sync latency < 30 seconds
- Webhook reliability > 99.5%
- Zero data conflicts

### Phase 4
- Project milestone tracking for all active projects
- Timeline accuracy improvement > 20%
- Client satisfaction increase

### Phase 5
- 50% reduction in manual project management tasks
- 25% improvement in project completion times
- Comprehensive business intelligence dashboard

---

## Risk Mitigation

### ClickUp API Dependencies
- **Risk:** ClickUp API changes or downtime
- **Mitigation:** Graceful degradation, local data backup, API versioning

### Data Synchronization
- **Risk:** Data inconsistency between systems
- **Mitigation:** Conflict resolution rules, audit trails, manual override capabilities

### Performance Impact
- **Risk:** ClickUp integration slows down our system
- **Mitigation:** Asynchronous processing, caching, performance monitoring

### User Adoption
- **Risk:** Team resistance to new workflow
- **Mitigation:** Training, gradual rollout, feedback incorporation

---

## Next Steps

1. **Immediate:** Begin Phase 1 database schema design
2. **Week 1:** Complete data model separation planning
3. **Week 2:** Start implementation of new database structure
4. **Week 4:** Begin ClickUp API research and setup
5. **Month 2:** Start Phase 2 implementation

**Last Updated:** August 18, 2025
**Next Review:** Weekly during active development



