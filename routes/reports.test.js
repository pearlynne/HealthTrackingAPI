const request = require("supertest");
const jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");
const Report = require("../models/report");
const User = require("../models/user");

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
  const user2 = {
    name: "Josh E Jacobs",
    email: "joshjacobs@mail.com",
    password: "789mnbvc",
    roles: ["user"],
  };
  const user3 = {
    name: "Jessica F James",
    email: "jessiej@mail.com",
    password: "123qwerty",
    roles: ["user"],
  };

  const user0report1 = {
    date: "12-10-2022",
    mood: 1,
    inattentiveness: 1,
    hyperactivity: 2,
    impulsitivity: 3,
    journalEntry: "tired",
    medRxn: "heart palpitations",
  };
  const user0report2 = {
    date: "12-11-2022",
    mood: 1,
    inattentiveness: 1,
    hyperactivity: 2,
    impulsitivity: 1,
    journalEntry: "tired",
    medRxn: "none",
  };
  const user0report3 = {
    date: "12-12-2022",
    mood: 5,
    inattentiveness: 1,
    hyperactivity: 2,
    impulsitivity: 1,
    journalEntry: "excited",
    medRxn: "heart palpitations",
  };

  const user1report1 = {
    date: "12-15-2022",
    mood: 5,
    inattentiveness: 1,
    hyperactivity: 2,
    impulsitivity: 1,
    journalEntry: "excited",
    medRxn: "heart palpitations",
  };

  const user2report1 = {
    date: "12-15-2022",
    mood: 3,
    inattentiveness: 1,
    hyperactivity: 2,
    impulsitivity: 1,
    journalEntry: "sad",
    medRxn: "tired",
  };

  const user3report1 = {
    date: "12-15-2022",
    mood: 2,
    inattentiveness: 1,
    hyperactivity: 2,
    impulsitivity: 1,
    journalEntry: "sad",
    medRxn: "none",
  };

  // TO FIX: SHould sign up first
  // Before login
  // TOFIX: Add objects
  describe("Before login", () => {
    describe("GET / reports", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/reports").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/reports")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET / reports/:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/reports/123").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/reports/123")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET / reports/search", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/reports/search").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/reports/search")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET / reports/stats", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/reports/stats").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/reports/stats")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("PUT / reports/:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).put("/reports/123").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .put("/reports/123")
          .set("Authorization", "Bearer BAD")
          .send(); // TO FIX: Add report
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("DELETE / reports/:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).delete("/reports/123").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .delete("/reports/123")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });

  //After login
  let token0;
  let decodedToken0;
  let token1;
  let decodedToken1;
  let provider0Token;
  let decodedProvider0Token;
  let provider1Token;
  let decodedProvider1Token;

  beforeEach(async () => {
    await request(server).post("/auth/signup").send(provider0);
    const resP1 = await request(server).post("/auth/login").send(provider0);
    provider0Token = resP1.body.token;
    decodedProvider0Token = jwt.decode(provider0Token);

    await request(server).post("/auth/signup").send(provider1);
    const resP2 = await request(server).post("/auth/login").send(provider1);
    provider1Token = resP2.body.token;
    decodedProvider1Token = jwt.decode(provider1Token);

    await request(server).post("/auth/signup").send(user0);
    const res0 = await request(server).post("/auth/login").send(user0);
    token0 = res0.body.token;
    decodedToken0 = jwt.decode(token0);
    await User.updateOne(
      { email: user0.email },
      { $push: { providerId: decodedProvider0Token._id } }
    );

    await request(server).post("/auth/signup").send(user1);
    const res1 = await request(server).post("/auth/login").send(user1);
    token1 = res1.body.token;
    decodedToken1 = jwt.decode(token1);
    await User.updateOne(
      { email: user1.email },
      { $push: { providerId: decodedProvider0Token._id } }
    );

    await request(server).post("/auth/signup").send(user2);
    const res2 = await request(server).post("/auth/login").send(user2);
    token2 = res2.body.token;
    decodedToken2 = jwt.decode(token2);
    await User.updateOne(
      { email: user2.email },
      { $push: { providerId: decodedProvider1Token._id } }
    );

    await request(server).post("/auth/signup").send(user3);
    const res3 = await request(server).post("/auth/login").send(user3);
    token3 = res3.body.token;
    decodedToken3 = jwt.decode(token3);
    await User.updateOne(
      { email: user3.email },
      { $push: { providerId: decodedProvider1Token._id } }
    );
  });

  describe("POST / reports", () => {
    it("should send 404 if report information is missing", async () => {
      const res = await request(server)
        .post("/reports")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("Missing report information");
    });
    it("should send 404 if user creating report for another user", async () => {
      const res = await request(server)
        .post("/reports")
        .set("Authorization", "Bearer " + token1)
        .send({
          ...user0report1,
          userId: decodedToken0._id,
          email: decodedToken0.email,
          name: decodedToken0.name,
          providerId: decodedProvider0Token._id,
        });
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("No access");
    });
    it("should send 200 for normal user and return report", async () => {
      const res = await request(server)
        .post("/reports")
        .set("Authorization", "Bearer " + token0)
        .send({
          ...user0report1,
          userId: decodedToken0._id,
          providerId: decodedProvider0Token._id,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject({
        ...user0report1,
        date: "2022-12-10T08:00:00.000Z",
        userId: decodedToken0._id,
        email: decodedToken0.email,
        name: decodedToken0.name,
        providerId: decodedProvider0Token._id,
      });
    });
  });

  beforeEach(async () => {
    await Report.insertMany([
      {
        ...user0report1,
        userId: decodedToken0._id,
        email: decodedToken0.email,
        name: decodedToken0.name,
        providerId: decodedProvider0Token._id,
      },
      {
        ...user0report2,
        userId: decodedToken0._id,
        email: decodedToken0.email,
        name: decodedToken0.name,
        providerId: decodedProvider0Token._id,
      },
      {
        ...user0report3,
        userId: decodedToken0._id,
        email: decodedToken0.email,
        name: decodedToken0.name,
        providerId: decodedProvider0Token._id,
      },
      {
        ...user1report1,
        userId: decodedToken1._id,
        email: decodedToken1.email,
        name: decodedToken1.name,
        providerId: decodedProvider0Token._id,
      },
    ]);
  });
	afterEach(testUtils.clearDB);

  describe("GET / reports", () => {
    it("should send 404 for normal user with message if no reports", async () => {
      const res = await request(server)
        .get("/reports")
        .set("Authorization", "Bearer " + token3)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("There are no reports");
    });
    it("should send 200 for normal user and return reports", async () => {
      const res = await request(server)
        .get("/reports")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      // TO FIX: add match object
    });
    it("should send 200 for provider and return reports from all patients", async () => {
      const res = await request(server)
        .get("/reports")
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        name: decodedToken0.name,
        email: decodedToken0.email,
      });
      expect(res.body[3]).toMatchObject({
        name: decodedToken1.name,
        email: decodedToken1.email,
      });
    });
  });

 
	let aptRes;
  beforeEach(async () => {
		const res = await Report.findOne({ email: decodedToken0.email });
    aptRes = res;
  });
	
	afterEach(testUtils.clearDB);

  describe("GET / reports/:id %#", () => {
    it("should send 400 with a bad appointment _id", async () => {
      const res = await request(server)
        .get("/reports/123")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("Invalid Object Id");
    });
    it("should send 404 with user does not have that report", async () => {
      const res = await request(server)
        .get("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token1)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("There is no such report. You may not have access");
    });
    it("should send 200 for normal user and report", async () => {
      const res = await request(server)
        .get("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        name: decodedToken0.name,
        email: decodedToken0.email,
      });
    });
    it("should send 200 for provider user and report", async () => {
      const res = await request(server)
        .get("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        name: decodedToken0.name,
        email: decodedToken0.email,
      });
    });
    it("should send 404 for provider user if report is not from their patient", async () => {
      const res = await request(server)
        .get("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + provider1Token)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("There is no such report. You may not have access");
    });
  });

  describe("GET / reports/stats", () => {
    it("should send 200 for normal user and return report stats", async () => {
      const res = await request(server)
        .get("/reports/stats")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        name: decodedToken0.name,
        email: decodedToken0.email,
      });
      // TO FIX: add match object
    });
    it("should send 404 for normal user without stats", async () => {
      const res = await request(server)
        .get("/reports/stats")
        .set("Authorization", "Bearer " + token2)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("No stats/reports");
      // TO FIX: add match object
    });
    it("should send 200 for providers and return report stats sorted by name", async () => {
      const res = await request(server)
        .get("/reports/stats")
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        name: decodedToken0.name,
        email: decodedToken0.email,
      });
      expect(res.body[1]).toMatchObject({
        name: decodedToken1.name,
        email: decodedToken1.email,
      });
    });
    it("should send 403 for normal user if query is made", async () => {
      const res = await request(server)
        .get("/reports/stats?patientId=" + encodeURI(decodedToken0._id))
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(403);
      expect(res.text).toBe("forbidden");
      // TO FIX: add match object
    });
    it("should send 404 for providers if query id is non-patient", async () => {
      const res = await request(server)
        .get("/reports/stats?patientId=" + encodeURI(decodedToken0._id))
        .set("Authorization", "Bearer " + provider1Token)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("No stats available");
      // TO FIX: add match object
    });
    it("should send 200 for providers and return patient's stats", async () => {
      const res = await request(server)
        .get("/reports/stats?patientId=" + encodeURI(decodedToken0._id))
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        Patient: { name: decodedToken0.name, email: decodedToken0.email },
      });
    });
  });

  describe("GET / reports/search", () => {
		beforeEach(async () => {
			await Report.insertMany([
				{
					...user2report1,
					userId: decodedToken2._id,
					providerId: decodedProvider1Token._id,
				},
				{
					...user3report1,
					userId: decodedToken3._id,
					providerId: decodedProvider1Token._id,
				},
			]); 
		}); 
	
		it("should send 404 if report information is missing", async () => {
      const res = await request(server)
        .get("/reports/search?query=")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("Insert search terms");
    });
    it("should send 200 for normal user and search result of user", async () => {
      const res = await request(server)
        .get("/reports/search?query=" + encodeURI("tired"))
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      // TO ADD: OBJECT search terms
    });
    // should return 200 for provider and search result of all patient user
    it("should send 200 for normal user and search result of user", async () => {
      const res = await request(server)
        .get("/reports/search?query=" + encodeURI("heart palpitations"))
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      // TO ADD: OBJECT search terms
    });
    // should return 404 if search result is empty
    it("should send 404 if search result is empty", async () => {
      const res = await request(server)
        .get("/reports/search?query=" + encodeURI("angry"))
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("No reports with such terms");
      // TO ADD: OBJECT search terms
    });
  });

  describe("PUT / reports/:id %#", () => {
    it("should send 400 with a bad appointment _id", async () => {
      const res = await request(server)
        .put("/reports/123")
        .set("Authorization", "Bearer " + token0)
        .send([{ mood: 2 }]);
      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("Invalid Object Id");
    });
    it("should send 404 if report information is missing", async () => {
      const res = await request(server)
        .put("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("Missing report information");
    });
    it("should send 404 for normal/provider user does not have report Id", async () => {
      const res = await request(server)
        .put("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token1)
        .send([{ mood: 2 }]);
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("There is no such report. You may not have access");
    });
    it("should send 200 for normal user and return updated report", async () => {
      const res = await request(server)
        .put("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token0)
        .send([{ mood: 2, medRxn: "tremors" }]);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject({ mood: 2, medRxn: "tremors" });
    });
  });

  describe("DELETE / reports/:id %#", () => {
    it("should send 400 with a bad appointment _id", async () => {
      const res = await request(server)
        .delete("/reports/123")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(400);
      expect(res.text).toBe("Invalid Object Id");
    });
    it("should send 404 for normal/provider user does not have that report", async () => {
      const res = await request(server)
        .delete("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token1)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("There is no such report. You may not have access");
    });
    it("should send 200 for normal user and return status", async () => {
      const res = await request(server)
        .delete("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.text).toBe("Appointment deleted");
    });
  });
});
