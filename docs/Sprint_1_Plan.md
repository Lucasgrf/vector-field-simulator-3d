# 🚦 Sprint 1 – Setup & Primeira Visualização do Projeto

**Período da Sprint:** 7 dias  
**Objetivo Geral:** Renderizar algo funcional em 3D no navegador, validar comunicação entre frontend e backend, e começar a documentação do projeto no relatório.

---

## 🎯 Objetivos Específicos

1. Validar ambiente de desenvolvimento (Node.js e Vite).
2. Configurar renderização básica de cena 3D no frontend com Three.js.
3. Criar integração inicial entre frontend e backend com uma chamada API simples.
4. Documentar os primeiros resultados (prints + texto no relatório).
5. Versionar e organizar a estrutura inicial com Git.

---

## ✅ Tarefas da Sprint

### 1. 🧱 Setup Inicial
- [ X ] Verificar se o projeto builda corretamente em ambas as camadas:
  - Backend:
    ```bash
    cd backend
    npm install
    npm run start
    ```
  - Frontend:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
- [ X ] Confirmar que o backend está rodando em `http://localhost:3000`
- [ X ] Confirmar que o frontend abre em `http://localhost:5173`

---

### 2. 🎨 Visualização Inicial com Three.js

> **Meta:** Renderizar um objeto 3D simples (eixos ou cubo) com câmera, luz e grid.

- [ ] Implementar uma cena 3D básica no arquivo `frontend/src/canvas.js` com:
  - Um objeto simples (`THREE.BoxGeometry` ou `THREE.AxesHelper`)
  - Uma câmera perspective
  - Uma grid (`THREE.GridHelper`)
  - Um render loop (`renderer.render(scene, camera)`)

- Exemplo de código para os eixos:

  ```js
  import * as THREE from 'three';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const axesHelper = new THREE.AxesHelper(5);
  const gridHelper = new THREE.GridHelper(20, 20);
  scene.add(axesHelper);
  scene.add(gridHelper);

  camera.position.z = 10;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
  ```

✅ **Critério de aceitação:** A cena aparece corretamente no navegador.

---

### 3. 🔌 Comunicação Frontend ↔ Backend

> **Meta:** Criar um exemplo prático de chamada a API usando `fetch`, exibindo a resposta no console.

- [ ] Criar rota simples no backend em `routes/vectorField.js`:
  ```js
  router.post('/evaluate', (req, res) => {
    const result = [1, 0, -2];
    return res.json({ fieldValue: result, status: 'ok' });
  });
  ```

- [ ] Implementar no frontend (`src/main.js`):

  ```js
  fetch('http://localhost:3000/api/vector-field/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ point: [1, 2, 3] })
  })
    .then(r => r.json())
    .then(console.log);
  ```

- [ ] Adicionar botão na interface para rodar o teste da API:
  ```html
  <button id="test-api">Test API</button>
  ```

✅ **Critério de aceitação:** Clicar no botão e exibir `{ fieldValue: [1,0,-2], status: "ok" }` no console.

---

### 4. 📄 Documentação da Sprint

- [ ] Preencher no `docs/Relatorio.md`:
  - Introdução ao projeto
  - Arquitetura inicial
- [ ] Tirar screenshot da renderização 3D e adicionar em `docs/imagens/`
- [ ] Adicionar referência ao protótipo no relatório

---

## 🚧 Riscos e Considerações

- Ambiente de desenvolvimento pode variar (Windows, Linux, WSL). Certifique-se que as portas não estão em conflito.
- Cuidado com CORS — garantido com `app.use(cors())` no backend.
- Certifique-se que o JSON enviado/recebido está com `Content-Type` correto.

---

## 📆 Timeline Sugerida

| Dia | Tarefa |
|-----|--------|
| 1 | Clonar e validar execução do projeto |
| 2–3 | Criar cena 3D e renderizar objeto básico |
| 4 | Configurar rota backend e consumo no frontend |
| 5 | Testes + limpeza de código |
| 6 | Documentar sprint + gerar prints |
| 7 | Revisão + commit final da sprint |

---

## 🏁 Definição de Pronto (DoD - Definition of Done)

✅ Cena 3D renderizada e visível no navegador  
✅ Backend responde corretamente ao frontend  
✅ `Relatorio.md` atualizado com prints e explicação  
✅ Código versionado com commits organizados  
✅ README atualizado com informações reais do projeto  

---

**👨‍💻 Desenvolvedor:** *[Seu nome]*  
**📅 Data de início da Sprint:** *[preencher]*  
**📅 Data de entrega prevista:** *[preencher]*
