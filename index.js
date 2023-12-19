const express = require("express");
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cookie());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

const port = process.env.MYSQL_PORT || 8000;
require("./database/index");
const routes = require("./routes");

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://les-des-gommes.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.use(routes);
app.use("*", (req, res) => {
    res.status(404).end();
});
app.get("/", (_, res) => {
    res.send(JSON.stringify("API WORKING"));
});
app.listen(port, () => {
    console.log(`serveur Node écoutant sur le port ${port}`);
});