document.querySelectorAll(".rating span").forEach(star => {
    star.addEventListener("click", async () => {
        const rating = star.dataset.star;

        await fetch("/rate", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ rating })
        });

        alert("Thanks for rating! " + rating + " stars");
    });
});
