let imgElement;
let sliderMode = false;

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

function updateParameters() {
    const blueMaxFilter = document.getElementById("blueMaxFilter").value;
    const blueMinNuclei = document.getElementById("blueMinNuclei").value;

    if (sliderMode) {
        document.getElementById("blueMaxFilterValue").innerText = blueMaxFilter;
        document.getElementById("blueMinNucleiValue").innerText = blueMinNuclei;
    }

    if (imgElement) {
        processImage();
    }
}

function processImage() {
    const blueMaxforFilter = parseInt(document.getElementById("blueMaxFilter").value);
    const blueMinNuclei = parseInt(document.getElementById("blueMinNuclei").value);

    const processedCanvas = document.getElementById('processedCanvas');
    const originalCanvas = document.getElementById('originalCanvas');

    processedCanvas.width = imgElement.width;
    processedCanvas.height = imgElement.height;

    const originalCtx = originalCanvas.getContext('2d');
    const processedCtx = processedCanvas.getContext('2d');

    const imageData = originalCtx.getImageData(0, 0, imgElement.width, imgElement.height);
    const data = imageData.data;
    let totalArea = 0;
    let cellArea = 0;
    let nucleiArea = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r <= blueMaxforFilter && g <= blueMaxforFilter && b <= blueMaxforFilter) {
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

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<p>Cell Per Area: ${cellPerArea.toFixed(4)}</p>`;
}

function toggleMode() {
    const parameterEntryDiv = document.getElementById('parameterEntry');
    const toggleButton = document.getElementById('toggleModeButton');
    if (sliderMode) {
        parameterEntryDiv.innerHTML = `
            <label for="blueMaxFilter">Filter out regions with b values below: </label>
            <input type="number" id="blueMaxFilter" step="1" value="40">
            <br>
            <label for="blueMinNuclei">Nuclei regions have b values above: </label>
            <input type="number" id="blueMinNuclei" step="1" value="100">
        `;
        toggleButton.innerText = "Switch to Slider Mode";
    } else {
        parameterEntryDiv.innerHTML = `
            <label for="blueMaxFilter">Filter out regions with b values below: </label>
            <input type="range" id="blueMaxFilter" min="0" max="255" value="40" oninput="updateParameters()">
            <span id="blueMaxFilterValue">40</span>
            <br>
            <label for="blueMinNuclei">Nuclei regions have b values above: </label>
            <input type="range" id="blueMinNuclei" min="0" max="255" value="100" oninput="updateParameters()">
            <span id="blueMinNucleiValue">100</span>
        `;
        toggleButton.innerText = "Switch to Box Entry Mode";
    }
    sliderMode = !sliderMode;
}

