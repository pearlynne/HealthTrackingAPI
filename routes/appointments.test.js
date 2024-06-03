const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");
const User = require("../models/user");

describe("Appointments routes", () => {
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

  const randomAppt = {
    userId: "664a9d2f8ec0a9969454487e",
    date: "01-01-2023",
    providerId: "66555c4290399e2553ffadc2",
  };

  beforeEach(async () => {
    await request(server).post("/auth/signup").send(provider0);
    await request(server).post("/auth/signup").send(provider1);
    await request(server).post("/auth/signup").send(user0);
    await request(server).post("/auth/signup").send(user1);
  });

  describe("Before login", () => {
    describe("GET / appointments", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/appointments").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/appointments")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET / appointments/:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/appointments/123").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/appointments/123")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("POST / appointments", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server)
          .post("/appointments/")
          .send(randomAppt);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/appointments/")
          .set("Authorization", "Bearer BAD")
          .send(randomAppt);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("PUT / appointments/:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server)
          .put("/appointments/123")
          .send(randomAppt);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .put("/appointments/123")
          .set("Authorization", "Bearer BAD")
          .send(randomAppt);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("DELETE / appointments/:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server)
          .delete("/appointments/123")
          .send(randomAppt);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .delete("/appointments/123")
          .set("Authorization", "Bearer BAD")
          .send(randomAppt);
        expect(res.statusCode).toEqual(401);
      });
    });
  });


  describe("After login", () => {
    let token0;
    let token1;
    let provider0Token; 
    let provider1Token; 
		let providers
		let users
		
    beforeEach(async () => {
			providers = await User.find(
				{ roles: { $in: ["provider"] } },
				{ name: 1 }
			);
			const res0 = await request(server).post("/auth/login").send(provider0);
      provider0Token = res0.body.token; 

      const res1 = await request(server).post("/auth/login").send(provider1);
      provider1Token = res1.body.token; 

      const res2 = await request(server).post("/auth/login").send(user0);
      token0 = res2.body.token; 

      const res3 = await request(server).post("/auth/login").send(user1);
      token1 = res3.body.token; 

      await User.updateMany(
        { roles: { $nin: ["provider"] } },
        { $push: { providerId: providers[0]._id } }
      );

			users = await User.find(
				{ roles: { $nin: ["provider"] } },
				{ name: 1 }
			);
    });

    describe("POST / appointments", () => {
      it("should send 403 for normal user", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe("Not healthcare provider");
      });
      it("should send 404 if appointment information is missing", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain("Missing appointment information");
        const res1 = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: "",
            date: "01-01-2023",
            providerId: providers[0]._id,
          });
        expect(res1.statusCode).toEqual(404);
        expect(res1.text).toContain("Missing appointment information");
        const res2 = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: users[0]._id,
            date: "",
            providerId: providers[0]._id,
          });
        expect(res2.statusCode).toEqual(404);
        expect(res2.text).toContain("Missing appointment information");
        const res3 = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: users[0]._id,
            date: "01-01-2023",
            providerId: "",
          });
        expect(res3.statusCode).toEqual(404);
        expect(res3.text).toContain("Missing appointment information");
      });
      it("should send 404 if provider does not match providerId in body", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: users[0]._id,
            date: "01-01-2023",
            providerId: providers[1]._id,
          });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain(
          "You cannot create appointments for other providers"
        );
      });
      it("should send 404 if patient is not related to provider", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider1Token)
          .send({
            userId: users[0]._id,
            date: "01-01-2023",
            providerId: providers[1]._id,
          });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain(
          "You can only create appointments for your patients"
        );
      });
      it("should send 200 for provider and return appointment object", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: users[0]._id,
            date: "01-01-2023",
            providerId: providers[0]._id,
          });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          userId: users[0]._id.toString(),
          date: "2023-01-01T08:00:00.000Z", 
					// TO FIX: cannot not hardcode due to quotation marks
          providerId: providers[0]._id.toString(),
        });
      });
    });

    let aptInfo;
    beforeEach(async () => {
      const aptRes = await request(server)
        .post("/appointments")
        .set("Authorization", "Bearer " + provider0Token)
        .send({
          userId: users[0]._id,
          date: "01-01-2023",
          providerId: providers[0]._id,
        });

      aptInfo = aptRes;
			const aptRes1 = await request(server)
        .post("/appointments")
        .set("Authorization", "Bearer " + provider0Token)
        .send({
          userId: users[0]._id,
          date: "02-01-2023",
          providerId: providers[0]._id,
        });
    });

    describe("GET / appointments", () => {
      it("should send 200 for normal user and return appointment object", async () => {
        const res = await request(server)
          .get("/appointments")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        // expect(res.body).toMatchObject([
        //   {
        //     name: providers[0].name,
        //     date: ["2023-01-01T08:00:00.000Z", "2023-02-01T08:00:00.000Z"],
        //   },
        // ]);
				expect(res.text).toContain(`${providers[0].name}`)
				expect(res.text).toContain(`Sun Jan 01 2023`)
      });
      it("should send 404 for normal user if there are no appointments", async () => {
        const res = await request(server)
          .get("/appointments")
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain("You do not have any appointments");
      });
      it("should send 200 for provider and return all appointments by patient name", async () => {
        await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: users[1]._id,
            date: "02-27-2023",
            providerId: providers[0]._id,
          });
        const res = await request(server)
          .get("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        // expect(res.body).toMatchObject([
				// 	{ name: users[0].name},
				// 	{ name: users[1].name},
				// ]);
				expect(res.text).toContain(`${users[0].name}`);
				expect(res.text).toContain(`${users[1].name}`);
      });
    });

    describe("GET / appointments/:id", () => {
      it("should send 400 with a bad appointment _id", async () => {
        const res = await request(server)
          .get("/appointments/123")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe("Invalid Object Id");
      });
      it("should send 404 if appointment does not belong to user", async () => {
        const res = await request(server)
          .get("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain("You do not have this appointment");
      });
      it("should send 200 for user and return appointment information", async () => {
        const res = await request(server)
          .get("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        // expect(res.body).toMatchObject([
        //   {
        //     name: providers[0].name,
        //     date: ["2023-01-01T08:00:00.000Z"],
        //   },
        // ]);
				expect(res.text).toContain(`${providers[0].name}`);
				expect(res.text).toContain(`Sun Jan 01 2023`)
      });
      it("should send 404 if appointment does not belong to provider", async () => {
        const res = await request(server)
          .get("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider1Token)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain("You do not have this appointment");
      });
      it("should send 200 for provider and return patient's appointment information", async () => {
        const res = await request(server)
          .get("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        // expect(res.body).toMatchObject([
        //   {
        //     name: users[0].name,
        //     date: ["2023-01-01T08:00:00.000Z"],
        //   },
        // ]);
				expect(res.text).toContain(`${users[0].name}`)
				expect(res.text).toContain(`Sun Jan 01 2023`)

      });
    });

    describe("PUT / appointments/:id", () => {
      it("should send 403 for normal user", async () => {
        const res = await request(server)
          .put("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe("Not healthcare provider");
      }); 
      it("should send 400 with a bad appointment _id", async () => {
        const res = await request(server)
          .put("/appointments/123")
          .set("Authorization", "Bearer " + provider0Token)
          .send({ date: "10-05-2023" });
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe("Invalid Object Id");
      });
      it("should send 404 without appointment object", async () => {
        const res = await request(server)
          .put("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send({ date: "" });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain("Appointment date needed");
      });
      it("should send 404 if patient is not related to provider", async () => {
        const res = await request(server)
          .put("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider1Token)
          .send({ date: "10-05-2023" });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain("You do not have this appointment");
      });
      it("should send 200 for provider with updated appointment object", async () => {
        const res = await request(server)
          .put("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send({ date: "10-05-2023" });
        expect(res.statusCode).toEqual(200);
        // expect(res.body).toMatchObject([
        //   { date: ["2023-10-05T07:00:00.000Z"], name: users[0].name },
        // ]);
				expect(res.text).toContain(`${users[0].name}`);
				expect(res.text).toContain(`Thu Oct 05 2023`)
      });
    });

    describe("Delete / appointments/:id", () => {
      it("should send 403 for normal user", async () => {
        const res = await request(server)
          .delete("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + token0);
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe("Not healthcare provider");
      });
      it("should send 400 with a bad appointment _id", async () => {
        const res = await request(server)
          .delete("/appointments/123")
          .set("Authorization", "Bearer " + provider0Token);
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe("Invalid Object Id");
      });
      it("should send 404 if patient is not related to provider", async () => {
        const res = await request(server)
          .delete("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider1Token);
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain("You do not have this appointment");
      });
      it("should send 200 for provider with deleted appointment", async () => {
        const res = await request(server)
          .delete("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider0Token);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain("Appointment deleted");
      });
    });
  });
});
