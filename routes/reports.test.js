const request = require("supertest");
const jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");
const Report = require("../models/report");

describe("Reports routes", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

//Before login

//After login


  // describe("POST / reports %#"...
	// should return 404 if body is empty
	// should return 404 if logged in user is does not match body.userId (i.e., posting for others)
	// should return 200 for normal user

  // describe("GET / reports %#"...
	// should return 200 for normal user and report objects
	// should return 200 for providers and report objects

  // describe("GET / reports/stats"...
	// --- if query includes a user Id,
	// should return 403 for normal user
	// should return 403 for providers if query id is non-patient
	// should return 200 for providers and return patient stats
	// --- if query does not include user Id,
	// should return 200 for normal user and report stats
	// should return 200 for providers and report all stats

  // describe("GET / reports/search" ...
	// should return 404 if query is empty
	// should return 200 for normal user and search result of user
	// should return 200 for provider and search result of all patient user
	// should return 404 if search result is empty
	
  // describe("GET / reports/:id %#"...
	// should return 404 if id is not object?
	// should return 403 if normal user does not have report Id
	// should return 200 for normal user and report
	// should return 200 for provider user and report if it is their patient
	// should return 403 for provider user and if report is not from their patient


  // describe("PUT / reports/:id %#"...
	// should return 404 if id is not object?
	// should return 404 if no body
	// should return 403 if normal user does not have report Id
	// should return 200 for normal user and return updated report if report Id is theirs
	//--  No access for providers
	// should return 403 if provider user does not have report Id


	// describe("DELETE / reports/:id %#"...
  // should return 404 if id is not object?
	// should return 403 if normal user does not have report Id
	// should return 200 for normal user and return status
	//--  No access for providers
	// should return 403 if provider user does not have report Id

	
});
