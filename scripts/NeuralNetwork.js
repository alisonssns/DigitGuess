// Retorna número aleatório entre -1 e 1
function rand() {
    return Math.random() * 2 - 1;
}

// ReLU (Rectified Linear Unit) — ativa apenas valores positivos
function Relu(inputs) {
    return inputs.map(x => Math.max(0, x));
}

// Derivada da ReLU — usada no backward
function dRelu(inputs) {
    return inputs.map(x => x > 0 ? 1 : 0);
}

// Softmax — converte vetor de valores em probabilidades (soma = 1)
function softMax(inputs) {
    const maxVal = Math.max(...inputs); // estabilidade numérica
    const expArr = inputs.map(x => Math.exp(x - maxVal));
    const sum = expArr.reduce((a, b) => a + b, 0);
    return expArr.map(v => v / sum);
}

// Cross-Entropy (CCE) — função de perda
function CCE(expected, output) {
    // adiciona 1e-15 para evitar log(0)
    return -expected.reduce((sum, val, i) => sum + val * Math.log(output[i] + 1e-15), 0);
}

// Derivada da Cross-Entropy — usado no backward da última camada
function dCCE(expected, output) {
    return output.map((o, i) => o - expected[i]);
}

class Layer {
    constructor(inputs, outputs, isLastLayer = false) {
        this.inputs = inputs;           // número de neurônios de entrada
        this.outputs = outputs;         // número de neurônios de saída
        this.isLastLayer = isLastLayer; // flag para camada final
        this.lastOutput = [];           // último output calculado
        this.lastInputs = [];           // últimos inputs usados
        this.gradsWeights = [];         // gradientes dos pesos
        this.gradBias = [];             // gradientes dos bias
        this.lastZ = new Array(this.outputs).fill(0); // soma ponderada antes da ativação
        this.weights = Array.from({ length: outputs }, () => Array.from({ length: inputs }, () => rand())); // inicializa pesos aleatórios
        this.bias = new Array(outputs).fill(0); // inicializa bias com zeros
    }

    forward(inputs) {
        this.lastInputs = inputs; // guarda inputs para o backward

        // Calcula soma ponderada (z = w*x + b)
        for (let i = 0; i < this.outputs; ++i) {
            let sum = this.bias[i];
            for (let j = 0; j < this.inputs; ++j) {
                sum += inputs[j] * this.weights[i][j];
            }
            this.lastZ[i] = sum;
        }

        // Aplica função de ativação
        this.lastOutput = this.isLastLayer ? softMax(this.lastZ) : Relu(this.lastZ);
        return this.lastOutput; // retorna saída da camada
    }

    backward(expected, deltaNext = null, wNext = null) {
        let delta = [];

        if (this.isLastLayer) {
            // Para a última camada, delta = derivada da CCE
            delta = dCCE(expected, this.lastOutput);
        } else {
            // Para camadas internas, delta = propagação do erro da camada seguinte
            for (let i = 0; i < this.lastOutput.length; ++i) {
                let sum = 0;
                for (let j = 0; j < deltaNext.length; ++j) {
                    sum += deltaNext[j] * wNext[j][i]; // soma ponderada pelo peso
                }
                // aplica derivada da ReLU
                delta.push(this.lastOutput[i] > 0 ? sum : 0);
            }
        }

        // Calcula gradientes dos pesos
        this.gradsWeights = delta.map(d =>
            this.lastInputs.map(input => d * input)
        );

        // Gradientes dos bias
        this.gradBias = [...delta];

        return delta; // retorna delta para próxima camada
    }

    update(learningRate) {
        for (let i = 0; i < this.weights.length; ++i) {
            for (let j = 0; j < this.weights[i].length; ++j) {
                this.weights[i][j] -= learningRate * this.gradsWeights[i][j]; // ajusta pesos
            }
        }

        for (let i = 0; i < this.bias.length; ++i) {
            this.bias[i] -= learningRate * this.gradBias[i]; // ajusta bias
        }
    }
}

class NeuralNetwork {
    constructor(layerNumbers, learningRate) {
        this.layerNumbers = layerNumbers; // array com número de neurônios por camada [entrada, escondida, saída]
        this.learningRate = learningRate;
        this.layers = [];
        this.initialize(); // inicializa camadas
    }

    // Inicializa camadas da rede
    initialize() {
        for (let i = 1; i < this.layerNumbers.length; ++i) {
            this.layers.push(new Layer(
                this.layerNumbers[i - 1],
                this.layerNumbers[i],
                i === this.layerNumbers.length - 1 // última camada
            ));
        }
    }

    // Propaga inputs por todas as camadas
    forward(inputs) {
        return this.layers.reduce((output, layer) => layer.forward(output), inputs);
    }

    // Treinamento (backpropagation)
    backward(expected) {
        // Começa pela última camada
        let delta = this.layers[this.layers.length - 1].backward(expected);

        // Propaga para as camadas anteriores
        for (let i = this.layers.length - 2; i >= 0; --i) {
            delta = this.layers[i].backward(null, delta, this.layers[i + 1].weights);
        }

        // Atualiza pesos e bias de todas as camadas
        this.layers.forEach(layer => layer.update(this.learningRate));
    }
}

// export default NeuralNetwork