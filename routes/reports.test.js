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
    name: "Jennifer A Jones",
    email: "jenjones@mail.com",
    password: "098poiuyt",
    // roles: ["user", "provider"],
		roles: "provider"
  };

  const provider1 = {
    name: "Jeremy B Johnson",
    email: "jeremyj@mail.com",
    password: "456zxcvb",
    // roles: ["user", "provider"],
		roles: "provider"
  };

  const user0 = {
    name: "Jane C Smith",
    email: "janesmith@mail.com",
    password: "123qwerty",
    // roles: ["user"],
  };

  const user1 = {
    name: "Joe D Jackson",
    email: "joejackson@mail.com",
    password: "789mnbvc",
    // roles: ["user"],
  };
  const user2 = {
    name: "Josh E Jacobs",
    email: "joshjacobs@mail.com",
    password: "789mnbvc",
    // roles: ["user"],
  };
  const user3 = {
    name: "Jessica F James",
    email: "jessiej@mail.com",
    password: "123qwerty",
    // roles: ["user"],
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

  beforeEach(async () => {
    await request(server).post("/auth/signup").send(provider0);
    await request(server).post("/auth/signup").send(provider1);
    await request(server).post("/auth/signup").send(user0);
    await request(server).post("/auth/signup").send(user1);
    await request(server).post("/auth/signup").send(user2);
    await request(server).post("/auth/signup").send(user3);
  });

  describe("Before login", () => {
    describe("GET / reports/all", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/reports/all").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/reports/all")
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
          .send();
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
  let token1;
  let provider0Token;
  let provider1Token;
  let providers;
  let users;

  beforeEach(async () => {
    providers = await User.find(
      { roles: { $in: ["provider"] } },
      { name: 1, email: 1 }
    );

    const resP1 = await request(server).post("/auth/login").send(provider0);
    provider0Token = resP1.body.token;

    const resP2 = await request(server).post("/auth/login").send(provider1);
    provider1Token = resP2.body.token;

    const res0 = await request(server).post("/auth/login").send(user0);
    token0 = res0.body.token;

    const res1 = await request(server).post("/auth/login").send(user1);
    token1 = res1.body.token;

    const res2 = await request(server).post("/auth/login").send(user2);
    token2 = res2.body.token;

    const res3 = await request(server).post("/auth/login").send(user3);
    token3 = res3.body.token;

    await User.updateMany(
      { name: { $in: [user0.name, user1.name] } },
      { $set: { providerId: providers[0]._id } }
    );
    await User.updateMany(
      { name: { $in: [user2.name, user3.name] } },
      { $set: { providerId: providers[1]._id } }
    );

    users = await User.find(
      { roles: { $nin: ["provider"] } },
      { name: 1, email: 1 }
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
    it("should send 200 for normal user and return report", async () => {
      const res = await request(server)
        .post("/reports")
        .set("Authorization", "Bearer " + token0)
        .send({
          ...user0report1,
          userId: users[0]._id.toString(),
          providerId: providers[0]._id.toString(),
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject({
        ...user0report1,
        date: "2022-12-10T08:00:00.000Z",
        userId: users[0]._id.toString(),
        email: users[0].email,
        name: users[0].name,
        providerId: providers[0]._id.toString(),
      });
    });
  });

  let updatedUser;
  beforeEach(async () => {
    updatedUser = users.map(({ _id: userId, name, email }) => ({
      userId,
      name,
      email,
    }));
    await Report.insertMany([
      {
        ...user0report1,
        ...updatedUser[0],
        providerId: providers[0]._id,
      },
      {
        ...user0report2,
        ...updatedUser[0],
        providerId: providers[0]._id,
      },
      {
        ...user0report3,
        ...updatedUser[0],
        providerId: providers[0]._id,
      },
      {
        ...user1report1,
        ...updatedUser[1],
        providerId: providers[0]._id,
      },
    ]);
  });
  afterEach(testUtils.clearDB);

  describe("GET / reports/all", () => {
    it("should send 404 for normal user with message if no reports", async () => {
      const res = await request(server)
        .get("/reports/all")
        .set("Authorization", "Bearer " + token3)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain("There are no reports");
    });
    it("should send 200 for normal user and return reports", async () => {
      const res = await request(server)
        .get("/reports/all")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(3);
      expect(res.body[0]).toHaveProperty("medRxn", user0report1.medRxn);
    });
    it("should send 200 for provider and return reports from all patients", async () => {
      const res = await request(server)
        .get("/reports/all")
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(4);
      expect(res.body[0]).toHaveProperty("medRxn", user0report1.medRxn);
      expect(res.body[3]).toHaveProperty("medRxn", user1report1.medRxn);
    });
  });

  let aptRes;
  beforeEach(async () => {
    const res = await Report.findOne({ email: users[0].email });
    aptRes = res;
  });

  describe("GET / reports/:id ", () => {
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
      expect(res.text).toContain("There is no such report. You may not have access");
    });
    it("should send 200 for normal user and report", async () => {
      const res = await request(server)
        .get("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject({
        name: users[0].name,
        email: users[0].email,
      });
    });
    it("should send 200 for provider user and report", async () => {
      const res = await request(server)
        .get("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject({
        name: users[0].name,
        email: users[0].email,
      });
    });
    it("should send 404 for provider user if report is not from their patient", async () => {
      const res = await request(server)
        .get("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + provider1Token)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain("There is no such report. You may not have access");
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
        _id: users[0]._id.toString(),
        name: users[0].name,
        email: users[0].email,
        averageMood: 2.3333333333333335,
        Inattentiveness: 1,
        Hyperactivity: 2,
        Impulsitivity: 1.6666666666666667,
      });
    });
    it("should send 404 for normal user without stats", async () => {
      const res = await request(server)
        .get("/reports/stats")
        .set("Authorization", "Bearer " + token2)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toBe("No stats/reports");
    });
    it("should send 200 for providers and return report stats sorted by name", async () => {
      const res = await request(server)
        .get("/reports/stats")
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        _id: users[0]._id.toString(),
        name: users[0].name,
        email: users[0].email,
        averageMood: 2.3333333333333335,
        Inattentiveness: 1,
        Hyperactivity: 2,
        Impulsitivity: 1.6666666666666667,
      });
      expect(res.body[1]).toMatchObject({
        _id: users[1]._id.toString(),
        name: users[1].name,
        email: users[1].email,
        averageMood: 5,
        Inattentiveness: 1,
        Hyperactivity: 2,
        Impulsitivity: 1,
      });
    });
    it("should send 403 for normal user if query is made", async () => {
      const res = await request(server)
        .get("/reports/stats?patientId=" + encodeURI(users[0]._id))
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(403);
      expect(res.text).toBe("Forbidden");
    });
    it("should send 404 for providers if query id is non-patient", async () => {
      const res = await request(server)
        .get("/reports/stats?patientId=" + encodeURI(users[0]._id))
        .set("Authorization", "Bearer " + provider1Token)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain("No stats available");
    });
    it("should send 200 for providers and return patient's stats", async () => {
      const res = await request(server)
        .get("/reports/stats?patientId=" + encodeURI(users[0]._id))
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toMatchObject({
        Patient: { name: users[0].name, email: users[0].email },
				averageMood: 2.3333333333333335,
        Inattentiveness: 1,
        Hyperactivity: 2,
        Impulsitivity: 1.6666666666666667,
      });
    });
  });

  describe("GET / reports/search", () => {
    beforeEach(async () => {
      await Report.insertMany([
        {
          ...user2report1,
          ...updatedUser[2],
          providerId: providers[1]._id,
        },
        {
          ...user3report1,
          ...updatedUser[3],
          providerId: providers[1]._id,
        },
      ]);
    });

    it("should send 404 if report information is missing", async () => {
      const res = await request(server)
        .get("/reports/search?query=")
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain("Enter search terms");
    });
    it("should send 200 for normal user and search result of user", async () => {
      const res = await request(server)
        .get("/reports/search?query=" + encodeURI("tired"))
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveLength(2); 
			expect(res.body[0]).toHaveProperty("journalEntry", 'tired');
			expect(res.body[1]).toHaveProperty("journalEntry", 'tired');
    });
    it("should send 200 for normal user and search result of user", async () => {
			const res = await request(server)
        .get("/reports/search?query=" + encodeURI("heart palpitations"))
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveLength(3); 
			expect(res.body[0]).toHaveProperty("name", users[0].name);
			expect(res.body[2]).toHaveProperty("name", users[1].name);
    });
    it("should send 404 if search result is empty", async () => {
      const res = await request(server)
        .get("/reports/search?query=" + encodeURI("angry"))
        .set("Authorization", "Bearer " + provider0Token)
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain("No reports with such terms");
    });
  });

  describe("PUT / reports/:id ", () => {
    it("should send 400 with a bad appointment _id", async () => {
      const res = await request(server)
        .put("/reports/123")
        .set("Authorization", "Bearer " + token0)
        .send({ mood: 2 });
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
        .send({ mood: 2 });
      expect(res.statusCode).toEqual(404);
      expect(res.text).toContain("There is no such report. You may not have access");
    });
    it("should send 200 for normal user and return updated report", async () => {
      const res = await request(server)
        .put("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token0)
        .send({ mood: 2, medRxn: "tremors" });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject({ 
				name: users[0].name,
				email: users[0].email,
				mood: 2,
				inattentiveness: 1,
				hyperactivity: 2,
				impulsitivity: 3,
				journalEntry: 'tired',
				medRxn: 'tremors'
			});
    });
  });

  describe("DELETE / reports/:id ", () => {
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
      expect(res.text).toContain("There is no such report. You may not have access");
    });
    it("should send 200 for normal user and return status", async () => {
      const res = await request(server)
        .delete("/reports/" + aptRes._id)
        .set("Authorization", "Bearer " + token0)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain("Appointment deleted");
    });
  });
});
