const request = require("supertest");
const jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");
const User = require("../models/user");

describe("User routes", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const provider0 = {
    name: "Jennifer A Jones",
    email: "jenjones@mail.com",
    password: "098poiuyt",
    roles: ["user", "provider"],
  };

  const provider1 = {
    name: "Jeremy B Johnson",
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
    let decodedToken0;
    let token1;
    let decodedToken1;
    let provider0Token;
    let decodedProvider0Token;
    let provider1Token;
    // let decodedProvider1Token;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      decodedToken0 = jwt.decode(token0);

      await request(server).post("/auth/signup").send(user1);
      const res1 = await request(server).post("/auth/login").send(user1);
      token1 = res1.body.token;
      decodedToken1 = jwt.decode(token1);

      await request(server).post("/auth/signup").send(provider0);
      const res2 = await request(server).post("/auth/login").send(provider0);
      provider0Token = res2.body.token;
      decodedProvider0Token = jwt.decode(provider0Token);

      await request(server).post("/auth/signup").send(provider1);
      const res3 = await request(server).post("/auth/login").send(provider1);
      provider1Token = res3.body.token;
      // decodedProvider1Token = jwt.decode(provider1Token);
    });

    //Consider mapping a few users?
    describe("PUT /:id/provider", () => {
      it("should send 400 to normal user with empty provider id", async () => {
        const res = await request(server)
          .put("/users/" + decodedToken0._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe("Provider ID needed");
      });
      it("should send 403 with a bad user _id", async () => {
        const res = await request(server)
          .put("/users/123/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: decodedProvider0Token._id });
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe("You are not allowed to access others' provider");
      });
      it("should send 403 to normal user with someone else's id", async () => {
        const res = await request(server)
          .put("/users/" + decodedProvider0Token._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: decodedProvider0Token._id });
        expect(res.statusCode).toEqual(403);
        expect(res.text).toBe("You are not allowed to access others' provider");
      });
      it("should send 200 to normal user their own id and return updated information", async () => {
        const res = await request(server)
          .put("/users/" + decodedToken0._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: decodedProvider0Token._id });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          _id: decodedToken0._id,
          name: decodedToken0.name,
          email: decodedToken0.email,
          providerId: decodedProvider0Token._id,
        });
      });
      it("should send 400 to normal user if providerId does not exist ", async () => {
        const res = await request(server)
          .put("/users/" + decodedToken0._id + "/provider")
          .set("Authorization", "Bearer " + token0)
          .send({ providerId: "6657aeb53975f21e8339343" });
        expect(res.statusCode).toEqual(400);
        expect(res.text).toBe("Invalid Object Id");
      });
    });

    beforeEach(async () => {
      const res4 = await request(server)
        .put("/users/" + decodedToken0._id + "/provider")
        .set("Authorization", "Bearer " + token0)
        .send({ providerId: decodedProvider0Token._id });
      const res5 = await request(server)
        .put("/users/" + decodedToken1._id + "/provider")
        .set("Authorization", "Bearer " + token1)
        .send({ providerId: decodedProvider0Token._id });
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
          { name: decodedToken0.name, email: decodedToken0.email },
          { name: decodedToken1.name, email: decodedToken1.email },
        ]);
      });
    });

    describe("GET / /:id user %#", () => {
      it("should send 400 to normal user if id belongs to someone else", async () => {
        const res = await request(server)
          .get("/users/" + decodedToken1._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe("Not your Id");
      });
      it("should send 200 to normal user and return own information", async () => {
        const res = await request(server)
          .get("/users/" + decodedToken0._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          name: decodedToken0.name,
          email: decodedToken0.email,
          providerId: decodedProvider0Token._id, //see if I can get it from jwtoken
        });
      });
      it("should send 200 to provider and return own information ", async () => {
        const res = await request(server)
          .get("/users/" + decodedProvider0Token._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          name: decodedProvider0Token.name,
          email: decodedProvider0Token.email,
        });
      });
      it("should send 200 to provider and return patient's information ", async () => {
        const res = await request(server)
          .get("/users/" + decodedToken0._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            name: decodedToken0.name,
            email: decodedToken0.email,
          },
        ]);
      });
      it("should send 404 to provider if not their patient", async () => {
        const res = await request(server)
          .get("/users/" + decodedToken0._id)
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
