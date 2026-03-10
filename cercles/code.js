import {
    readImg,
    writeCanvas,
} from 'https://cdn.jsdelivr.net/npm/image-js@latest/+esm';



const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
let stream = null;
let rafId = null;

// Paramètres ajustables
const GAUSSIAN_BLUR_SIZE = 5;
const CANNY_LOW = 50;
const CANNY_HIGH = 150;
const HOUGH_MIN_R = 10;
const HOUGH_MAX_R = 80;
const HOUGH_THRESHOLD = 100; // Votes min pour un cercle

// Noyaux Sobel [web:42]
const SOBEL_X = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
];
const SOBEL_Y = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
];

// Utilitaire: convolution 2D
function convolve(imageData, kernel) {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const dstData = new Uint8ClampedArray(src.length);
    const kSize = Math.sqrt(kernel.length);
    const kHalf = Math.floor(kSize / 2);

    for (let y = kHalf; y < h - kHalf; y++) {
        for (let x = kHalf; x < w - kHalf; x++) {
            let sumR = 0, sumG = 0, sumB = 0;
            for (let ky = 0; ky < kSize; ky++) {
                for (let kx = 0; kx < kSize; kx++) {
                    const px = ((y + ky - kHalf) * w + (x + kx - kHalf)) * 4;
                    const weight = kernel[ky * kSize + kx];
                    sumR += src[px] * weight;
                    sumG += src[px + 1] * weight;
                    sumB += src[px + 2] * weight;
                }
            }
            const i = (y * w + x) * 4;
            dstData[i] = Math.max(0, Math.min(255, sumR));
            dstData[i + 1] = Math.max(0, Math.min(255, sumG));
            dstData[i + 2] = Math.max(0, Math.min(255, sumB));
            dstData[i + 3] = 255;
        }
    }
    return new ImageData(dstData, w, h);
}

// Grayscale simple
function grayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
    return imageData;
}

// Gaussian blur approximé (moyenne simple pour perf mobile)
function gaussianBlur(imageData, size = GAUSSIAN_BLUR_SIZE) {
    // Horizontal
    let temp = convolve(imageData, Array(size).fill(1/size));
    // Vertical
    return convolve(temp, Array(size).fill(1/size).map((_, i) => Array(size).fill(1/size)));
}

// Gradient magnitude avec Sobel
function sobelMagnitude(grayImageData) {
    const sobelX = convolve(grayImageData, SOBEL_X.flat());
    const sobelY = convolve(grayImageData, SOBEL_Y.flat());
    const dataX = sobelX.data;
    const dataY = sobelY.data;
    const w = grayImageData.width;
    const h = grayImageData.height;
    const magData = new Uint8ClampedArray(grayImageData.data.length);
    for (let i = 0; i < dataX.length; i += 4) {
        const gx = dataX[i];
        const gy = dataY[i];
        const mag = Math.sqrt(gx * gx + gy * gy);
        magData[i] = magData[i + 1] = magData[i + 2] = mag;
        magData[i + 3] = 255;
    }
    return new ImageData(magData, w, h);
}

// Canny simplifié: seuillage double sur magnitude [web:41][web:47]
function cannyEdges(magImageData) {
    const data = magImageData.data;
    const w = magImageData.width;
    const h = magImageData.height;
    const edgeData = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
        const intensity = data[i];
        edgeData[i] = edgeData[i + 1] = edgeData[i + 2] = (intensity > CANNY_HIGH || (intensity > CANNY_LOW && intensity > 30)) ? 255 : 0;
        edgeData[i + 3] = 255;
    }
    return new ImageData(edgeData, w, h);
}

// Hough Circles Transform [web:43][code]
function houghCircles(edgeImageData) {
    const w = edgeImageData.width;
    const h = edgeImageData.height;
    const data = edgeImageData.data;
    const accSize = 360; // Theta steps
    const maxAcc = w * h * (HOUGH_MAX_R - HOUGH_MIN_R); // Approx
    const accumulator = new Map(); // (cx*w + cy, r) -> votes

    // Extraire edges (pixels blancs)
    const edges = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            if (data[i] > 200) edges.push({x, y});
        }
    }

    for (let {x, y} of edges) {
        for (let r = HOUGH_MIN_R; r <= HOUGH_MAX_R; r++) {
            for (let theta = 0; theta < accSize; theta++) {
                const rad = (theta / accSize) * Math.PI * 2;
                const cx = Math.round(x + r * Math.cos(rad));
                const cy = Math.round(y + r * Math.sin(rad));
                if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
                    const key = `${cx * w + cy}_${r}`;
                    const votes = (accumulator.get(key) || 0) + 1;
                    accumulator.set(key, votes);
                }
            }
        }
    }

    // Top cercles
    return Array.from(accumulator.entries())
        .filter(([_, votes]) => votes > HOUGH_THRESHOLD)
        .map(([key, votes]) => {
            const [cxcy, r] = key.split('_');
            return {cx: parseInt(cxcy) % w, cy: Math.floor(parseInt(cxcy) / w), r: parseInt(r), votes};
        })
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 10); // Top 10
}

// Dessiner cercles
function drawCircles(circles) {
    ctx.strokeStyle = '#00ff00'; // Vert centres
    ctx.fillStyle = '#00ff00';
    ctx.lineWidth = 3;
    circles.forEach(({cx, cy, r}) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Boucle principale
function processFrame() {
    if (video.videoWidth === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const gray = grayscale(imageData);
    const blurred = gaussianBlur(gray);
    const mag = sobelMagnitude(blurred);
    const edges = cannyEdges(mag);
    const circles = houghCircles(edges);

    ctx.putImageData(imageData, 0, 0); // Image originale
    drawCircles(circles);

    rafId = requestAnimationFrame(processFrame);
}

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: {ideal: 640}, height: {ideal: 480} }
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            processFrame();
        };
    } catch (err) {
        alert('Erreur caméra: ' + err.message);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (rafId) cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

startBtn.onclick = startCamera;
stopBtn.onclick = stopCamera;
