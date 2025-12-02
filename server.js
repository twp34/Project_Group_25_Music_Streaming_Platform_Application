const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const session = require("express-session");
const server = express();

server.use(session({
    secret: "secrettt",
    serversession: "musicapp_secret",
    resave: false,
    saveUninitialized: true
}));

server.use(express.static("public"));
server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "MusicAppDB",
    password: "kkk123",
    port: 5432
});

let audioLocation = `/public/musicMP3s/`;

let songs_in_FirstPlaylist = [
    { songid: 11, songname: "For What It's Worth", artist: "Buffalo Springfield" },
    { songid: 6, songname: "Willow Tree Lullaby", artist: "America" },
    { songid: 39, songname: "Rainy Day", artist: "America" },
    { songid: 23, songname: "Bitter Sweat Symphony", artist: "The Verve" }
];

let songs_in_SecondPlaylist = [
    { songid: 2, songname: "Walk of Life", artist: "Dire Straits" },
    { songid: 89, songname: "Solsbury Hill", artist: "Peter Gabriel" },
    { songid: 45, songname: "Saturday in the Park", artist: "Chicago" },
    { songid: 123, songname: "Peaceful Easy Feeling", artist: "The Eagles" },
    { songid: 6, songname: "Willow Tree Lullaby", artist: "America" }
];

let userplaylists;
let allplaylists;
//     { id: 0, name: 'First Playlist!', songs: songs_in_FirstPlaylist },
//     { id: 1, name: 'Second Playlist!', songs: songs_in_SecondPlaylist }
// ]; // this is just temp solution before we set up database

// Temporary 
let fakeUser = {
    id: 1,
    username: "hyyjinxx",
    full_name: "Ally Wiedoff",
    email: "ally@example.com"
};

let fakeHistory = [
    { id: 1, song_title: "For What It's Worth", artist: "Buffalo Springfield", played_at: "2025-11-10 15:30" },
    { id: 2, song_title: "Walk of Life", artist: "Dire Straits", played_at: "2025-11-11 09:10" },
    { id: 3, song_title: "Peaceful Easy Feeling", artist: "The Eagles", played_at: "2025-11-12 21:05" }
];

pool.query("SELECT * FROM playlists")
    .then(result => {
        //userplaylists = result.rows;
        console.log(result.rows);
    })
    .catch(err => {
        console.error(err);
    });

server.set("view engine", "ejs");

server.get("/", async(req, res) => {
    const allResult = await pool.query("SELECT * FROM playlists LIMIT 20");
    const allplaylists = allResult.rows;
    let user;
    if (req.session.user) {
        const userResult = await pool.query(
            "SELECT * FROM playlists WHERE user_id = $1", [req.session.user.id]
        );
        userplaylists = userResult.rows;
        user = req.session.user;
    }
    res.render("index", { playlists: userplaylists, allplaylists: allplaylists, user: user, body: "" });

});


server.get("/signup", (req, res) => {
    res.render("signup", { body: "" });
});

server.get("/signin", (req, res) => {
    res.render("signin", { body: "" });
});

server.get("/profile", (req, res) => {
    let user = req.session.user; //|| fakeUser;
    if (req.session.user) {
        res.render("profile", {
            user: user,
            playlists: userplaylists,
            history: fakeHistory,
            body: "",
            title: "Your Profile"
        });
    } else {
        res.render("profile", {
            title: "Please login"
        });
    }

});

server.get("/playlists", (req, res) => {
    let currentPl = req.query.playlistId;

    if (req.session.user) {
        pool.query("SELECT * FROM playlists WHERE user_id = $1", [req.session.user.id])
            .then(result => {
                userplaylists = result.rows;
                //console.log(result.rows);
            })
            .catch(err => {
                console.error(err);
            });
    }
    res.render("playlists", { playlists: userplaylists, currentpl: currentPl, body: "" });
});

server.get("/createPlaylist", (req, res) => {
    res.render("createPlaylists", { playlists: userplaylists });
});

server.post("/createPlaylist", async(req, res) => {
    const name = req.body.name;
    if (!name || name.trim() === "") {
        return res.redirect("/createPlaylist");
    }

    const newPlaylist = { id: userplaylists.length, name: name.trim(), songs: [] };

    if (req.session.user) {
        try {
            await pool.query("INSERT INTO playlists (user_id, name) VALUES ($1, $2)", [req.session.user.id, name.trim()]);
        } catch (err) {
            console.error(err);
        }
    }
    res.redirect("/");
});

server.post("/playlists/create", async(req, res) => {
    let name;
    name = req.body.name;
    if (!name || name.trim() === "") {
        return res.redirect("/profile");
    }

    const newPlaylist = { id: userplaylists.length, name: name.trim(), songs: [] };
    //userplaylists.push(newPlaylist);

    if (req.session.user) {
        try {
            await pool.query("INSERT INTO playlists (user_id, name) VALUES ($1, $2)", [req.session.user.id, name.trim()]);
        } catch (err) {
            console.error(err);
        }
    }
    res.redirect("/profile");
});

server.post("/signup", async(req, res) => {
    let username, password, email, existingUser;
    username = req.body.username;
    password = req.body.password;
    email = req.body.email;

    try {
        existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (existingUser.rows.length > 0) {
            res.redirect("/signup");
        } else {
            await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, password]);
            res.redirect("/signin");
        }
    } catch (err) {
        console.error(err);
        res.redirect("/signup");
    }
});

server.post("/signin", async(req, res) => {
    let username, password;
    username = req.body.username;
    password = req.body.password;

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
        if (result.rows.length === 0) {
            res.redirect("/signin");
        }
        req.session.user = result.rows[0];
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during signin");
    }
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
});