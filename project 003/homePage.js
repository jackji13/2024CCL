document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    for (let i = 0; i < 100; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        grid.appendChild(square);
    }
    
    grid.addEventListener('click', () => {
        window.location.href = 'p1.html'; // Navigate to p1.html when .grid is clicked
    });

    setInterval(() => {
        document.querySelectorAll('.square').forEach(square => {
            square.style.backgroundColor = getRandomColor();
        });
    }, 400);
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
