const request = require("supertest");
const jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");
const Appointment = require("../models/appointment");

describe("Appointments routes", () => {
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

  const randomAppt = {
    userId: "664a9d2f8ec0a9969454487e",
    date: "01-01-2023",
    providerId: "66555c4290399e2553ffadc2",
  };

  /** Before login **/
  // describe("Before login", () => {
  //   describe("GET / appointments", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).get("/appointments").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .get("/appointments")
  //         .set("Authorization", "Bearer BAD")
  //         .send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  //   describe("GET / appointments/:id", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).get("/appointments/123").send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .get("/appointments/123")
  //         .set("Authorization", "Bearer BAD")
  //         .send();
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  // 	describe("POST / appointments", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).post("/appointments/").send(randomAppt);
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .post("/appointments/")
  //         .set("Authorization", "Bearer BAD")
  //         .send(randomAppt);
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  // 	describe("PUT / appointments/:id", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).put("/appointments/123").send(randomAppt);
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .put("/appointments/123")
  //         .set("Authorization", "Bearer BAD")
  //         .send(randomAppt);
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  // 	describe("DELETE / appointments/:id", () => {
  //     it("should send 401 without a token", async () => {
  //       const res = await request(server).delete("/appointments/123").send(randomAppt);
  //       expect(res.statusCode).toEqual(401);
  //     });
  //     it("should send 401 with a bad token", async () => {
  //       const res = await request(server)
  //         .delete("/appointments/123")
  //         .set("Authorization", "Bearer BAD")
  //         .send(randomAppt);
  //       expect(res.statusCode).toEqual(401);
  //     });
  //   });
  // });

  /** After login **/

  describe("After login", () => {
    let token0;
    let decodedToken0;
    let token1;
    let decodedToken1;
    let provider0Token;
    let decodedProvider0Token;
    let provider1Token;
    let decodedProvider1Token;
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
      decodedProvider1Token = jwt.decode(provider1Token);
    });

    beforeEach(async () => {
      await request(server)
        .put("/users/" + decodedToken0._id + "/provider")
        .set("Authorization", "Bearer " + token0)
        .send({ providerId: decodedProvider0Token._id });
      await request(server)
        .put("/users/" + decodedToken1._id + "/provider")
        .set("Authorization", "Bearer " + token1)
        .send({ providerId: decodedProvider0Token._id });
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
        expect(res.text).toBe("Missing appointment information");
        const res1 = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: "",
            date: "01-01-2023",
            providerId: decodedProvider0Token._id,
          });
        expect(res1.statusCode).toEqual(404);
        expect(res1.text).toBe("Missing appointment information");
        const res2 = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: decodedToken0._id,
            date: "",
            providerId: decodedProvider0Token._id,
          });
        expect(res2.statusCode).toEqual(404);
        expect(res2.text).toBe("Missing appointment information");
        const res3 = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: decodedToken0._id,
            date: "01-01-2023",
            providerId: "",
          });
        expect(res3.statusCode).toEqual(404);
        expect(res3.text).toBe("Missing appointment information");
      });
      it("should send 404 if provider does not match providerId in body", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: decodedToken0._id,
            date: "01-01-2023",
            providerId: decodedProvider1Token._id,
          });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe(
          "You cannot create appointments for other providers"
        );
      });
      it("should send 404 if patient is not related to provider", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider1Token)
          .send({
            userId: decodedToken0._id,
            date: "01-01-2023",
            providerId: decodedProvider1Token._id,
          });
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe(
          "You can only create appointments for your patients"
        );
      });
      it("should send 200 for provider and return appointment object", async () => {
        const res = await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: decodedToken0._id,
            date: "01-01-2023",
            providerId: decodedProvider0Token._id,
          });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          userId: decodedToken0._id,
          date: "2023-01-01T08:00:00.000Z", // TO FIX: cannot not hardcode due to quotation marks
          providerId: decodedProvider0Token._id,
        });
      });
    });

    let aptInfo;
    beforeEach(async () => {
      const aptRes = await request(server)
        .post("/appointments")
        .set("Authorization", "Bearer " + provider0Token)
        .send({
          userId: decodedToken0._id,
          date: "01-01-2023",
          providerId: decodedProvider0Token._id,
        });
      aptInfo = aptRes;
      const aptRes1 = await request(server)
        .post("/appointments")
        .set("Authorization", "Bearer " + provider0Token)
        .send({
          userId: decodedToken0._id,
          date: "02-01-2023",
          providerId: decodedProvider0Token._id,
        });
      // const aptRes2 = await request(server)
      //   .post("/appointments")
      //   .set("Authorization", "Bearer " + provider0Token)
      //   .send({
      //     userId: decodedToken1._id,
      //     date: "02-27-2023",
      //     providerId: decodedProvider0Token._id,
      //   });
    });
   
		describe("GET / appointments", () => {
      it("should send 200 for normal user and return appointment object", async () => {
        const res = await request(server)
          .get("/appointments")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            name: decodedProvider0Token.name,
            date: ["2023-01-01T08:00:00.000Z", "2023-02-01T08:00:00.000Z"],
          },
        ]);
      });
      it("should send 200 for normal user if there are no appointments", async () => {
        const res = await request(server)
          .get("/appointments")
          .set("Authorization", "Bearer " + token1)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe("You do not have any appointments");
      });
      it("should send 200 for provider and return all appointments by patient name", async () => {
        await request(server)
          .post("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send({
            userId: decodedToken1._id,
            date: "02-27-2023",
            providerId: decodedProvider0Token._id,
          });
        const res = await request(server)
          .get("/appointments")
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(2);
      });
    });

    describe("GET / appointments/:id", () => {
      // = should return 404 if id is not an objectId
      it("should send 404 with a bad appointment _id", async () => {
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
        expect(res.text).toBe("You do not have this appointment");
      });
      it("should send 200 for user and return appointment information", async () => {
        const res = await request(server)
          .get("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            name: decodedProvider0Token.name,
            date: ["2023-01-01T08:00:00.000Z"],
          },
        ]);
      });
			it("should send 404 if appointment does not belong to provider", async () => {
        const res = await request(server)
          .get("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider1Token)
          .send();
        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe("You do not have this appointment");
      }); 
      it("should send 200 for provider and return patient's appointment information", async () => {
        const res = await request(server)
          .get("/appointments/" + aptInfo.body._id)
          .set("Authorization", "Bearer " + provider0Token)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            name: decodedToken0.name,
            date: ["2023-01-01T08:00:00.000Z"],
          },
        ]);
      });
    });
  });

  // #region describe("PUT / appointments/:id %#"...
  // ======== No access for normal users ========
  // = should return 403 for normal user
  // = should return 404 if id is not an objectId
  // = should return 404 if appointment object body is missing
  // = !!! should return 403 for provider if appointmentId does not belong to provider user (incomplete; fix dao to throw newError if updateAppointment returns null)
  // = should return 200 for provider with updated appointment object
  // === should return patient name, email, appointment date, providerId (incomplete; fix dao to add x-ref)
  // #endregion

  // #region describe("DELETE / appointments/:id %#"...
  // ======== No access for normal users ========
  // = should return 403 for normal user
  // = should return 404 if id is not an objectId
  // = should return 403 for provider if appointmentId does not belong to provider user (incomplete; fix dao to throw newError deleteAppointment returns null)
  // = should return 200 for provider with deleted appointment object
  // === should return message for completed (incomplete; fix route send status)
  // #endregion
});
