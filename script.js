const camera = document.getElementById("camera");
const status = document.getElementById("status");
const button = document.getElementById("iniciarCamera");
const camada = document.getElementById("camada");
const contexto = camada.getContext("2d");

let detectorPronto = false;
let detectando = false;

button.addEventListener("click", async () => {
    try {
        button.disabled = true;
        status.textContent = "Carregando detector facial...";

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights"
        );

        detectorPronto = true;

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        camera.srcObject = stream;
        await camera.play();

        status.textContent = "Câmera ativa. Procurando rostos...";
        detectarRostos();

    } catch (error) {
        console.error(error);
        status.textContent =
            "Não foi possível iniciar a câmera ou carregar o detector.";
        button.disabled = false;
    }
});

async function detectarRostos() {
    if (!detectorPronto || detectando) return;

    detectando = true;

    try {
        const resultado = await faceapi.detectAllFaces(
            camera,
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.5
            })
        );

        if (camera.videoWidth > 0 && camera.videoHeight > 0) {
            camada.width = camera.videoWidth;
            camada.height = camera.videoHeight;

            contexto.clearRect(0, 0, camada.width, camada.height);

            contexto.strokeStyle = "#00ff00";
            contexto.lineWidth = 3;

            for (const rosto of resultado) {
                const caixa = rosto.box;
                contexto.strokeRect(
                    caixa.x,
                    caixa.y,
                    caixa.width,
                    caixa.height
                );
            }
        }

        status.textContent = resultado.length > 0
            ? `Rostos detectados: ${resultado.length}`
            : "Nenhum rosto detectado.";
    } catch (error) {
        console.error(error);
        status.textContent = "Erro durante a detecção facial.";
    } finally {
        detectando = false;
        setTimeout(detectarRostos, 100);
    }
}