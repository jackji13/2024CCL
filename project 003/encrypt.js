document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('textToImageBtn').addEventListener('click', convertTextToImage);
    document.getElementById('downloadImageBtn').addEventListener('click', downloadCanvasAsPNG);
    document.getElementById('imageInput').addEventListener('change', function(event) {
        uploadedFile = event.target.files[0];
    });
    document.getElementById('decodeImageBtn').addEventListener('click', function() {
        if (uploadedFile) {
            decodeImageToText(uploadedFile);
        } else {
            alert('Please upload an image first');
        }
    });
});

let uploadedFile = null;
let offScreenCanvas = document.createElement('canvas');
let offScreenCtx = offScreenCanvas.getContext('2d');

function convertTextToImage() {
    const text = document.getElementById('textInput').value;
    const mapping = generateColorMapping();

    const cols = 30;
    const rows = 30;
    const scale = 50;

    const randomValue = Math.floor(Math.random() * 256);
    const grayscale = `rgb(${randomValue}, ${randomValue}, ${randomValue})`;

    offScreenCanvas.width = cols;
    offScreenCanvas.height = Math.ceil((text.length + 1) / cols);;

    offScreenCtx.fillStyle = 'rgb(255, 255, 255)';
    offScreenCtx.fillRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);

    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = cols * scale;
    canvas.height = rows * scale;

    offScreenCtx.fillStyle = grayscale;
    offScreenCtx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = grayscale;
    ctx.fillRect(0, 0, scale, scale);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const color = mapping[char] || 'rgb(255, 255, 255)';
        let [r, g, b] = color.match(/\d+/g).map(Number);

        r = (r + randomValue) % 256;
        g = (g + randomValue) % 256;
        b = (b + randomValue) % 256;

        const modifiedColor = `rgb(${r}, ${g}, ${b})`;

        offScreenCtx.fillStyle = modifiedColor;
        offScreenCtx.fillRect((i + 1) % cols, Math.floor((i + 1) / cols), 1, 1); // +1 to account for the grayscale pixel

        ctx.fillStyle = modifiedColor;
        const x = ((i + 1) % cols) * scale;
        const y = Math.floor((i + 1) / cols) * scale;
        ctx.fillRect(x, y, scale, scale);
    }
}

function generateColorMapping() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.!@#$%^&*()<>_+?/-=\'";:[]{}\\|`~';
    const mapping = {};
    
    let redStep = 137, greenStep = 113, blueStep = 157;
    let red = 0, green = 0, blue = 0;

    for (let i = 0; i < chars.length; i++) {
        red = (red + redStep) % 256;
        green = (green + greenStep) % 256;
        blue = (blue + blueStep) % 256;

        mapping[chars[i]] = `rgb(${red}, ${green}, ${blue})`;
    }
    
    return mapping;
}

function downloadCanvasAsPNG() {
    const filename = 'ENCRYPTED.png';
    const link = document.createElement('a');
    link.style.display = 'none';
    link.download = filename;
    link.href = offScreenCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function decodeImageToText(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const cols = 30;
            const rows = 30;
            const scale = 50;

            const canvas = document.getElementById('imageCanvas');
            const ctx = canvas.getContext('2d');
            const mapping = generateColorMapping();

            canvas.width = cols * scale;
            canvas.height = rows * scale;
            ctx.imageSmoothingEnabled = false;

            const offScreenCanvas = document.createElement('canvas');
            offScreenCanvas.width = img.width;
            offScreenCanvas.height = img.height;
            const offScreenCtx = offScreenCanvas.getContext('2d');
            offScreenCtx.drawImage(img, 0, 0);

            const imageData = offScreenCtx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            const grayscaleValue = data[0];

            let text = '';

            
            for (let i = 4; i < data.length; i += 4) {

                let r = (256 + data[i] - grayscaleValue) % 256;
                let g = (256 + data[i + 1] - grayscaleValue) % 256;
                let b = (256 + data[i + 2] - grayscaleValue) % 256;

                const adjustedRgb = `rgb(${r}, ${g}, ${b})`;
                const char = findCharFromColor(adjustedRgb, mapping);

                if (char) {
                    text += char;
                }

                if (mapping[char]) {
                    ctx.fillStyle = adjustedRgb;
                    const x = ((i / 4) % img.width) * scale;
                    const y = Math.floor((i / 4) / img.width) * scale;
                    ctx.fillRect(x, y, scale, scale);
                }
            }

            document.getElementById('decodedText').value = text;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function findCharFromColor(rgb, mapping) {
    const character = Object.keys(mapping).find(key => mapping[key] === rgb);
    return character || ' ';
}


