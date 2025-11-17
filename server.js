const express = require("express");
const server = express();
server.set("view engine", "ejs");
server.use(express.urlencoded({ extended: true }));

server.get("/", (request, response) => {
	response.render("index"); //home page
});

server.get("/signup", (request, response) => {
	response.render("signup"); //signup page
});

server.get("/signin", (request, response) => {
	response.render("signin"); //signin page
});

server.get("/profile", (request, response) => {
	response.render("profile"); //user profile page
});

server.get("/playlists", (request, response) => {
	response.render("playlists"); //list playlists page
});

server.get("/playlists/create", (request, response) => {
	response.render("createPlaylist"); //create playlist page
});

server.post("/signup", (request, response) => {
	//signup logic goes here later
	response.send("Signup not implemented yet.");
});

server.post("/signin", (request, response) => {
	//signin logic goes here later
	response.send("Signin not implemented yet.");
});

server.listen(3000, () => console.log("Running on http://localhost:3000"));
