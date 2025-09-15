
function rand() {
    return Math.random() * 2 - 1;
}

function Relu(inputs) {
    return inputs.map(x => Math.max(0, x));
}

function dRelu(inputs) {
    return inputs.map(x => x > 0 ? 1 : 0);
}

function softMax(inputs) {
    const maxVal = Math.max(...inputs);
    const expArr = inputs.map(x => Math.exp(x - maxVal));
    const sum = expArr.reduce((a, b) => a + b, 0);
    return expArr.map(v => v / sum);
}

function CCE(expected, output) {
    return -expected.reduce((sum, val, i) => sum + val * Math.log(output[i] + 1e-15), 0);
}

function dCCE(expected, output) {
    return output.map((o, i) => o - expected[i]);
}

class Layer {
    constructor(inputs, outputs, isLastLayer = false) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.isLastLayer = isLastLayer;
        this.lastOutput = [];
        this.lastInputs = [];
        this.gradsWeights = [];
        this.gradBias = [];
        this.lastZ = new Array(this.outputs).fill(0);
        this.weights = Array.from({ length: outputs }, () => Array.from({ length: inputs }, () => rand()));
        this.bias = new Array(outputs).fill(0);
    }

    forward(inputs) {
        this.lastInputs = inputs;
        for (let i = 0; i < this.outputs; ++i) {
            let sum = this.bias[i];
            for (let j = 0; j < this.inputs; ++j) {
                sum += inputs[j] * this.weights[i][j];
            }
            this.lastZ[i] = sum;
        }
        this.lastOutput = this.isLastLayer ? softMax(this.lastZ) : Relu(this.lastZ);
        return this.lastOutput;
    }

    backward(expected, deltaNext = null, wNext = null) {
        let delta = [];
        if (this.isLastLayer) {
            delta = dCCE(expected, this.lastOutput);
        } else {
            for (let i = 0; i < this.lastOutput.length; ++i) {
                let sum = 0;
                for (let j = 0; j < deltaNext.length; ++j) {
                    sum += deltaNext[j] * wNext[j][i];
                }
                delta.push(this.lastOutput[i] > 0 ? sum : 0);
            }
        }

        this.gradsWeights = delta.map(d =>
            this.lastInputs.map(input => d * input)
        );

        this.gradBias = [...delta];

        return delta;
    }

    update(learningRate) {
        for (let i = 0; i < this.weights.length; ++i) {
            for (let j = 0; j < this.weights[i].length; ++j) {
                this.weights[i][j] -= learningRate * this.gradsWeights[i][j];
            }
        }
        for (let i = 0; i < this.bias.length; ++i) {
            this.bias[i] -= learningRate * this.gradBias[i];
        }
    }
}

class NeuralNetwork {
    constructor(layerNumbers, learningRate) {
        this.layerNumbers = layerNumbers;
        this.learningRate = learningRate;
        this.layers = [];
        this.initialize();
    }

    initialize() {
        for (let i = 1; i < this.layerNumbers.length; ++i) {
            this.layers.push(new Layer(
                this.layerNumbers[i - 1],
                this.layerNumbers[i],
                i === this.layerNumbers.length - 1
            ));
        }
    }

    forward(inputs) {
        return this.layers.reduce((output, layer) => layer.forward(output), inputs);
    }

    backward(expected) {
        let delta = this.layers[this.layers.length - 1].backward(expected);
        for (let i = this.layers.length - 2; i >= 0; --i) {
            delta = this.layers[i].backward(null, delta, this.layers[i + 1].weights);
        }
        this.layers.forEach(layer => layer.update(this.learningRate));
    }
}

// export default NeuralNetwork