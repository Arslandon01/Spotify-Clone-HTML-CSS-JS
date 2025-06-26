console.log("Let's write JavaScript");
let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutes(seconds) {
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    remainingSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${minutes}:${remainingSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let responseJson = await fetch(`${folder.replace(/\/$/, '')}/info.json`);
    let albumData = await responseJson.json();
    let artist = albumData.artist;
    let a = await fetch(`${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            const songName = element.href.split(`${folder}`)[1];
            songs.push(songName);
        }
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.insertAdjacentHTML(
            "beforeend",
            `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").replaceAll("/", " ").replaceAll(".mp3", " ")}</div>
                    <div class="artistname">${artist}</div>
                </div>
                <div class="playnow">
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`
        );
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            const track = `${songs[index]}`;
            playmusic(track);
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {
    currentsong.src = `${currfolder.replace(/\/$/, '')}/${track}`;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").textContent = decodeURI(track)
        .replaceAll("songs/", " ")
        .replaceAll("/", " ")
        .replaceAll(".mp3", " ");
    document.querySelector(".songtime").textContent = "00:00/00:00";
};
 
async function displayAlbums() {
    let a = await fetch("/songs");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");

    Array.from(anchors).forEach(async (e) => {
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) 
            {
            let folder = e.href.split("/").slice(-1)[0];
            let folderData = await fetch(`/songs/${folder}/info.json`);
            let folderInfo = await folderData.json();

            cardcontainer.insertAdjacentHTML(
                "beforeend",
                `<div data-folder="${folder}" class="card album-card">
                    <div class="play">
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="20" fill="#1fdf64" />
                            <path d="M15 28V12L29 20L15 28Z" fill="black" stroke="black" stroke-width="1" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${folderInfo.title}</h2>
                    <p>${folderInfo.description || ""}</p>
                </div>`
            );
        }
    });
}

document.querySelector(".cardcontainer").addEventListener("click", async (event) => {
    const card = event.target.closest(".card");
    if (card) {
        const folder = card.dataset.folder;
        songs = await getsongs(`songs/${folder}`);
        if (songs.length > 0) {
            playmusic(songs[0]);
        } else {
            console.log("No songs found in this folder.");
        }
    }
});

async function main() {
    await getsongs("songs/kaka");
    playmusic(songs[0], true)
    displayAlbums()

    // Attach event listener to play/pause button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });
    //Listen for time update

    currentsong.addEventListener("timeupdate", () => {
        let currentTimeFormatted = secondsToMinutes(currentsong.currentTime);
        let durationFormatted = secondsToMinutes(currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${ currentTimeFormatted } / ${durationFormatted}`;

        let circlePosition = (currentsong.currentTime / currentsong.duration) * 100;
        document.querySelector(".circle").style.left =` ${ circlePosition }%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * (percent / 100);
    });



    //add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listner to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"

    })

    //Ad an event listner to previous

    previous.addEventListener("click", () => {
        currentsong.pause();
        console.log("Previous clicked");
        let index = songs.findIndex(song => currentsong.src.includes(song));


        if (index > 0) {
            playmusic(songs[index - 1]);
        } else {

            playmusic(songs[songs.length - 1]);
        }
    });

    //Ad an event listner to next
    next.addEventListener("click", () => {
        currentsong.pause();
        console.log("Next clicked");

        let index = songs.findIndex(song => currentsong.src.includes(song));


        if (index < songs.length - 1) {
            playmusic(songs[index + 1]);
        } else {
            // Loop back to the first song
            playmusic(songs[0]);
        }
    });


    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    })

    // Listen for song ending
    currentsong.addEventListener("ended", () => {
        // Get the current song index based on the currentsong.src
        let currentIndex = songs.findIndex(song =>
            currentsong.src.includes(song)
        );


        if (currentIndex !== -1 && (currentIndex + 1) < songs.length) {
            playmusic(songs[currentIndex + 1]);
        } else {
            playmusic(songs[0]);
        }
    });

    // Key Shortcuts


    document.addEventListener('keydown', (e) => {
        // Play/Pause when space bar is pressed
        if (e.key === " " || e.code === "Space") {
            e.preventDefault();
            if (currentsong.paused) {
                currentsong.play();
                play.src = "img/pause.svg";
            } else {
                currentsong.pause();
                play.src = "img/play.svg";
            }
        }

        // Next song 
        if (e.key === "n" || e.key === "N") {
            e.preventDefault();
            next.click();
        }

        // Previous song 
        if (e.key === "p" || e.key === "P") {
            e.preventDefault();
            previous.click();
        }
    });

    document.addEventListener('keydown', (e) => {
        //  forward 10 seconds when right arrow is pressed
        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (currentsong.currentTime + 10 < currentsong.duration) {
                currentsong.currentTime += 10;
            } else {
                currentsong.currentTime = currentsong.duration;
            }
        }

        // backward 10 seconds when left arrow is pressed
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (currentsong.currentTime - 10 > 0) {
                currentsong.currentTime -= 10;
            } else {
                currentsong.currentTime = 0;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (currentsong.volume < 1) {
                    currentsong.volume = Math.min(1, currentsong.volume + 10);
                }
                console.log("Volume:", currentsong.volume);
            }

            // Volume down when ArrowDown is pressed
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (currentsong.volume > 0) {
                    currentsong.volume = Math.max(0, currentsong.volume - 10);
                }
            }
        }
    });

    // Volume up


}


// mute/unmute the song and change volume image
function toggleMute() {
    if (currentsong.volume === 0) {

        currentsong.volume = previousVolume;
        volumeIcon.src = "img/volume.svg";
    } else {

        previousVolume = currentsong.volume;
        currentsong.volume = 0;
        volumeIcon.src = "img/mute.svg";
    }
}

document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentsong.volume = 0
    }
    if (e.target.src.includes("volume-low.svg")) {
        e.target.src = e.target.src.replace("volume-low.svg", "mute.svg")
        currentsong.volume = 0
    }
    else {
        currentsong.volume = .10
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")



    }
})


// Function to handle volume change and update the icon
let previousVolume = 1;
let volumeIcon = document.getElementById("volimg");
function updateVolumeIcon() {
    if (currentsong.volume === 0) {
        volumeIcon.src = "img/mute.svg";
    } else if (currentsong.volume > 0 && currentsong.volume <= 0.5) {
        volumeIcon.src = "img/volume-low.svg";
    } else {
        volumeIcon.src = "img/volume.svg";
    }
}

document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
    currentsong.volume = e.target.value / 100;
    updateVolumeIcon();
});

document.addEventListener('keydown', (e) => {
    document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "m") {
            toggleMute();
        }

    });
    // Volume up when ArrowUp is pressed
    if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentsong.volume < 1) {
            currentsong.volume = Math.min(1, currentsong.volume + 0.01); // Increase volume by 10%
            // Update volume slider
            document.querySelector(".range input").value = currentsong.volume * 100;
            updateVolumeIcon();
        }
    }

    // Volume down when ArrowDown is pressed
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentsong.volume > 0) {
            currentsong.volume = Math.max(0, currentsong.volume - 0.01); // Decrease volume by 10%
            document.querySelector(".range input").value = currentsong.volume * 100;
            updateVolumeIcon();
        }
    }

    const volumeSlider = document.querySelector(".range input");
    volumeSlider.value = currentsong.volume * 100;

    currentsong.addEventListener("volumechange", () => {
        volumeSlider.value = currentsong.volume * 100;
        updateVolumeIcon();
    });
});
updateVolumeIcon();




main();