# Simulador Interativo 3D de Campos Vetoriais

Um simulador interativo desenvolvido para a disciplina de Cálculo II, permitindo a visualização e análise de campos vetoriais em 3D. O projeto combina renderização gráfica avançada no navegador com cálculos matemáticos simbólicos no servidor.

## 🚀 Funcionalidades

O simulador oferece um conjunto robusto de ferramentas para explorar conceitos de cálculo vetorial:

*   **Visualização de Campos Vetoriais**: Renderização de vetores em 3D para funções parametrizadas $P(x,y,z)$, $Q(x,y,z)$ e $R(x,y,z)$.
*   **Controle de Domínio e Resolução**: Ajuste dinâmico dos limites dos eixos ($x, y, z$) e da densidade da malha de vetores.
*   **Mapeamento de Cores**:
    *   **Magnitude**: Cores baseadas na intensidade do campo $|F|$.
    *   **Divergente**: Visualização de fontes e sumidouros ($\nabla \cdot F$).
    *   **Rotacional**: Intensidade da rotação local ($|\nabla \times F|$).
*   **Linhas de Fluxo (Streamlines)**: Geração de trajetórias de partículas seguindo o campo, utilizando o método numérico Runge-Kutta de 4ª ordem (RK4).
*   **Integrais de Linha**: Cálculo numérico e visualização de integrais de linha $\int_C \mathbf{F} \cdot d\mathbf{r}$ ao longo de curvas paramétricas personalizadas.
*   **Interatividade**: Rotação, zoom e pan em 3D, além de possibilidade de adicionar "sementes" para streamlines clicando diretamente no canvas.

## 🛠️ Tecnologias Utilizadas

### Frontend
*   **Vite**: Build tool rápida para desenvolvimento moderno.
*   **Three.js**: Biblioteca principal para renderização 3D (WebGL).
*   **JavaScript (ES6+)**: Lógica de interface e manipulação de cena.
*   **CSS3**: Estilização moderna com variáveis e design responsivo (Glassmorphism).

### Backend
*   **Node.js**: Ambiente de execução JavaScript no servidor.
*   **Express**: Framework web para criar a API REST.
*   **Math.js**: Biblioteca poderosa para parsing de expressões matemáticas, derivadas simbólicas e operações vetoriais.

### Documentação
*   **LaTeX (AbnTeX2)**: Relatório acadêmico completo formatado nas normas ABNT.

## 📦 Estrutura do Projeto

```
vector-field-simulator-3d/
 ├── backend/          # API Node.js (Cálculos matemáticos)
 │    ├── utils/       # Helpers matemáticos (RK4, derivadas)
 │    └── server.js    # Entry point do servidor
 ├── frontend/         # Cliente Web (Visualização)
 │    ├── src/         # Código fonte (Three.js, UI, Styles)
 │    └── index.html   # Entry point da aplicação
 ├── docs/             # Documentação e Relatório
 │    ├── Relatorio.tex # Fonte LaTeX do relatório
 │    └── ref.bib       # Referências bibliográficas
 └── README.md         # Este arquivo
```

## 🔧 Como Executar

O projeto requer **Node.js** instalado. Siga os passos abaixo para iniciar ambos os servidores (Backend e Frontend).

### 1. Iniciar o Backend
O backend roda na porta `3000` e processa os cálculos pesados.

```bash
cd backend
npm install
npm start
```
*Aguarde a mensagem: "Backend rodando na porta 3000..."*

### 2. Iniciar o Frontend
O frontend roda na porta `5173` (padrão do Vite) e serve a interface.

Em um **novo terminal**:
```bash
cd frontend
npm install
npm run dev
```

### 3. Acessar
Abra seu navegador e acesse:
👉 **http://localhost:5173**

## 👥 Autores

Projeto desenvolvido pelos alunos:

*   **Lucas Rocha**
*   **Kaio Ribeiro**
*   **Izac Regis**
*   **Gabriel Garcia**
*   **Mikael Lopes**
*   **Felipe Araujo**
*   **Hudson Silva**

---
Desenvolvido com ❤️ e ☕ para Cálculo II.