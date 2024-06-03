const request = require("supertest");
const jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");
const User = require("../models/user");
const { provider0, provider1, user0, user1 } = require("../models/demoData");

describe("User routes", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);


	beforeEach(async () => {
		await request(server).post("/auth/signup").send(user0);
		await request(server).post("/auth/signup").send(user1);
		await request(server).post("/auth/signup").send(provider0);
		await request(server).post("/auth/signup").send(provider1);
	});

  describe("Before login", () => {
    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/users").send(user0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/users")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/users/123").send(user0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/users/456")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });

  describe("after login", () => {
    let token0;
    let token1;
    let provider0Token; 
    let provider1Token; 
		let providers
		let users
		
    beforeEach(async () => {
			providers = await User.find(
				{ roles: { $in: ["provider"] } },
				{ name: 1, email: 1 }
			);
			const res0 = await request(server).post("/auth/login").send(provider0);
      provider0Token = res0.body.token;  

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
				{ name: 1, email: 1}
			);
    });

    describe("PUT /:id/provider", () => {
      it("should send 400 to normal user with empty provider id", async () => {
        const res = await request(server)
          .put("/users/" + users[0]._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe("Provider ID needed");
      });
      it("should send 404 with a bad user _id", async () => {
        const res = await request(server)
          .put("/users/123/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: providers[0]._id });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe("You are not allowed to access others' provider");
      });
      it("should send 404 to normal user with someone else's id", async () => {
        const res = await request(server)
          .put("/users/" + providers[0]._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: providers[0]._id });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe("You are not allowed to access others' provider");
      });
      it("should send 200 to normal user their own id and return updated information", async () => {
        const res = await request(server)
          .put("/users/" + users[0]._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: providers[0]._id });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          _id: users[0]._id.toString(),
          name: users[0].name,
          email: users[0].email,
          providerId: providers[0]._id.toString(),
        });
      });
      it("should send 400 to normal user if providerId does not exist ", async () => {
        const res = await request(server)
          .put("/users/" + users[0]._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: "6657aeb53975f21e8339343" });
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe("Invalid Object Id");
      });
    });

    beforeEach(async () => {
      const res4 = await request(server)
        .put("/users/" + users[0]._id + "/provider")
        .set("Authorization", "Bearer " + token0)
        .send({ providerId: providers[0]._id });
      const res5 = await request(server)
        .put("/users/" + users[1]._id + "/provider")
        .set("Authorization", "Bearer " + token1)
        .send({ providerId: providers[0]._id });
    });

    describe("GET /users", () => {
      it("should send 403 to normal user", async () => {
        const res = await request(server)
          .get("/users/")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe("Not healthcare provider");
      });
      it("should send 200 to provider and return all patients information", async () => {
        const res = await request(server)
          .get("/users/")
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          { name: users[0].name, email: users[0].email },
          { name: users[1].name, email: users[1].email },
        ]);
      });
    });

    describe("GET / /:id user %#", () => {
      it("should send 400 to normal user if id belongs to someone else", async () => {
        const res = await request(server)
          .get("/users/" + users[1]._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe("Not your Id");
      });
      it("should send 200 to normal user and return own information", async () => {
        const res = await request(server)
          .get("/users/" + users[0]._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          name: users[0].name,
          email: users[0].email,
          providerId: providers[0]._id.toString(), 
        });
      });
      it("should send 200 to provider and return own information ", async () => {
        const res = await request(server)
          .get("/users/" + providers[0]._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          name: providers[0].name,
          email: providers[0].email,
        });
      });
      it("should send 200 to provider and return patient's information ", async () => {
        const res = await request(server)
          .get("/users/" + users[0]._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            name: users[0].name,
            email: users[0].email,
          },
        ]);
      });
      it("should send 404 to provider if not their patient", async () => {
				const res1 = await request(server).post("/auth/login").send(provider1);
      provider1Token = res1.body.token; 
        const res = await request(server)
          .get("/users/" + users[0]._id)
          .set("Authorization", "Bearer " + provider1Token)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe(
          "You cannot access users that are not your patients"
        );
      });
    });
  });
});
