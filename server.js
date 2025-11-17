const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(cors());

const db = new Pool({ 
    user: "postgres",
    host: "localhost",
    database: "MusicAppDB",
    password: "weasel2002",
    port: 5432,
});

server.set("view engine", "ejs");

server.get("/", (req, res) => res.render("index"));

server.get("/signup", (req, res) => res.render("signup"));

server.get("/signin", (req, res) => res.render("signin"));

server.get("/profile", (req, res) => res.render("profile"));

server.post("/signup", async (req, res) => {
	let username,password,name,email,existingUser;
    username = req.body.username;
	password = req.body.password;
	email = req.body.email;

    try {
        existingUser = await db.query("SELECT * FROM users WHERE username = $1",[username]);
        if (existingUser.rows.length > 0) {
            res.redirect("/signup") 
			} else {
			await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",[username, email, password]);
			res.redirect("/signin")
			}
    } catch (err) {
        console.error(err);
		res.redirect("/signup")
    }
});

server.post("/signin", async (req, res) => {
    let username, password, result;
	username = req.body.username;
	password = req.body.password;

    try {
        result = await db.query("SELECT * FROM users WHERE username = $1 AND password = $2",[username, password]);
        if (result.rows.length === 0) {
			return res.redirect("/signin")
        }
		res.redirect("/")
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during signin");
		res.redirect("/signin")
    }
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
});
