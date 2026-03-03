    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const ctx = overlay.getContext('2d');
    const betaSpan = document.getElementById('beta');
    const gammaSpan = document.getElementById('gamma');
    const alphaSpan = document.getElementById('alpha');
    const photoImg = document.getElementById('photo-result');
    const btnOrientation = document.getElementById('btn-orientation-permission');

    let lastShotTime = 0;
    const SHOT_COOLDOWN = 3000; // ms
    const HORIZON_TOLERANCE = 1; // degrés pour considérer l’inclinaison “nulle”

    // --- 1. Démarrage de la caméra frontale ---
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment' //'user' // caméra frontale
          },
          audio: false
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          resizeOverlay();
          drawReticle();
        };
      } catch (err) {
        console.error('Erreur caméra :', err);
        alert('Impossible d’accéder à la caméra : ' + err.message);
      }
    }

    function resizeOverlay() {
      overlay.width = video.videoWidth || overlay.clientWidth;
      overlay.height = video.videoHeight || overlay.clientHeight;
    }

    // --- 2. Dessiner la mire au centre ---
    function drawReticle() {
      const w = overlay.width;
      const h = overlay.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const size = Math.min(w, h) * 0.05;

      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.lineWidth = 2;

      // croix
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size, cy);
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx, cy + size);
      ctx.stroke();

      // cercle
      ctx.beginPath();
      ctx.arc(cx, cy, size * 1.4, 0, Math.PI * 2);
      ctx.stroke();

      requestAnimationFrame(drawReticle);
    }

    // --- 3. Gestion de l’orientation du téléphone ---
    function handleOrientation(event) {
      const alpha = event.alpha; // azimut approx.
      const beta = event.beta;   // inclinaison avant/arrière
      const gamma = event.gamma; // inclinaison gauche/droite

      if (alpha == null || beta == null || gamma == null) return;

      betaSpan.textContent = beta.toFixed(1);
      gammaSpan.textContent = gamma.toFixed(1);
      alphaSpan.textContent = alpha.toFixed(1);

      // On considère “horizontal” quand beta et gamma sont proches de 0
      const isHorizontal =
        Math.abs(beta - 90) <= HORIZON_TOLERANCE //&&
        //Math.abs(gamma) <= HORIZON_TOLERANCE;

      const now = Date.now();
      if (isHorizontal && now - lastShotTime > SHOT_COOLDOWN) {
        takePhoto();
        lastShotTime = now;
      }
    }

    function setupOrientation() {
      if (typeof DeviceOrientationEvent === 'undefined') return;

      // iOS 13+ nécessite une permission explicite
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        btnOrientation.style.display = 'block';
        btnOrientation.addEventListener('click', async () => {
          try {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, true);
              btnOrientation.style.display = 'none';
            } else {
              alert('Permission orientation refusée');
            }
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        // Android / navigateurs qui n’exigent pas de permission explicite
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    // --- 4. Prendre une photo quand le téléphone est horizontal ---
    function takePhoto() {
        if (!video.videoWidth || !video.videoHeight) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const cctx = canvas.getContext('2d');
        
        // miroir horizontal pour correspondre à la prévisualisation
        cctx.translate(canvas.width, 0);
        cctx.scale(-1, 1);
        
        cctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        cctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        cctx.lineWidth = 2;
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const size = 1; //Math.min(w, h) * 0.05;
        
        // croix
        cctx.beginPath();
        cctx.moveTo(cx - size, cy);
        cctx.lineTo(cx + size, cy);
        cctx.moveTo(cx, cy - size);
        cctx.lineTo(cx, cy + size);
        cctx.stroke();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      photoImg.src = dataUrl;
    }

    // --- Initialisation ---
    window.addEventListener('load', () => {
      startCamera();
      setupOrientation();
    });

    window.addEventListener('resize', resizeOverlay);
