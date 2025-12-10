document.querySelectorAll(".rating span").forEach(star => {
    star.addEventListener("click", async () => {
        const rating = star.dataset.star;
        const songId = document.querySelector(".rating").dataset.songId;

        await fetch("/rate", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ rating, song_id: songId })
        });

        alert("Thanks for rating! " + rating + " stars");
    });
});
