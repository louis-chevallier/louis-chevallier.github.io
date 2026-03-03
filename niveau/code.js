// --- Caméra frontale ---
async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: "user"  // caméra frontale
            },
            audio: false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById("video");
        video.srcObject = stream;
    } catch (err) {
        console.error("Erreur accès caméra :", err);
        alert("Impossible d'accéder à la caméra : " + err.message);
    }
}

// --- Orientation de l'appareil ---
function startOrientation() {
    const alphaSpan = document.getElementById("alpha");
    const betaSpan = document.getElementById("beta");
    const gammaSpan = document.getElementById("gamma");

    function handleOrientation(event) {
        const alpha = event.alpha; // azimut (rotation autour de l'axe z)
        const beta  = event.beta;  // inclinaison avant/arrière (axe x)
        const gamma = event.gamma; // inclinaison gauche/droite (axe y)

        alphaSpan.textContent = alpha !== null ? alpha.toFixed(1) : "N/A";
        betaSpan.textContent  = beta  !== null ? beta.toFixed(1)  : "N/A";
        gammaSpan.textContent = gamma !== null ? gamma.toFixed(1) : "N/A";
    }

    if (window.DeviceOrientationEvent) {
        // Sur iOS, il faut parfois demander l’autorisation explicite
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === "granted") {
                        window.addEventListener("deviceorientation", handleOrientation, true);
                    } else {
                        alert("Permission d'orientation refusée.");
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener("deviceorientation", handleOrientation, true);
        }
    } else {
        alert("DeviceOrientation non supporté sur cet appareil.");
    }
}

// Lancement une fois la page chargée
window.addEventListener("load", () => {
    startCamera();
    startOrientation();
});

