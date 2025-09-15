// Seleciona o canvas e obtém o contexto 2D
const canvas = document.getElementById("meuCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true }); // otimiza leituras frequentes de pixels

// Variáveis de controle
let desenhando = false; // indica se o usuário está desenhando
let redeCarregada;      // vai armazenar a rede neural carregada

// Inicializa o fundo do canvas como branco
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Desativa suavização para manter pixel art (28x28)
ctx.imageSmoothingEnabled = false;

// Ao pressionar o mouse, começa a desenhar
canvas.addEventListener("mousedown", (e) => {
  desenhando = true;
  desenharPixel(e); // desenha imediatamente no ponto clicado
});

// Ao mover o mouse, desenha se estiver segurando
canvas.addEventListener("mousemove", (e) => {
  if (desenhando) desenharPixel(e);
});

// Ao soltar o mouse ou sair do canvas, para de desenhar
canvas.addEventListener("mouseup", () => (desenhando = false));
canvas.addEventListener("mouseleave", () => (desenhando = false));

function desenharPixel(e) {
  const rect = canvas.getBoundingClientRect(); // pega posição do canvas na tela

  // Calcula coordenadas no grid 28x28
  const x = Math.floor((e.clientX - rect.left) / (rect.width / 28));
  const y = Math.floor((e.clientY - rect.top) / (rect.height / 28));

  // Preenche o pixel preto no canvas
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, 2, 2); // tamanho do "pixel" desenhado

  // Se a rede neural estiver carregada, faz a previsão
  if (redeCarregada) {
    const pixels = obterPixels(); // converte canvas em array de pixels
    mostrarResultados(redeCarregada.forward(pixels)); // atualiza a interface
  }
}

function obterPixels() {
  const imgData = ctx.getImageData(0, 0, 28, 28); // lê pixels do canvas
  const data = imgData.data;
  const pixels = [];

  // Converte RGBA em valor entre 0 e 1 (preto = 1, branco = 0)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const grayscale = (r + g + b) / 3;       // média RGB
    pixels.push(1 - grayscale / 255);        // inverte: preto = 1
  }

  return pixels; // retorna array 784 elementos
}

function mostrarResultados(resultados) {
  const rows = document.querySelectorAll(".row");

  for (let i = 0; i < rows.length; ++i) {
    const percent = (resultados[i] * 100).toFixed(2); // valor em %

    // Atualiza texto percentual
    rows[i].querySelector(".percent").textContent = `${percent}%`;

    // Atualiza barra de progresso
    const bar = rows[i].querySelector(".fill");
    bar.style.width = `${percent}%`;
  }
}

async function loadFromFile(filePath = "modelo.json") {
  const response = await fetch(filePath); // busca JSON com pesos e bias
  const data = await response.json();

  // Cria rede com mesma arquitetura e taxa de aprendizado
  const rede = new NeuralNetwork(data.layersSizes, 0.001);

  // Copia pesos e bias do arquivo para a rede
  for (let i = 0; i < rede.layers.length; i++) {
    rede.layers[i].weights = data.layers[i].weights;
    rede.layers[i].biases = data.layers[i].biases;
  }

  return rede; // retorna rede pronta para usar
}

(async () => {
  redeCarregada = await loadFromFile(); // carrega a rede do modelo.json
  console.log("✅ Rede carregada.");
})();
