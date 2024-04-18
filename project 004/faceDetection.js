const apiKey = 'yeNQEHbUEPKELoOVdD7RxOxjBLfncXaDpFGY58M1WTpp26Pd7HilBpHO';
const apiUrl = 'https://api.pexels.com/v1/search?query=faces&per_page=50';

let currentImageIndex = 0;
let images = [];

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.ageGenderNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    console.log('Face-api models loaded.');
}

async function loadRandomImage() {
    if (images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length);
        currentImageIndex = randomIndex;
        displayAndDetectFace();
    } else {
        console.log("No images loaded");
    }
}

async function displayAndDetectFace() {
    if (images.length > 0 && currentImageIndex < images.length) {
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.onload = async () => {
            let canvas = document.getElementById('canvasOverlay');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'canvasOverlay';
                document.getElementById('image-gallery').appendChild(canvas);
            }
            const ctx = canvas.getContext('2d');
            canvas.width = imgElement.naturalWidth;
            canvas.height = imgElement.naturalHeight;
            ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
            console.log(`Image drawn on canvas: ${imgElement.src}`);

            await detectFace(canvas);
        };

        const imageUrl = images[currentImageIndex].src.large;
        imgElement.src = imageUrl;
    } else {
        console.log("No images available or index out of range");
    }
}

async function detectFace(canvas) {
    const detections = await faceapi.detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, { width: canvas.width, height: canvas.height });
    let textContent = 'Detected Faces:\n';

    for (const result of resizedDetections) {
        const { gender, age, expressions } = result;
        const maxExpression = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
        const randomUserData = await fetchRandomUserData();
        
        textContent += `Human 00${resizedDetections.indexOf(result) + 1}: Name - ${randomUserData.name.first} ${randomUserData.name.last}\n`;
        textContent += `           Gender - ${gender}\n`;
        textContent += `           Age - ${Math.round(age)}\n`;
        textContent += `           Expression - ${maxExpression[0]} (${(maxExpression[1] * 100).toFixed(2)}%)\n`;
        textContent += `           Number - ${randomUserData.phone}\n`;
        textContent += `           Address - ${randomUserData.location.street.number} ${randomUserData.location.street.name}\n`;
        textContent += `                     ${randomUserData.location.city}, ${randomUserData.location.country}\n`;
        textContent += `           Email - ${randomUserData.email}\n`;
        textContent += `           Username - ${randomUserData.login.username}\n`;
        textContent += `           Password - ${randomUserData.login.password}\n\n`;
    }

    document.querySelector('.text-container p').textContent = textContent;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
}

async function fetchRandomUserData() {
    try {
        const response = await fetch('https://randomuser.me/api/');
        const data = await response.json();
        return data.results[0];
    } catch (error) {
        console.error('Failed to fetch random user data:', error);
        return null;
    }
}

window.onload = async () => {
    await loadModels();
    fetch(apiUrl, {
        headers: { Authorization: apiKey }
    })
    .then(response => response.json())
    .then(data => {
        images = data.photos;
        console.log(`Total images fetched: ${images.length}`);
    })
    .catch(error => console.error('ERROR:', error));
};
