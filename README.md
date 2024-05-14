# <p align="center"> 330 Final Project <br> Mental Health Behavioral Tracking </p>

## Table of contents
1. [Description of Scenario and Problem](#description)
2. [General Design](#generaldesign)
3. [Technical Components](#builtwith) 
4. [Clear and direct call-outs](#callouts)
5. [Timeline and Plan](#tasks)

## Description of Scenario and Problem <a name="description"></a>

**Scenario your project is operating in.**
- This project/API operates within the healthtech sector, catering to both therapy users and individuals managing their mental health independently.
- Its goal is to allow users to track their mental well-being offline, facilitating the identification of patterns.

**What problem your project seeks to solve.**

- One challenge in therapy is the gap between sessions, where users struggle to recall and discuss pertinent events from the past week(s). 
- This project hopes to address this by enabling users to engage in brief daily records, not only aiding in recall but also helps users identify triggers and patterns. 
- Healthcare providers can then leverage this data to offer targeted insights during sessions.

## General Design <a name="generaldesign"></a>
The API utilizes MongoDB collections to manage user and provider functionalities. 
- Users and physicians can sign up, login, and logout using dedicated routes, with authentication required for accessing other API endpoints.
- Authorization features ensure that healthcare providers have access to their patients/users' data, including the ability to update and delete appointments.
- Aside from login, other API endpoints include
	- **User Route:** Users can change their passwords and provider (if any).
	- **Behavioral Tracking Reports Route:** Users can post, update, get, and delete their daily behavioral tracking reports. Healthcare providers have access to all reports from their patients/users.
	- **Appointment Route:** Users can post and get their appointments, while only healthcare providers can update or delete appointments. Providers can also retrieve all appointments for their patients/users.

## Technical Components <a name="builtwith"></a>
### Dependencies
- Express
- MongoDB
- Mongoose
- Jests for unit tests
- bcrypt for password hashing
- jsonwebtoken for password tokens

### Initial Set Up (To add)

### Models
- **Users:** Username (unique, required), email (unique, required), password (required), name (required), role [Patient/Healthcare Provider], Healthcare Provider’s userId
  - Assume each user has only one Healthcare Provider assigned for now
- **Behavior Tracking Report:** userId (required, ref), Date (required), Mood rating (required), Symptom tracker (Inattentiveness, hyperactivity, impulsitivity), Journaling, Medication reactions
  - Index for text search
- **Appointment management:** userId (required, ref), Date (required), Time, userId (required), Healthcare Provider's userId (required, ref)

### DAOs
#### User
- **createUser(userObj):** create a user record
- **getUser(email):** get a user record using their email
- **updateUserPassword(userId, password):** update the user's password field
- **updateUserProvider(userId, providerId)**: update user’s healthcare provider

#### Report
- **createReport(userId, reportObj):** create a behavioral report for the given user
- **getReportById(userId, reportId):** get a specific behavioral report for the given user
- **getReports(userId isProvider):** get all behavioral reports for the given user
- **getReportsBySearchTerm(userId, searchTerms):** get all behavioral reports for the given user based on search terms
- **getReportStats(userId):** get stats for mood ratings and symptom tracking from all behavioral reports for the given user

#### Appointment
- **createAppt(userId, date, providerId):** create new appointments for given user 
- **getAppt(userId, isProvider):** get appointments for a given user
- **updateAppt(userId, providerId, apptObj):** update appointments of a given user for a healthcare provider
- **deleteAppt(userId, providerId):** delete appointments of a given user for a healthcare provider

<details>
<summary><h3>Brief Routes: (see <a href="#4-crud-routes">CRUD Routes</a> for detailed description)</h3></summary> 

- Login
	- POST Signup, Login
	- PUT Change Password
- Users (requires authentication): If user is logged in,
	- GET users (requires authorization) of healthcare provider, user by ID
	- PUT provider
- Reports (requires authentication): If the user is logged in,
	- POST report
	- GET report, report stats, report search, report by ID
	- PUT report by ID
	- DELETE report by ID
- Appointments (requires authentication): If the user is logged in,
	- POST appointments
	- GET appointments, appointments by ID
	- Only healthcare providers (requires authorization):
		- PUT appointments by ID
		- DELETE appointments by ID
- Middleware
	- *isAuthenticated* - should the user has a valid jwt token during login.
	- *IsAuthorized* - should verify if the user is a Healthcare Provider, else return 403 forbidden error.
	- *Error handling* - router.use(error, req, res, next) - handle errors where the provided appointment id or report id is not a valid ObjectId.
</details> 

### Nice to haves
- Front end forms for users, behavioral tracking reports, and apppointments 

## Clear and direct call-outs<a name="callouts"></a>
### 1. Authentication & Authorization in Middleware
- Authentication: Check if the user has a valid jwt token during login, else return 400 error.
- Authorization: Verify if the user is a Healthcare Provider, else return 403 forbidden error.
- Error handling - router.use(error, req, res, next) - handle errors where the provided appointment id or report id is not a valid ObjectId.
### 2. Indexes for performance and uniqueness when reasonable
- User: Index for email
- Behavioral Tracking Reports: Index for text search
### 3. At least one of text search, aggregations, and lookups
- Text search in Behavioral Tracking Reports
- Aggregated statistics of mood ratings in Behavioral Tracking Reports
### 4. CRUD Routes<a name="#4-crud-routes"></a> 
**Login**
- `POST /auth/signup` - Store user with their name, username, email, and encrypted password.
	- Return 400 error if email has been used.
- `POST /auth/login` -  Find the user with the provided email/username. Use bcrypt to compare stored password with the incoming password. If they match, generate a JWT token.
	- Return 400 error if token does not match.
- `PUT /auth/password` - If the user is logged in, store the incoming password using their userId
	- Return 400 error if request fails
- `POST /auth/logout`
	
**Users**
- `GET /users` (requires authorization) - returns array of all users (if Healthcare Providers)
- `GET /users/:id` (requires authentication) - returns user information with provided id
- `PUT /users/:id/provider` (requires authentication) update user’s provider ID

**Reports** (requires authentication): If the user is logged in,
- `POST /reports` - store report along with their userId.
- `GET /reports` - returns all reports for their userId. If Healthcare Provider, should get array of logs from all patients/users
- `GET /reports/stats` - returns an aggregated stats of mood rating and symptom tracking. If Healthcare Provider, should get array of reports of aggregated stats from all patients/users
- `GET /reports/search` - returns reports with that search term. If Healthcare Provider, should get array of reports with that search term from all patients/users
- `GET /reports/:id` - returns the report with the provided id and that has their userId. If Healthcare Provider, should get specified report.
- `PUT /reports/:id` - updates the report with the provided id and that has their userId
- `DELETE /reports/:id` - deletes report with provided id from specified user.

**Appointments** (requires authentication): If the user is logged in,
- `POST /appointments` - stores the appointment information
- `GET /appointments` - returns all appointments for their userId. If Healthcare Provider, should get array of appointments from all patients/users
- `GET /appointments/:id` - returns the appointment with the provided id and that has their userId. If Healthcare Provider, should get specified appointment.
- `PUT /appointments/:id`(requires authorization) -  Healthcare Providers can update the appointment with the provided id and that has their userId
- `DELETE /appointments/:id` (requires authorization)  - Healthcare Providers can delete appointment with provided id from specified user
### 5. Jest tests: 
- Authentication, authorization, CRUD operations for Login, Users, Appointments, and Reports

 
## Timeline + Plan <a name="tasks"></a>  
**Week 6**
- [ ]  Create package.json
- [ ]  Create models for users, logs, notes
- [ ]  Create DAO for user
    - [ ]  **createUser(userObj)**
    - [ ]  **getUser(email)**
    - [ ]  **updateUserPassword(userId, password)**
    - [ ]  **updateUserProvider(userId, providerId)**
- [ ]  Create DAO for reports
    - [ ]  **createReport(userId, reportObj)**
    - [ ]  **getReport(userId, reportId)**
    - [ ]  **getUserReports(userId)**
    - [ ]  **getUserReportsBySearch(userId, searchTerms)**
    - [ ]  **getUserReportStats(userId)**
- [ ]  Create routes for Login/Auth
    - [ ]  `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`
    - [ ]  `PUT /auth/password`
- [ ]  Create Middleware for **isAuthenticated**, **IsAuthorized** 
- [ ]  Create route for Users
    - [ ]  `GET /users`, `GET /users/:id`
    - [ ]  `PUT /users/:id/provider` 

**Week 7**
- [ ]  Create route for Logs (requires authentication)
	- [ ]  `POST /reports`
	- [ ]  `GET /reports`, `GET /reports/:id`, `GET /reports/stats`, `GET /reports/search`
	- [ ]  `PUT /reports/:id`
	- [ ]  `DELETE /reports/:id`
- [ ]  Create DAO for appointments:
	- [ ]  **createAppt(userId, apptObj)**
	- [ ]  **getAppt(userId, apptObj)**
	- [ ]  **updateAppt(userId, apptObj)**
	- [ ]  **deleteAppt(userId, apptObj)**
- [ ]  Create route for appointments (requires authentication)
	- [ ]  `POST /appointments`
	- [ ]  `GET /appointments`, `GET /appointments/:id`
	- [ ]  `PUT /appointments/:id`
	- [ ]  `DELETE /appointments/:id`

**Week 8**
- [ ] Create Jest tests for authorization and authentication
- [ ] Create Jest tests for user route
- [ ] Create Jest tests for records route
- [ ] Create Jest tests for appointment route
- [ ] Test routes
- [ ] Revise routes/daos/models 

**Week 9** 
- [ ] Create demo 
- [ ] Complete README
- [ ] Complete self-eval
- [ ] Create frontend forms (TBD/Nice to have)
