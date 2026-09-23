let currentAudio = new Audio();
let currentIndex = null;

async function getSongs() {
  let response = await fetch("songs/songs.json");
  let songs = await response.json();

  console.log(songs);

  // FOR LIBRARY
  let songList = document.querySelector(".songlist ul");

  songs.forEach((song, index) => {
    songList.innerHTML += `<li data-index="${index}">${song.title} - ${song.artist}</li>`;
  });
  document.querySelectorAll(".card").forEach((card) => {
    let index = Number(card.dataset.index);
    let song = songs[index];
    card.querySelector("h2").innerHTML = song.title;
    card.querySelector("p").innerHTML = song.artist;
  });
  function updatePlayIcons() {
    document.querySelectorAll(".card").forEach((card) => {
      let cardIndex = Number(card.dataset.index);
      let playDiv = card.querySelector(".play");

      if (cardIndex === currentIndex && !currentAudio.paused) {
        playDiv.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V20H6V4Z" fill="#141B34" />
                <path d="M14 4H18V20H14V4Z" fill="#141B34" />
            </svg>`;
      } else {
        playDiv.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
            </svg>`;
      }
    });
    let mainPlayBtn = document.querySelector(".play-btn");
    if (currentIndex !== null && !currentAudio.paused) {
      mainPlayBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4H10V20H6V4Z" fill="white" />
            <path d="M14 4H18V20H14V4Z" fill="white" />
        </svg>`;
    } else {
      mainPlayBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" fill="white" />
        </svg>`;
    }
  }

  function playSong(index) {
    if (currentIndex === index && !currentAudio.paused) {
      // same song, currently playing → pause it
      currentAudio.pause();
      updatePlayIcons();
      return;
    }

    if (currentIndex === index && currentAudio.paused) {
      // same song, currently paused → just resume, don't reload
      currentAudio.play();
      updatePlayIcons();
      return;
    }

    // different song → load fresh and play
    let song = songs[index];
    currentAudio.src = "songs/" + song.file;
    currentAudio.play();
    currentIndex = index;
    document.querySelector(".songinfo").innerHTML =
      song.title + " - " + song.artist;
    updatePlayIcons();
  }

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      let index = Number(card.dataset.index);
      playSong(index);
    });
  });

  document.querySelectorAll(".songlist ul li").forEach((li) => {
    li.addEventListener("click", () => {
      let index = Number(li.dataset.index);
      playSong(index);
    });
  });
  document.querySelector(".next-btn").addEventListener("click", () => {
    let nextIndex = (currentIndex + 1) % songs.length;
    playSong(nextIndex);
  });

  document.querySelector(".prev-btn").addEventListener("click", () => {
    let prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(prevIndex);
  });
  document.querySelector(".play-btn").addEventListener("click", () => {
    if (currentIndex === null) {
      playSong(0);
    } else {
      playSong(currentIndex);
    }
  });
  let lastVolume = 1; // stores volume before mute

  document.querySelector(".volumebar").addEventListener("input", (e) => {
    let vol = e.target.value / 100;
    currentAudio.volume = vol;
    lastVolume = vol;
    updateVolumeIcon(vol);
  });
  document.querySelector(".volume-btn").addEventListener("click", () => {
    if (currentAudio.volume > 0) {
      lastVolume = currentAudio.volume;
      currentAudio.volume = 0;
      document.querySelector(".volumebar").value = 0;
    } else {
      currentAudio.volume = lastVolume;
      document.querySelector(".volumebar").value = lastVolume * 100;
    }
    updateVolumeIcon(currentAudio.volume);
  });
  document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").classList.toggle("show");
});
  function updateVolumeIcon(vol) {
    let volumeBtn = document.querySelector(".volume-btn");
    if (vol === 0) {
      // muted icon
      volumeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M16 9L20 15M20 9L16 15" stroke="white" stroke-width="1.5" stroke-linecap="round" />
    </svg>`;
    } else {
      // unmuted icon
      volumeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M15.5 8.5C16.5 9.5 17 10.7 17 12C17 13.3 16.5 14.5 15.5 15.5" stroke="white" stroke-width="1.5" stroke-linecap="round" />
    </svg>`;
    }
  }
}

getSongs();
currentAudio.addEventListener("timeupdate", () => {
  let percent = (currentAudio.currentTime / currentAudio.duration) * 100;
  document.querySelector(".seekbar").value = percent;

  let curMinutes = Math.floor(currentAudio.currentTime / 60);
  let curSeconds = Math.floor(currentAudio.currentTime % 60);
  document.querySelector(".current-time").innerHTML =
    curMinutes + ":" + (curSeconds < 10 ? "0" + curSeconds : curSeconds);

  let totalMinutes = Math.floor(currentAudio.duration / 60);
  let totalSeconds = Math.floor(currentAudio.duration % 60);
  document.querySelector(".total-time").innerHTML =
    totalMinutes +
    ":" +
    (totalSeconds < 10 ? "0" + totalSeconds : totalSeconds);
});

document.querySelector(".seekbar").addEventListener("input", (event) => {
  let sliderValue = event.target.value;
  let seekTime = (sliderValue / 100) * currentAudio.duration;
  currentAudio.currentTime = seekTime;
});
