const apiKey = 'yeNQEHbUEPKELoOVdD7RxOxjBLfncXaDpFGY58M1WTpp26Pd7HilBpHO';
const apiUrl = 'https://api.pexels.com/v1/search?query=faces&per_page=50';

let currentImageIndex = 0;
let images = [];


// async function loadModels() {
//     await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
//     await faceapi.nets.ageGenderNet.loadFromUri('/models');
//     await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
//     await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
//     await faceapi.nets.faceExpressionNet.loadFromUri('/models');
//     console.log('Face-api models loaded.');

//     const pElement = document.querySelector('.text-container p');
//     animateText(pElement, 'System override: Face detection protocols online\nImage data streams decrypted\nInitiate doxxing sequence\n \nStart doxxing!');
// }


async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.ageGenderNet.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('https://jackji13.github.io/2024CCL/project%20004/models');
    console.log('Face-api models loaded.');

    const pElement = document.querySelector('.text-container p');
    animateText(pElement, 'System override: Face detection protocols online\nImage data streams decrypted\nInitiate doxxing sequence\n \nStart doxxing!');
}

let recentlyUsedIndices = [];  // Array to hold the indices of recently shown images

async function loadRandomImage() {
    if (images.length > 5) {  // Ensure there are enough images to avoid repetition
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * images.length);
        } while (recentlyUsedIndices.includes(randomIndex));  // Ensure the new index hasn't been used recently
        
        // Update the list of recently used indices
        recentlyUsedIndices.push(randomIndex);
        if (recentlyUsedIndices.length > 5) {  // Keep the list limited to the last 5 indices
            recentlyUsedIndices.shift();  // Remove the oldest index to maintain the limit
        }
        
        currentImageIndex = randomIndex;
        displayAndDetectFace();
    } else {
        console.log("Not enough images to avoid repetition or no images loaded");
    }
}


async function displayAndDetectFace() {
    // Clear the text container at the start of each image display
    const pElement = document.querySelector('.text-container p');
    const downloadBtn = document.querySelector('.downloadBtn');
    
    pElement.innerHTML = '';  // Reset the content
    downloadBtn.style.display = 'none'; // Ensure the button is hidden each time

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
            downloadBtn.style.display = 'block'; // Show the button after an image is processed
        };

        const imageUrl = images[currentImageIndex].src.large;
        imgElement.src = imageUrl;
    } else {
        console.log("No images available or index out of range");
    }
}



function getRandomChar() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()+=;:<>?/|";
    return chars[Math.floor(Math.random() * chars.length)];
}

function animateText(pElement, targetText) {
    const lines = targetText.split('\n'); // Split the full text into lines
    pElement.innerHTML = ''; // Clear existing content

    lines.forEach((line) => {
        if (line.trim() === '') {
            pElement.appendChild(document.createElement('br')); // Preserve line breaks for empty lines
        } else {
            const span = document.createElement('span'); // Create a span for each line
            span.textContent = line; // Set text content to the line
            pElement.appendChild(span); // Append the span to the paragraph element
            pElement.appendChild(document.createElement('br')); // Add a line break after each span

            const duration = 1000; // Total duration of the animation in milliseconds
            const frameRate = 40; // Frames per second
            const totalFrames = duration / (1000 / frameRate);
            let frame = 0;

            function frameUpdate() {
                const progress = frame / totalFrames;
                const numCorrectChars = Math.floor(progress * line.length);
                let displayText = "";

                for (let i = 0; i < line.length; i++) {
                    if (i < numCorrectChars) {
                        displayText += line[i];
                    } else if (line[i] === ' ') {
                        displayText += ' ';
                    } else {
                        displayText += getRandomChar();
                    }
                }

                span.textContent = displayText; // Update the text of the span
                frame++;

                if (frame <= totalFrames) {
                    setTimeout(frameUpdate, 1000 / frameRate);
                } else {
                    span.textContent = line; // Ensure final text is correct after animation
                }
            }

            frameUpdate(); // Start the animation for each line immediately
        }
    });
}


async function detectFace(canvas) {
    const detections = await faceapi.detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, { width: canvas.width, height: canvas.height });
    let textContent = `Detected Faces: ${resizedDetections.length}\n`;  // Include the count of detected faces

    for (const result of resizedDetections) {
        const { gender, age, expressions } = result;
        const maxExpression = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
        const randomUserData = await fetchRandomUserData();

        textContent += `Human 0${resizedDetections.indexOf(result) + 1}: Name       - ${randomUserData.name.first} ${randomUserData.name.last}\n`;
        textContent += `          Gender     - ${gender}\n`;
        textContent += `          Age        - ${Math.round(age)}\n`;
        textContent += `          Expression - ${maxExpression[0]} (${(maxExpression[1] * 100).toFixed(2)}%)\n`;
        textContent += `          Number     - ${randomUserData.phone}\n`;
        textContent += `          Address    - ${randomUserData.location.street.number} ${randomUserData.location.street.name}\n`;
        textContent += `                       ${randomUserData.location.city}, ${randomUserData.location.country}\n`;
        textContent += `          Email      - ${randomUserData.email}\n`;
        textContent += `          Username   - ${randomUserData.login.username}\n`;
        textContent += `          Password   - ${randomUserData.login.password}\n\n`;
    }

    const pElement = document.querySelector('.text-container p');
    animateText(pElement, textContent);

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
}

document.getElementById('downloadBtn').addEventListener('click', function() {
    const textContainer = document.querySelector('.text-container p');
    const textToDownload = textContainer.innerText; // Use innerText to preserve line breaks

    // Create a Blob with the text content
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "doxxing-info.txt"; // Name of the file to be downloaded
    document.body.appendChild(link);
    link.click();

    // Clean up the URL and remove the temporary link
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
});




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