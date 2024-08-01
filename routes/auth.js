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

router.get("/password", (req, res, next) => {
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
		res
      .status(400)
      .render(
        "message",
        { title: "Error", message: "Incomplete information" },
        (err, html) => {
          if (err) return next(err);

          res.render("partials/layout", {
            title: "Login",
            content: html,
          });
        }
      );
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

    res
      .status(400)
      .render(
        "message",
        { title: "Error", message: "Email/password needed" },
        (err, html) => {
          if (err) return next(err);

          res.render("partials/layout", {
            title: "Login",
            content: html,
          });
        }
      );
  } else {
    try {
      const user = await userDAO.getUser(email);
      if (!user) {
        // res.status(401).send("User account does not exist");
        res.render(
          "message",
          { title: "Error",
						message: "User account does not exist" },
          (err, html) => {
            if (err) return next(err);

            res.render("partials/layout", {
              title: "Login",
              content: html,
            });
          }
        );
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
        res.redirect("/appointments/");
      } else {
        res.status(401).send("Password does not match");
      }
    } catch (e) {
      next(e);
    }
  }
});

router.put("/password", isAuthenticated, async (req, res, next) => {
  const { password } = req.body;
  if (!password || JSON.stringify(req.body) === "{}") {
    // res.status(400).send("New password needed");
    res
      .status(400)
      .render("message", { title: "Error",
				message: "New password needed" }, (err, html) => {
        if (err) return next(err);

        res.render("partials/layout", {
          title: "Login",
          content: html,
        });
      });
  } else {
    try {
      const newHash = await bcrypt.hash(password, 5);
      const updatedPassword = await userDAO.updateUserPassword(
        req.user._id,
        newHash
      );
      // res.json(updatedPassword);
			res
      .render("message", { title: "Success!",
				message: "Password Updated" }, (err, html) => {
        if (err) return next(err);

        res.render("partials/layout", {
          title: "Login",
          content: html,
        });
      });
			
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
