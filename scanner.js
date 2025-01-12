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
    // Processar OCR para texto
    Tesseract.recognize(
        imageData,
        'eng',
        {
            logger: info => console.log(info)
        }
    ).then(({ data: { text } }) => {
        extractTextInfo(text);
    }).catch(error => {
        console.error(error);
        alert("Erro ao processar a imagem para texto. Tente novamente.");
    });

    // Processar Código de Barras
    Quagga.decodeSingle({
        src: imageData,
        numOfWorkers: 0,
        inputStream: {
            size: 800
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader"]
        }
    }, result => {
        if (result && result.codeResult) {
            document.getElementById('codigo').value = result.codeResult.code;
        } else {
            console.error("Erro ao ler o código de barras.");
        }
    });
}

function extractTextInfo(text) {
    console.log("Texto extraído:", text);

    // Expressões regulares para buscar informações específicas
    const nomeRegex = /Nome\s*:\s*([^\n]+)/i;
    const apartamentoRegex = /Apartamento\s*:\s*([^\n]+)/i;

    // Extraindo e preenchendo os campos
    const nomeMatch = text.match(nomeRegex);
    const apartamentoMatch = text.match(apartamentoRegex);

    document.getElementById('nome').value = nomeMatch ? nomeMatch[1].trim() : '';
    document.getElementById('apartamento').value = apartamentoMatch ? apartamentoMatch[1].trim() : '';

    // Definir a quantidade como 1 automaticamente
    document.getElementById('quantidade').value = 1;
}
