function startScanner() {
    const video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
            video.setAttribute('playsinline', true); // necessário para iOS
            video.play();
            scanCode();
        });
}

function scanCode() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    function scan() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                processCode(code.data);
            } else {
                requestAnimationFrame(scan);
            }
        } else {
            requestAnimationFrame(scan);
        }
    }

    scan();
}

function processCode(data) {
    // Suponha que o código contenha os dados no formato JSON
    try {
        const parsedData = JSON.parse(data);
        document.getElementById('nome').value = parsedData.nome || '';
        document.getElementById('apartamento').value = parsedData.apartamento || '';
        document.getElementById('codigo').value = parsedData.codigo || '';
        document.getElementById('quantidade').value = parsedData.quantidade || '';
    } catch (error) {
        alert("Código inválido!");
    }
}
