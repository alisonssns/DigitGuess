import NeuralNetwork from './NeuralNetwork.js'; // importa a classe da rede neural
import fs from 'fs';                             // módulo Node.js para ler/escrever arquivos

function shuffleArray(array) {
    // Fisher–Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// Salva a rede neural em arquivo JSON
function saveToFile(network, filePath = 'modelo.json') {
    const data = {
        layersSizes: network.layerNumbers,        // arquitetura da rede
        layers: network.layers.map(layer => ({
            weights: layer.weights,               // pesos da camada
            bias: layer.bias                      // bias da camada
        }))
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8'); // grava arquivo
}

// Carrega a rede neural de arquivo JSON
function loadFromFile(filePath = 'modelo.json') {
    let rede;
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8')); // lê arquivo
        rede = new NeuralNetwork(data.layersSizes, 0.01);           // cria rede com mesma arquitetura
        // Copia pesos e bias do arquivo
        for (let i = 0; i < rede.layers.length; i++) {
            rede.layers[i].weights = data.layers[i].weights;
            rede.layers[i].bias = data.layers[i].bias;
        }
    } catch (err) {
        console.warn("Não foi possível carregar o arquivo: ", err);
        console.log("Criando nova rede:");
        rede = new NeuralNetwork([784, 104, 10], 0.01); // cria rede nova se arquivo não existir
    }
    console.log("Rede carregada de:", filePath);
    return rede;
}

const epochs = 10000; // número de épocas de treinamento
let rede = loadFromFile(); // carrega ou cria rede
const dataset = JSON.parse(fs.readFileSync('./dataset.json', 'utf8')); // lê dataset do arquivo

for (let epoch = 0; epoch < epochs; epoch++) {
    shuffleArray(dataset); // embaralha o dataset a cada época

    let acertos = 0; // contador de acertos na época

    // ====================== TREINA CADA EXEMPLO ======================
    for (let i = 0; i < dataset.length; i++) {
        const pred = rede.forward(dataset[i].X); // faz previsão
        const predClass = pred.indexOf(Math.max(...pred)); // classe prevista
        const trueClass = dataset[i].y.indexOf(Math.max(...dataset[i].y)); // classe correta

        if (predClass === trueClass) {
            acertos++; // incrementa acertos se previsão correta
        }

        rede.backward(dataset[i].y); // backpropagation
    }

    // Salva pesos atualizados
    saveToFile(rede);

    // Loga progresso
    console.log(`Época ${epoch + 1}: Porcentagem de acertos = ${(acertos / dataset.length * 100).toFixed(2)}%`);
}
