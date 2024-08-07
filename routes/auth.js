const { Router } = require("express");
const router = Router({ mergeParams: true });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userDAO = require("../daos/user");
const { isAuthenticated } = require("../middleware/middleware");
const secret = "t33h33h00";

let token;

// Mustache
router.get("/signup", (req, res, next) => {
  res.render("auth_signup", {}, (err, html) => {
    if (err) return next(err);
    res.render("partials/layout", {
      title: "Login",
      content: html,
    });
  });
});

router.get("/login", (req, res, next) => {
  res.render("auth_login", {}, (err, html) => {
    if (err) return next(err);

    res.render("partials/layout", {
      title: "Login",
      content: html,
    });
  });
});

router.get("/password", isAuthenticated, (req, res, next) => {
  res.render("auth_password", {}, (err, html) => {
    if (err) return next(err);

    res.render("partials/layout", {
      title: "Login",
      content: html,
    });
  });
});

router.post("/signup", async (req, res, next) => {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.firstName ||
    !req.body.lastName ||
    JSON.stringify(req.body) === "{}"
  ) {
    res.status(400).json({ success: false, message: "Missing fields" });
  } else {
    try {
      const { firstName, lastName, email, password, roles } = req.body;
      const hash = await bcrypt.hash(password, 5);
      const newUser = await userDAO.signup(
        firstName,
        lastName,
        email,
        hash,
        roles
      );
      res.status(200).json({ success: true, redirectUrl: "/auth/login/" });
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
    res.status(400).json({
      success: false,
      redirectUrl: "/auth/login/",
      message: "Email/Password needed",
    });
  } else {
    try {
      const user = await userDAO.getUser(email);
      if (!user) {
        res.status(400).json({
          success: false,
          redirectUrl: "/auth/login/",
          message: "No such user",
        });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        let data = {
          name: user.name,
          email: user.email,
          roles: user.roles,
          providerId: user.providerId,
          _id: user._id,
        };
        token = jwt.sign(data, secret);
        res.json({ success: true, redirectUrl: "/reports/" });
      } else {
        res.status(400).json({
          success: false,
          redirectUrl: "/auth/login/",
          message: "Incorrect password",
        });
      }
    } catch (e) {
      next(e);
    }
  }
});

router.put("/password", isAuthenticated, async (req, res, next) => {
  const { oldPassword, newPassword, repeatPassword } = req.body;

  if (
    !oldPassword ||
    !newPassword ||
    !repeatPassword ||
    JSON.stringify(req.body) === "{}"
  ) {
    res.status(400).json({
      success: false,
      redirectUrl: "/auth/password/",
      message: "Missing fields",
    });
  } else {
    try {
      const user = await userDAO.getUser(req.user.email);
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        res.status(400).json({
          success: false,
          redirectUrl: "/auth/password/",
          message: "Incorrect Password",
        });
      } else {
				const newHash = await bcrypt.hash(newPassword, 5);
				const updatedPassword = await userDAO.updateUserPassword(
					req.user._id,
					newHash
				);
	
				res.status(200).json({
					success: true,
					redirectUrl: "/profile/",
					message: "Password Updated",
				});
			}

      // res.render(
      //   "message",
      //   { title: "Success!", message: "Password Updated" },
      //   (err, html) => {
      //     if (err) return next(err);

      //     res.render("partials/layout", {
      //       title: "Password",
      //       content: html,
      //     });
      //   }
      // );
    } catch (e) {
      next(e);
    }
  }
});

router.post("/logout", async (req, res, next) => {
  res.sendStatus(404);
});

module.exports = {
  routerAuth: router,
  addHeader: (addHeader = (req, res, next) => {
    if (!token) {
      console.log("token: undefined");
    } else {
      req.headers.authorization = "Bearer " + token;
    }
    next();
  }),
};
