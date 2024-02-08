const startTime = Date.now();
function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    
    let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    let seconds = Math.floor((elapsedTime / 1000) % 60);
    let milliseconds = Math.floor(elapsedTime % 1000);
    
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    
    if (milliseconds < 100) {
        milliseconds = '0' + milliseconds;
    }
    if (milliseconds < 10) {
        milliseconds = '0' + milliseconds;
    }
    
    document.getElementById('timer').textContent = `${minutes}:${seconds}:${milliseconds}`;
    
    requestAnimationFrame(updateTimer);
}

updateTimer();
