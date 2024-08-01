const express = require("express");
const path = require("path");
const mustacheExpress = require("mustache-express");
const methodOverride = require("method-override");
const routes = require("./routes"); 

const server = express();

server.use(express.static(path.join(__dirname, 'public')));

server.engine("mustache", mustacheExpress());

server.set('views', path.join(__dirname, 'views'));

server.set("view engine", "mustache");

server.use(methodOverride("_method"));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(routes);

server.get('/d3.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/d3/dist/d3.min.js'));
});

server.get('/charts/d3Charts.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/charts/d3Charts.js'));
});

module.exports = server;
