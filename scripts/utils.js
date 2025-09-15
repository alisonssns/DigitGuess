const canvas = document.getElementById("meuCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

let desenhando = false;
let redeCarregada;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.imageSmoothingEnabled = false;

canvas.addEventListener("mousedown", (e) => {
  desenhando = true;
  desenharPixel(e);
});

canvas.addEventListener("mousemove", (e) => {
  if (desenhando) desenharPixel(e);
});

canvas.addEventListener("mouseup", () => desenhando = false);
canvas.addEventListener("mouseleave", () => desenhando = false);

function desenharPixel(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (rect.width / 28));
  const y = Math.floor((e.clientY - rect.top) / (rect.height / 28));

  ctx.fillStyle = "black";
  ctx.fillRect(x, y, 2, 2);

  if (redeCarregada) {
    const pixels = obterPixels();
    mostrarResultados(redeCarregada.forward(pixels));
  }
}

function obterPixels() {
  const imgData = ctx.getImageData(0, 0, 28, 28);
  const data = imgData.data;
  const pixels = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const grayscale = (r + g + b) / 3;
    pixels.push(1 - grayscale / 255)
  }

  return pixels;
}

function mostrarResultados(resultados) {
  const rows = document.querySelectorAll(".row");
  for (let i = 0; i < rows.length; ++i) {
    rows[i].querySelector(".percent").textContent =
      `${(resultados[i] * 100).toFixed(2)}%`;
  }
}

async function loadFromFile(filePath = 'modelo.json') {
  const response = await fetch(filePath);
  const data = await response.json();

  const rede = new NeuralNetwork(data.layersSizes, 0.001);
  for (let i = 0; i < rede.layers.length; i++) {
    rede.layers[i].weights = data.layers[i].weights;
    rede.layers[i].biases = data.layers[i].biases;
  }
  return rede;
}

(async () => {
  redeCarregada = await loadFromFile();
  console.log("Rede carregada.");
})();
