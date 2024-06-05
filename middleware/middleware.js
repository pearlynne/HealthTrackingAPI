const { Router } = require("express");
const jwt = require("jsonwebtoken");
const secret = "t33h33h00"; 

const userDAO = require("../daos/user");

const isAuthenticated = async (req, res, next) => { 
	const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    res.status(401).send("No token");
  } else {
    const tokenString = bearerToken.split(" ")[1];
    try {
      const decoded = jwt.verify(tokenString, secret);
      if (decoded) {
        req.user = decoded; 
        next();
      }
    } catch (e) {
      res.status(401).send("Bad token");
      next(e);
    }
  }
};

const isProvider = async (req, res, next) => {
  const email = req.user.email;
  try {
    const user = await userDAO.getUser(email); 
    if (user.roles.includes("provider")) {
      next();
    } else {
      res.status(403).render("error", {message: "Not a healthcare provider"});
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { isAuthenticated, isProvider };
