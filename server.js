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
    password: "weasel2002",
    port: 5432
});
async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            full_name VARCHAR(100),
            email VARCHAR(120),
            password VARCHAR(200) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS songs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            artist VARCHAR(200),
            album VARCHAR(200),
            genre VARCHAR(100),
            duration INTEGER,
            audio_path TEXT
        );

        CREATE TABLE IF NOT EXISTS playlists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            name VARCHAR(200) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS playlist_songs (
            id SERIAL PRIMARY KEY,
            playlist_id INTEGER REFERENCES playlists(id),
            song_id INTEGER REFERENCES songs(id)
        );

        CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            song_id INTEGER REFERENCES songs(id),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            review TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);

    await pool.query(`
        INSERT INTO songs (title, artist, album, genre, duration, audio_path)
        VALUES 
            ('For What It''s Worth', 'Buffalo Springfield', 'Buffalo Springfield', 'Rock', 173, '\\musicMP3s\\ForWhatItsWorth.mp3'),
            ('Willow Tree Lullaby', 'America', 'Holiday', 'Folk Rock', 200, ''),
            ('Rainy Day', 'America', 'Heartbreak Holiday', 'Soft Rock', 215, ''),
            ('Bitter Sweat Symphony', 'The Verve', 'Urban Hymns', 'Alternative Rock', 337, ''),
            ('Walk of Life', 'Dire Straits', 'Brothers in Arms', 'Rock', 250, '\\musicMP3s\\WalkOfLife.mp3'),
            ('Solsbury Hill', 'Peter Gabriel', 'Peter Gabriel (3)', 'Progressive Rock', 267, ''),
            ('Saturday in the Park', 'Chicago', 'Chicago V', 'Pop Rock', 227, ''),
            ('Peaceful Easy Feeling', 'The Eagles', 'Eagles', 'Country Rock', 200, '\\musicMP3s\\PeacefulEasyFeeling.mp3')
        ON CONFLICT DO NOTHING;
    `);
    try {
        await pool.query(`
        ALTER TABLE songs
        ADD CONSTRAINT unique_song UNIQUE (title, artist);

        ALTER TABLE playlists
        ADD CONSTRAINT unique_user_playlist UNIQUE (user_id, name);

        ALTER TABLE playlist_songs
        ADD CONSTRAINT unique_playlist_song UNIQUE (playlist_id, song_id);
        `);
        console.log("Database initialized.");
    } catch (err) {

    }
    await pool.query(`
        INSERT INTO users (username, full_name, email, password)
        VALUES ('defaultuser', 'Default User', 'default@example.com', 'password')
        ON CONFLICT DO NOTHING;
        `);
    await pool.query(`
        INSERT INTO playlists (user_id, name) VALUES
        (1, 'Classic Rock'),
        (1, 'Roadtrip'),
        (1, 'Soft Rock'),
        (1, 'Vibes'),
        (1, 'Favorites'),
        (1, 'Best of America')
        ON CONFLICT DO NOTHING;

        INSERT INTO playlist_songs (playlist_id, song_id) VALUES
        (1, 1),
        (1, 5),
        (1, 6),
        (1, 7),
        (2, 8),
        (2, 7),
        (2, 6),
        (2, 5),
        (3, 3),
        (3, 2),
        (3, 8),
        (3, 7),
        (4, 2),
        (4, 3),
        (4, 8),
        (5, 7),
        (5, 5),
        (5, 8),
        (6, 2),
        (6, 3)
        ON CONFLICT DO NOTHING;
        `);

}
initializeDatabase();
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
        return res.redirect("/signin");
    }

});

server.get("/song/:id", async (req, res) => {
	let songId = req.params.id
	let songResult = await pool.query("SELECT * FROM songs WHERE id = $1", [songId]);

    let ratingResult = await pool.query(`SELECT AVG(rating)::numeric(10,2) AS avg_rating, COUNT(*) AS total FROM ratings WHERE song_id = $1`, [songId]);

    res.render("ratings", {
        song: songResult.rows[0],
        rating: ratingResult.rows[0],
        user: req.session.user
    });
});

server.post("/rate", async (req, res) => {
	let song_id = req.body.song_id;
	let rating = req.body.rating;
	let userId = req.session.user.id;

    try {
        await pool.query(`
            INSERT INTO ratings (user_id, song_id, rating)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, song_id) DO UPDATE
            SET rating = EXCLUDED.rating
        `, [userId, song_id, rating]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
    }
});

server.get("/playlists", async(req, res) => {

    let currentPl = req.query.playlistId;
    //console.log(currentPl)
    let user;
    let songs;
    const allResult = await pool.query("SELECT * FROM playlists LIMIT 20");
    const allplaylists = allResult.rows;
    try {
        const result = await pool.query(
            `SELECT s.id, s.title, s.artist, s.album, s.genre, s.duration, s.audio_path
             FROM playlist_songs ps
             JOIN songs s ON ps.song_id = s.id
             WHERE ps.playlist_id = $1`, [currentPl]
        );

        songs = result.rows;
        //console.log(songs);
    } catch (err) {
        console.log(err);
    }
    if (req.session.user) {
        pool.query("SELECT * FROM playlists WHERE user_id = $1", [req.session.user.id])
            .then(result => {
                userplaylists = result.rows;
                //console.log(result.rows);
            })
            .catch(err => {
                console.error(err);
            });


        user = req.session.user;

    } else {
        return res.redirect("/signin");
    }
    res.render("playlists", { playlists: userplaylists, allplaylists: allplaylists, songs: songs, currentpl: currentPl, user: user, body: "" });
});

server.get("/createPlaylist", (req, res) => {
    let user;
    if (req.session.user) {
        user = req.session.user;
    }

    if (typeof user === "undefined") {
        return res.redirect("/signup");
    }
    res.render("createPlaylists", { playlists: userplaylists, user: user });
});

server.post("/createPlaylist", async(req, res) => {
    const name = req.body.name;
    if (!name || name.trim() === "") {
        return res.redirect("/createPlaylist");
    }

    const newPlaylist = { id: userplaylists.length, name: name.trim(), songs: [] };
    let user;
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

server.get("/search", async(req, res) => {
    let result;
    try {
        result = await pool.query(`SELECT * FROM songs WHERE title ILIKE '%' || $1
             || '%' OR artist ILIKE '%' || $1 || '%' OR album ILIKE '%' || $1 || '%'`, [req.query.searchsongs]);
    } catch (err) {
        console.log(err);
        result = { rows: [] };
    }
    res.render("search", { user: req.session.user, songs: result.rows, playlists: userplaylists });

});

server.post("/add-to-playlist", async(req, res) => {
    console.log(req.body.playlistId);
    console.log(req.body.songId);
    try {
        playlist_id = req.body.playlistId;
        song_id = req.body.songId;
        await pool.query(
            "INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2)", [playlist_id, song_id]
        );
        res.redirect(req.get('Referer') || '/');
    } catch (err) {
        console.error(err);
    }
});


server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
});