# Guia do Projeto: Simulador de Campos Vetoriais 3D

Este documento serve para alinhar todos os integrantes do grupo sobre o que é o nosso projeto, como ele funciona e o que ainda precisamos entregar.

---

## 1. O que é esse projeto?
Basicamente, estamos construindo uma **"Calculadora Gráfica 3D"** para a disciplina de Cálculo 2.

Em vez de apenas calcularmos integrais e derivadas no papel, nosso programa permite que o usuário digite uma fórmula matemática (um **Campo Vetorial**) e veja instantaneamente como ele se comporta no espaço 3D.

**Exemplos do que ele simula:**
*   Vento soprando em torno de um obstáculo.
*   Campo gravitacional de um planeta.
*   Fluxo de água em um cano.

## 2. Como ele funciona? (Arquitetura Simples)
Dividimos o projeto em duas partes principais para facilitar o trabalho:

### 🧠 O Cérebro (Backend)
*   **Tecnologia:** Node.js
*   **Função:** É quem faz as contas pesadas.
*   Ele recebe a fórmula que o usuário digitou (ex: `F(x,y,z) = (x, y, z)`).
*   Calcula as derivadas (**Divergente** e **Rotacional**).
*   Calcula os caminhos das partículas (**Linhas de Fluxo**).

### 👀 Os Olhos (Frontend)
*   **Tecnologia:** Three.js (Javascript)
*   **Função:** É quem mostra tudo na tela.
*   Desenha milhares de setinhas coloridas.
*   Anima as bolinhas viajando pelas linhas de fluxo.
*   Mostra o menu para o usuário controlar tudo.

## 3. O que já está pronto?
Até agora, conseguimos implementar o "coração" do sistema:
*   ✅ **Visualização 3D:** Vemos as setas no espaço.
*   ✅ **Cores Inteligentes:** As setas mudam de cor se o campo está "explodindo" (divergente) ou "girando" (rotacional).
*   ✅ **Partículas:** Podemos soltar "poeira" no campo e ver para onde o vento a leva (Streamlines).
*   ✅ **Fórmulas Personalizadas:** O usuário pode digitar qualquer função matemática válida.

## 4. O que falta fazer? (Nossa Missão)
Para finalizar o projeto e tirar 10, precisamos focar no seguinte:

1.  **Integrais de Linha (Prioridade Máxima):**
    *   Precisamos calcular o "trabalho" realizado pelo campo ao longo de um caminho.
    *   *Exemplo:* Quanto de energia gasto para empurrar uma caixa contra esse vento?

2.  **Polimento e Apresentação:**
    *   Garantir que não tenha bugs (já corrigimos vários!).
    *   Deixar a interface bonita e fácil de usar.

## 5. Como eu rodo isso?
Se você quer testar no seu computador:

1.  Abra o terminal na pasta `backend` e digite: `npm start`
2.  Abra **outro** terminal na pasta `frontend` e digite: `npm run dev`
3.  Acesse o link que aparecer (geralmente `http://localhost:5173`).

> Para detalhes técnicos de instalação, veja o arquivo `docs/How_To_Run.md`.

---

## 6. Guia do Menu de Configurações

Aqui está o que cada botãozinho na tela faz:

### 🎛️ Configuração do Campo (Aba "Campo")
*   **Componentes P, Q, R:** É aqui que você define a "regra" do campo.
    *   *Exemplo:* Se você colocar `P=1`, `Q=0`, `R=0`, todas as setas apontarão para a direita (eixo X).
    *   *Dica:* Você pode usar funções como `sin(x)`, `cos(y)`, `exp(z)`, `sqrt(x^2+y^2)`.
*   **Domínio (X, Y, Z):** Define o tamanho da "caixa" onde o campo será desenhado.
    *   *Min/Max:* De onde começa até onde vai (ex: de -5 a +5).
*   **Resolução (Nx, Ny, Nz):** Quantas setas você quer desenhar em cada direção.
    *   *Cuidado:* Números muito altos podem travar o navegador! (Recomendado: entre 5 e 15).
*   **Escala e Raio:** Ajusta o tamanho e a grossura das setas para facilitar a visualização.

### 🌊 Linhas de Fluxo (Aba "Streamlines")
*   **Sementes (Seeds):** Quantos pontos iniciais vamos soltar no campo.
    *   Mais sementes = Mais linhas desenhadas.
*   **Passo (h):** A precisão do cálculo da linha.
    *   Passos menores são mais precisos, mas demoram mais para calcular.
*   **Máx Passos:** O comprimento máximo da linha. Se for muito curto, a linha para no meio do caminho.
*   **Vel. Desenho:** A velocidade da animação da linha sendo traçada.
*   **Direção:** Se a linha deve ser desenhada para frente (seguindo a seta), para trás (contra a seta) ou ambos.
*   **Modo de Cor:**
    *   *Única:* Todas as linhas azuis.
    *   *Velocidade:* Muda de cor (azul -> ciano -> amarelo) dependendo da velocidade do campo naquele ponto.

### 📐 Integral de Linha (Novo!)
Agora você pode calcular o trabalho realizado pelo campo ao longo de um caminho!
1.  **Defina a Curva:** Digite as equações paramétricas $x(t)$, $y(t)$ e $z(t)$.
    *   *Exemplo (Círculo):* $x=\cos(t)$, $y=\sin(t)$, $z=0$.
2.  **Intervalo t:** Escolha onde começa e onde termina o parâmetro $t$ (ex: 0 a 6.28).
3.  **Calcular:** O sistema vai:
    *   Desenhar a curva em **laranja** na tela.
    *   Mostrar o resultado numérico da integral $\int \vec{F} \cdot d\vec{r}$.


