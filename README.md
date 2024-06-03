# <p align="center"> 330 Final Project <br> Mental Health Behavioral Tracking </p>

## Table of contents
1. [Self-evalation](#selfeval)
2. [Description of Scenario and Problem](#description)
3. [General Design](#generaldesign)
4. [Technical Components](#builtwith) 
5. [Clear and direct call-outs](#callouts)
6. [Archive](#archive)
	1. [Timeline and Plan](#tasks)
	2. [Updates](#updates)

## Self-evaluation <a name="selfeval"></a>
**Achievements:**
- **Implemented Routes**: I was able to design and set up RESTful API routes for user and provider authentication, daily tracking, and appointment management.
- **Middleware**: I understood how to implement middleware appropriately, including error handling, authentication, and authorization middlewares, I also identified, but have yet to implement, potential middleware functions (e.g., varying response for providers and users - 
`isProvider ? res.locals.userType = 'provider':  res.locals.userType = 'user';`
).
- **Testing Coverage**: Creating unit tests took quite some time but I was able to achieve high test coverage with Jest, making sure the API works well in different scenarios.

**Challenges and Solutions:**
- **Handling Edge Cases and Jest Tests**: I had trouble with edge cases, espeically since I had created the routes prior to the tests. I ended up spending a lot of time writing comprehensive Jest tests before returning to my API routes to address them.
- **Managing Different Response Bodies**: Handling different response bodies and figuring out the appropriate response codes (e.g., `403`, `409`, or `404`, for when a user was tryin to access another user's record) was tricky. I decided to create standardized response formats and error-handling middleware.
- **MongoDB vs. Mongoose Return Types**: I wasn’t familiar with the differences between MongoDB and Mongoose return types, such as arrays versus objects (e.g., `[{ mood: 2 }]` vs `{ mood: 2 }` vs `[ mood: 2 ]`). I also had issues with chaining methods (e.g., `pretty()`, `lean()`). I chose to refactor the code for consistency.

**Lessons Learned:**
- **Test-Driven Development**: I realized the importance of creating Jest tests first to guide the development process and catch issues early. This allows for more reliable and maintainable code, without requiring constant revisions. 
- **Understanding MongoDB's Nature**: I had a bit of a learning curve coming from a background more familiar with SQL. Since MongoDB is not a relational database, I had to learn data modeling and querying differently. There were several data inconsistencies due to my initial schema set up. I also found it challenging to perform complex queries involving multiple collections, aggregations, or join (e..g, `$unionwith` and `$facets`). 
- **Code Refactoring and Modularizing**: I noticed some parts of the code, especially in Jest tests, were becoming overly complex or lengthy. I learned that most could be refactored or modularized for better readability and maintainability (e.g., test data for jest tests).

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

### Requirements
- #### Linux / Mac OS / Windows
	- [MongobDB](#https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/) 
	- [Node.js](https://nodejs.org/en/download/package-manager/)
- #### Dependencies
	- Express
	- Mongoose
	- Jest for unit tests
	- bcrypt for password hashing
	- jsonwebtoken for password tokens
### Installation Instructions
- `npm install express mongoose jsonwebtoken bcrypt`
- #### For testing
	- `npm install --save-dev jest @shelf/jest-mongodb supertest`


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
- *Tested* `POST /auth/signup` - Store user with their name, username, email, and encrypted password. 
	- Return 400 error if email has been used.
- *Tested* `POST /auth/login` -  Find the user with the provided email/username. Use bcrypt to compare stored password with the incoming password. If they match, generate a JWT token. 
	- Return 400 error if token does not match.
- *Tested* `PUT /auth/password` - If the user is logged in, store the incoming password using their userId. 
	- Return 400 error if request fails
- *Tested* `POST /auth/logout` 
	
**Users**
- *Tested* `GET /users` (requires authorization) - returns array of all users (if Healthcare Providers) 
- *Tested but should verify edge cases*`GET /users/:id` (requires authentication) - returns user information with provided id 
- *Tested* `PUT /users/:id/provider` (requires authentication) - update user’s provider ID. 

**Reports** (requires authentication): If the user is logged in,
- `POST /reports` - store report along with their userId.
- `GET /reports` - returns all reports for their userId. If Healthcare Provider, should get array of logs from all patients/users
- `GET /reports/stats` - returns an aggregated stats of mood rating and symptom tracking. If Healthcare Provider, should get array of reports of aggregated stats from all patients/users. If userId is in search params, healthcare providers should get an array 
- `GET /reports/search` - returns reports with that search term. If Healthcare Provider, should get array of reports with that search term from all patients/users
- `GET /reports/:id` - returns the report with the provided id and that has their userId. If Healthcare Provider, should get specified report.
- `PUT /reports/:id` - updates the report with the provided id and that has their userId
- `DELETE /reports/:id` - deletes report with provided id from specified user.

**Appointments** (requires authentication): If the user is logged in,
- *Testing* `POST /appointments`(requires authorization) -  Healthcare Providers can create and store the appointment information 
- `GET /appointments` - returns all appointments for their userId. If Healthcare Provider, should get array of appointments from all patients/users
- `GET /appointments/:id` - returns the appointment with the provided id and that has their userId. If Healthcare Provider, should get specified appointment.
- `PUT /appointments/:id`(requires authorization) -  Healthcare Providers can update the appointment with the provided id and that has their userId
- `DELETE /appointments/:id` (requires authorization)  - Healthcare Providers can delete appointment with provided id from specified user
### 5. Jest tests: 
- Authentication, authorization, CRUD operations for Login, Users, Appointments, and Reports


<details>
<summary><h2><a href="archive">Archive</a></h2></summary> 

## Timeline + Plan <a name="tasks"></a>

### Completed  
<details>
<summary><b>Week 6</b></summary>

- [x]  Create package.json
- [x]  Create models for users, logs, notes
- [x]  Create DAO for user
    - [x]  **createUser(userObj)**
    - [x]  **getUser(email)**
    - [x]  **updateUserPassword(userId, password)**
    - [x]  **updateUserProvider(userId, providerId)**
- [x]  Create DAO for reports
    - [x]  **createReport(userId, reportObj)**
    - [x]  **getReport(userId, reportId)**
    - [x]  **getUserReports(userId)**
    - [x]  **getUserReportsBySearch(userId, searchTerms)**
    - [x]  **getUserReportStats(userId)**
		- [x]  **updateReportById(userId, apptObj)**
		- [x]  **deleteReportById(userId, apptObj)**
- [x]  Create routes for Login/Auth
    - [x]  `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`
    - [x]  `PUT /auth/password`
- [x]  Create Middleware for **isAuthenticated**, **IsAuthorized** 
- [x]  Create route for Users
    - [x]  `GET /users`, `GET /users/:id`
    - [x]  `PUT /users/:id/provider` 
</details>

<details>
<summary><b>Week 7</b></summary>

- [x]  Create route for Logs (requires authentication)
	- [x]  `POST /reports`
	- [x]  `GET /reports`, `GET /reports/:id`, `GET /reports/stats`, `GET /reports/search`
	- [x]  `PUT /reports/:id`
	- [x]  `DELETE /reports/:id`
- [x]  Create DAO for appointments:
	- [x]  **createAppt(userId, apptObj)**
	- [x]  **getAppt(userId, apptObj)**
	- [x]  **updateAppt(userId, apptObj)**
	- [x]  **deleteAppt(userId, apptObj)**
- [x]  Create route for appointments (requires authentication)
	- [x]  `POST /appointments`
	- [x]  `GET /appointments`, `GET /appointments/:id`
	- [x]  `PUT /appointments/:id`
	- [x]  `DELETE /appointments/:id`
</details>


<details>
<summary><b>Week 8</b></summary>
- [x] (New addition) Review Jest tests setup
- [x] (New addition) Review Jest tests utils
- [x] Create Jest tests for authorization and authentication
- [x] Create Jest tests for user route
- [x] Create Jest tests for records route
- [x] Create Jest tests for appointment route
- [x] Test routes
- [x] Revise routes/daos/models 
- [x] (New addition) Error handling for id
- [x] (New addition) Review with Date issues, isProvider, edge cases 
</details>

<details>
<summary><b>Week 9</b></summary>
- [ ] (New addition) Create middleware for patient is not providers'
- [x] Create demo 
- [x] Complete README
- [x] Complete self-eval
- [x] Create frontend forms (TBD/Nice to have)
</details>

## Updates <a name="updates"></a>
### Working on [see [timeline](#tasks) for breakdown]: 
- Create Demo
- Practice Demo
- Self-eval in README 
- Create middleware for patient is not providers'

### Completed: 
- Express server 
- Mongo connection
- Model schemas for user, appointment, and reports
- DAO methods for user, appointment, and reports
- CRUD routes for auth, user, appointments, and reports
- Middleware for authorization and authentication
- Revision of routes
- Creating demo collection for presentation and testing routes on Postman (40% complete; left with appointments and report routes)
- Create Jest tests for all routes 
- Review test utils for Jest test
- Simplify jest tests
- Add match object to jest tests
- Create frontend forms (TBD/Nice to have)

</details>