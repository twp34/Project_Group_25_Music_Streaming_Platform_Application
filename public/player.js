const audio = document.getElementById("audio-player");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");
const progressBar = document.getElementById("progressBar");
const songRating = document.getElementById("song-rating");

let currentIndex = 0;

function loadSong(index) {
  const song = playlist[index];

  
  updateRatingDisplay(song);

  audio.src = `/musicMP3s/${encodeURIComponent(song.songname)}.mp3`;


  songTitle.textContent = song.songname;
  artistName.textContent = song.artist;

  progressBar.value = 0;
}

function togglePlay() {
  if (audio.paused) audio.play();
  else audio.pause();
}

function nextSong() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex);
  audio.play();
}

function prevSong() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentIndex);
  audio.play();
}

function updateRatingDisplay(song) {
    if (!song.rating) {
        songRating.innerHTML = "";
        return;
    }
    let stars = "";
    for (let i = 0; i < 5; i++) {
        stars += i < song.rating ? "★" : "☆";
    }
    songRating.innerHTML = stars;
}


audio.addEventListener("timeupdate", () => {
  if (audio.duration) progressBar.value = (audio.currentTime / audio.duration) * 100;
});

progressBar.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (progressBar.value / 100) * audio.duration;
});


playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

loadSong(currentIndex);
