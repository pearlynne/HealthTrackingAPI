const request = require("supertest");
const jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");
const Report = require("../models/report");

describe("Reports routes", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const provider0 = {
    name: "Dr. Jennifer A Jones",
    email: "jenjones@mail.com",
    password: "098poiuyt",
    roles: ["user", "provider"],
  };

  const provider1 = {
    name: "Dr. Jeremy B Johnson",
    email: "jeremyj@mail.com",
    password: "456zxcvb",
    roles: ["user", "provider"],
  };

  const user0 = {
    name: "Jane C Smith",
    email: "janesmith@mail.com",
    password: "123qwerty",
    roles: ["user"],
  };

  const user1 = {
    name: "Joe D Jackson",
    email: "joejackson@mail.com",
    password: "789mnbvc",
    roles: ["user"],
  };

  // Before login
  // TOFIX: Add objects
  // describe("Before login", () => {
  //   describe("GET / reports", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).get("/reports").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .get("/reports")
  //         .set("Authorization", "Bearer BAD")
  //         .send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  //   describe("GET / reports/:id", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).get("/reports/123").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .get("/reports/123")
  //         .set("Authorization", "Bearer BAD")
  //         .send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  //   describe("GET / reports/search", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).get("/reports/search").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .get("/reports/search")
  //         .set("Authorization", "Bearer BAD")
  //         .send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  //   describe("GET / reports/stats", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).get("/reports/stats").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .get("/reports/stats")
  //         .set("Authorization", "Bearer BAD")
  //         .send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });

  //   describe("PUT / reports/:id", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).put("/reports/123").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .put("/reports/123")
  //         .set("Authorization", "Bearer BAD")
  //         .send(); // TO FIX: Add report
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  //   describe("DELETE / reports/:id", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).delete("/reports/123").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .delete("/reports/123")
  //         .set("Authorization", "Bearer BAD")
  //         .send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  // });

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
