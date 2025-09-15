const fs = require('fs');               // para ler/escrever arquivos
const { PNG } = require('pngjs');       // para ler arquivos PNG
const path = require('path');           // manipulação de caminhos de arquivos

function imageToInputArray(imagePath) {
    return new Promise((resolve, reject) => {
        // Lê o arquivo PNG
        fs.createReadStream(imagePath)
            .pipe(new PNG()) // transforma em objeto PNG
            .on('parsed', function () {
                const inputArray = [];

                // percorre todos os pixels
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const idx = (this.width * y + x) << 2; // posição no array RGBA
                        const r = this.data[idx];
                        const g = this.data[idx + 1];
                        const b = this.data[idx + 2];
                        const a = this.data[idx + 3];

                        // considera preto se RGB = 0 e alpha > 0
                        const isBlack = r === 0 && g === 0 && b === 0 && a > 0;

                        // adiciona 1 para preto, 0 para branco
                        inputArray.push(isBlack ? 1 : 0);
                    }
                }

                resolve(inputArray); // retorna array 0/1 de tamanho width*height
            })
            .on('error', reject); // rejeita promessa em caso de erro
    });
}

async function gerarDatasetJSON(start, size) {
    const dataset = [];

    // percorre cada dígito de 0 a 9
    for (let i = 0; i <= 9; ++i) {
        // percorre imagens do dígito
        for (let j = start; j <= size; ++j) {
            const imagePath = `./dataset/${i}/${i}/${j}.png`;
            try {
                // converte a imagem em array de pixels
                const X = await imageToInputArray(imagePath);

                // cria vetor one-hot para o dígito
                const y = Array(10).fill(0);
                y[i] = 1;

                // adiciona ao dataset
                dataset.push({ X, y });
            } catch (err) {
                // ignora arquivos inexistentes ou corrompidos
                console.warn(`Ignorando erro em ${imagePath}: ${err.message}`);
            }
        }
    }

    // salva dataset completo em JSON
    fs.writeFileSync('dataset.json', JSON.stringify(dataset));
    console.log(`✅ Dataset salvo com ${dataset.length} amostras.`);
}

gerarDatasetJSON(0, 10000); // gera dataset das imagens 0 a 10000 para cada dígito
