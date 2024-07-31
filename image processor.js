let imgElement;

function uploadImage() {
    document.getElementById('fileInput').click();
}

function displayImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgElement = new Image();
            imgElement.onload = function() {
                const originalCanvas = document.getElementById('originalCanvas');
                const ctx = originalCanvas.getContext('2d');
                originalCanvas.width = imgElement.width;
                originalCanvas.height = imgElement.height;
                ctx.drawImage(imgElement, 0, 0);
            };
            imgElement.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function confirmParameters() {
    if (imgElement) {
        processImage(imgElement);
    } else {
        document.getElementById('error-message').innerText = "Please upload an image first.";
    }
}

function processImage(img) {
    const blueMaxforFilter = parseInt(document.getElementById("blueMaxFilter").value);
    const blueMinNuclei = parseInt(document.getElementById("blueMinNuclei").value);

    const processedCanvas = document.getElementById('processedCanvas');
    const originalCanvas = document.getElementById('originalCanvas');

    processedCanvas.width = img.width;
    processedCanvas.height = img.height;

    const originalCtx = originalCanvas.getContext('2d');
    const processedCtx = processedCanvas.getContext('2d');

    const imageData = originalCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    let totalArea = 0;
    let cellArea = 0;
    let nucleiArea = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r <= blueMaxforFilter && g <= blueMaxforFilter && b <= blueMaxforFilter || (r >= 245 && g >= 245 && b >= 245)) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        } else {
            if (b >= blueMinNuclei) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 255;
                nucleiArea++;
            }
            cellArea++;
        }
        totalArea++;
    }

    processedCtx.putImageData(imageData, 0, 0);

    const cellPerArea = cellArea / totalArea;
    const cellToEmpty = nucleiArea / (totalArea-cellArea)
    document.getElementById('cell_per_area').innerText = `${cellPerArea.toFixed(5)}`;
    document.getElementById('cell_to_empty').innerText = `${cellToEmpty.toFixed(5)}`;

}
