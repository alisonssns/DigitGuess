const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

function imageToInputArray(imagePath) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(imagePath)
            .pipe(new PNG())
            .on('parsed', function () {
                const inputArray = [];

                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const idx = (this.width * y + x) << 2;
                        const r = this.data[idx];
                        const g = this.data[idx + 1];
                        const b = this.data[idx + 2];
                        const a = this.data[idx + 3];

                        const isBlack = r === 0 && g === 0 && b === 0 && a > 0;
                        inputArray.push(isBlack ? 1 : 0);
                    }
                }

                resolve(inputArray);
            })
            .on('error', reject);
    });
}

async function gerarDatasetJSON(start, size) {
    const dataset = [];
    for (let i = 0; i <= 9; ++i) {
        for (let j = start; j <= size; ++j) {
            const imagePath = `./dataset/${i}/${i}/${j}.png`;
            try {
                const X = await imageToInputArray(imagePath);
                const y = Array(10).fill(0);
                y[i] = 1;
                dataset.push({ X, y });
            } catch (err) {
                console.warn(`Ignorando erro em ${imagePath}: ${err.message}`);
            }
        }
    }

    fs.writeFileSync('dataset.json', JSON.stringify(dataset));
    console.log(`✅ Dataset salvo com ${dataset.length} amostras.`);
}

gerarDatasetJSON(0,10000);