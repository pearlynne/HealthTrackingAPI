const express = require("express");
const routes = require("./routes");
const mustacheExpress = require("mustache-express");
const methodOverride = require("method-override");
const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// mustache, form related
server.engine("mustache", mustacheExpress());
server.set("view engine", "mustache");
server.use(methodOverride("_method"));

server.use(routes); 

//form related
server.post("/", (req, res) => {
  //
});

server.put("/", (req, res) => {
  //
});

server.delete("/", (req, res) => {
  //
});


module.exports = server;
