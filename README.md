# DigitGuess

Este é um projeto de **rede neural do zero**, feita totalmente em **HTML, CSS e JavaScript puro**, sem uso de bibliotecas ou frameworks de machine learning.  
O objetivo é **estudar redes neurais construindo uma totalmente manual**, capaz de reconhecer dígitos escritos à mão.

---

## Demonstração

![vid](https://github.com/user-attachments/assets/994e0a15-1ff4-4502-825f-1d92b458da6e)

---

## Funcionalidades

- **Desenhar dígitos** no canvas para testar a rede.  
- **Rede Neural Manual** implementada em JavaScript.  
- **Treinamento supervisionado** com dataset baseado no MNIST.  
- **Carregamento e salvamento** do modelo treinado (`modelo.json`).  
- **Visualização em tempo real** das probabilidades para cada dígito (0–9).  

---

## Estrutura do Projeto

- `index.html` → Interface para desenhar e testar.  
- `styles/style.css` → Estilos básicos.  
- `scripts/NeuralNetwork.js` → Implementação da rede neural.  
- `scripts/utils.js` → Funções auxiliares (canvas, carregamento da rede).  
- `datasetCreator.js` → Script para gerar `dataset.json` a partir das imagens.  
- `learn.js` → Script de treinamento da rede (Node.js).  
- `modelo.json` → Arquivo de pesos da rede (salvo durante o treino).  

---

## Dataset

<img width="1212" height="750" alt="image" src="https://github.com/user-attachments/assets/3d1bf803-a6e1-4206-8959-9c862008ee32" />

Para rodar corretamente, baixe o dataset aqui:

[Dataset no Google Drive](https://drive.google.com/file/d/1wb-8vF9h7MS1aH42LIOW962UpfPxgFpf/view?usp=sharing)

Extraia os arquivos na pasta `./dataset/` conforme a estrutura usada em `datasetCreator.js`.

---

## ⚙Como Rodar

### 1. Clonar o projeto
```bash
git clone https://github.com/seu-usuario/digitGuess.git
cd digitGuess
```

### 2. Preparar o dataset
- Baixe o dataset.  
- Extraia para `./dataset/`.  
- Rode o script para gerar `dataset.json`:  
```bash
node datasetCreator.js
```

### 3. Treinar a rede
> Para treinar, **descomente a última linha do arquivo `NeuralNetwork.js`** (ativando o modo de treino).

Depois execute:
```bash
node learn.js
```

Isso irá treinar a rede e salvar os pesos no arquivo `modelo.json`.

### 4. Rodar no navegador
- Abra `index.html` no navegador.  
- Desenhe um número no canvas.  
- A rede carregará `modelo.json` e exibirá a probabilidade de cada dígito.  

---

## Exemplo de Saída

Durante o treino no console:

```
Época 1: Porcentagem de acertos = 82.45%
Época 2: Porcentagem de acertos = 85.13%
...
```

Na interface web, os resultados aparecem assim:

```
0 → 0.05%
1 → 0.12%
2 → 99.72%   
...
```

---

## Aprendizados

- Construir uma rede neural **na mão** é ótimo para entender o funcionamento interno:  
  - Forward propagation  
  - Backpropagation  
  - Ajuste de pesos e bias  
- Diferença entre **rede carregada** e **rede em treino**.  
- Importância de um bom **dataset balanceado**.  

---

## Próximos Passos

- Melhorar performance do treino.  
- Criar interface mais amigável.  
- Comparar resultados com bibliotecas conhecidas (TensorFlow.js).  

---

## Autor

Projeto desenvolvido por **Alisson Luis Cordeiro de Arruda** com fins de estudo em Inteligência Artificial.  
