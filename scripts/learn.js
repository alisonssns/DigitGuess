import NeuralNetwork from './NeuralNetwork.js'
import fs from 'fs';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Funções de salvar/carregar
function saveToFile(network, filePath = 'modelo.json') {
    const data = {
        layersSizes: network.layerNumbers,
        layers: network.layers.map(layer => ({
            weights: layer.weights,
            bias: layer.bias
        }))
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadFromFile(filePath = 'modelo.json') {
    let rede;
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        rede = new NeuralNetwork(data.layersSizes, 0.01);
        for (let i = 0; i < rede.layers.length; i++) {
            rede.layers[i].weights = data.layers[i].weights;
            rede.layers[i].bias = data.layers[i].bias;
        }
    } catch (err) {
        console.warn("Não foi possível carregar o arquivo: ", err);
        console.log("Criando nova rede:");
        rede = new NeuralNetwork([784, 104, 10], 0.01);
    }
    console.log("Rede carregada de:", filePath);
    return rede;
}

// Treinamento
const epochs = 10000;
let rede = loadFromFile();
const dataset = JSON.parse(fs.readFileSync('./dataset.json', 'utf8'));

for (let epoch = 0; epoch < epochs; epoch++) {
    shuffleArray(dataset);

    let acertos = 0;
    for (let i = 0; i < dataset.length; i++) {
        const pred = rede.forward(dataset[i].X);
        const predClass = pred.indexOf(Math.max(...pred));
        const trueClass = dataset[i].y.indexOf(Math.max(...dataset[i].y));

        if (predClass === trueClass) {
            acertos++;
        }

        rede.backward(dataset[i].y);
    }

    saveToFile(rede);

    console.log(`Época ${epoch + 1}: Porcentagem de acertos = ${(acertos / dataset.length * 100).toFixed(2)}%`);
}