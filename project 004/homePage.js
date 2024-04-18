const apiKey = 'yeNQEHbUEPKELoOVdD7RxOxjBLfncXaDpFGY58M1WTpp26Pd7HilBpHO';
const apiUrl = 'https://api.pexels.com/v1/search?query=huamen faces&per_page=20';

let currentImageIndex = 0;
let images = [];

async function fetchImages() {
    try {
        const response = await fetch(apiUrl, {
            headers: { Authorization: apiKey }
        });
        const data = await response.json();
        images = data.photos;
        startSlideshow();
    } catch (error) {
        console.error('Failed to fetch images:', error);
    }
}

function startSlideshow() {
    if (images.length > 0) {
        updateImageDisplay();
        setInterval(nextImage, 200);
    }
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateImageDisplay();
}

function updateImageDisplay() {
    const displayedImage = document.getElementById('displayedImage');
    displayedImage.src = images[currentImageIndex].src.large;
}

window.onload = fetchImages;