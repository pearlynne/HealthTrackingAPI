const { Router } = require("express");
const router = Router({ mergeParams: true });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userDAO = require("../daos/user");
const { isAuthenticated } = require("../middleware/middleware");
const secret = "t33h33h00";

let token;

router.post("/signup", async (req, res, next) => {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.name ||
    JSON.stringify(req.body) === "{}"
  ) {
    res.status(404).send("Incomplete information");
  } else {
    try {
      const { name, email, password, roles, providerId } = req.body;
      const hash = await bcrypt.hash(password, 5);
      // Verify if we can pass undefined parameter
      const newUser = await userDAO.signup(
        name,
        email,
        hash,
        roles,
        providerId
      );
      res.json(newUser);
    } catch (e) {
      if (e instanceof userDAO.BadDataError) {
        res.status(409).send(e.message);
      }
      next(e);
    }
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || JSON.stringify(req.body) === "{}") {
    res.status(404).send("Email/passwword needed");
  }
  try {
    const user = await userDAO.getUser(email);
    if (!user) {
      res.status(404).send("User account does not exist");
    }
    const passwordMatch = await bcrypt.compare(user.password, password);
    if (passwordMatch) {
      let data = {
        email: user.email,
        roles: user.roles,
        providerId: user.providerId,
        _id: user._id,
      };
      token = jwt.sign(data, secret);
      // can I pass this? as req.headers.authorization = 'Bearer ' + token; next()
      res.json({ token });
    } else {
      res.status(401).send("Password does not match");
    }
  } catch (e) {
    next(e);
  }
});

// https://stackoverflow.com/questions/34589272/how-to-set-authorization-headers-with-nodejs-and-express
// https://stackoverflow.com/questions/71240608/where-should-i-set-the-authorization-header-after-create-the-token
// router.all('*' , (req, res, next) =>
//   if (!token) {
//     console.log('token: undefined');
//   } else {
//     req.headers.authorization = 'Bearer ' + token;
//   }
//   next();
// });

router.put("/password", isAuthenticated, async (req, res, next) => {
  const { password } = req.body;
  if (!password || JSON.stringify(req.body) === "{}") {
    res.status(404).send("New password needed");
  }
  try {
    const newHash = await bcrypt.hash(password, 5);
    const updatedPassword = await userDAO.updateUserPassword(
      req.userId._id,
      newHash
    );
    res.json(updatedPassword);
  } catch (e) {
    next(e);
  }
});


router.post("/logout", isAuthenticated, async (req, res, next) => {
  res.sendStatus(404);
});

module.exports = router;
