function startScanner() {
    const video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
            video.setAttribute('playsinline', true); // necessário para iOS
            video.play();
        });
}

function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    processImage(imageData);
}

function processImage(imageData) {
    Tesseract.recognize(
        imageData,
        'pt-br', // Idioma de reconhecimento
        {
            logger: info => console.log(info) // Opcional, para debug
        }
    ).then(({ data: { text } }) => {
        extractInfo(text);
    }).catch(error => {
        console.error(error);
        alert("Erro ao processar a imagem. Tente novamente.");
    });
}

function extractInfo(text) {
    console.log("Texto extraído:", text);

    // Expressões regulares para buscar informações específicas
    const nomeRegex = /Nome:\s*([^\n]+)/i;
    const apartamentoRegex = /Apartamento:\s*([^\n]+)/i;
    const blocoRegex = /Bloco:\s*([^\n]+)/i;
    const codigoRegex = /Código de Barras:\s*([^\n]+)/i;

    // Extraindo e preenchendo os campos
    const nomeMatch = text.match(nomeRegex);
    const apartamentoMatch = text.match(apartamentoRegex);
    const blocoMatch = text.match(blocoRegex);
    const codigoMatch = text.match(codigoRegex);

    document.getElementById('nome').value = nomeMatch ? nomeMatch[1].trim() : '';
    document.getElementById('apartamento').value = apartamentoMatch ? apartamentoMatch[1].trim() : '';
    document.getElementById('bloco').value = blocoMatch ? blocoMatch[1].trim() : '';
    document.getElementById('codigo').value = codigoMatch ? codigoMatch[1].trim() : '';
}