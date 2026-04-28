 let score = 0;
      let time = 30;
      let gameInterval;
      let timerInterval;

      const box = document.getElementById("box");
      const scoreDisplay = document.getElementById("score");
      const timeDisplay = document.getElementById("time");

      function randomPosition() {
        const gameArea = document.getElementById("gameArea");
        const maxX = gameArea.clientWidth - 50;
        const maxY = gameArea.clientHeight - 50;

        const x = Math.random() * maxX;
        const y = Math.random() * maxY;

        box.style.left = x + "px";
        box.style.top = y + "px";
      }

      box.addEventListener("click", function () {
        score++;
        scoreDisplay.textContent = score;
        randomPosition();
      });

      function startGame() {
        score = 0;
        time = 30;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = time;

        randomPosition();

        gameInterval = setInterval(randomPosition, 1000);

        timerInterval = setInterval(function () {
          time--;
          timeDisplay.textContent = time;

          if (time <= 0) {
            clearInterval(gameInterval);
            clearInterval(timerInterval);
            alert("Game selesai! Skor kamu: " + score);
          }
        }, 1000);
      }