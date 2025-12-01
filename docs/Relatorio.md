# Simulador Interativo 3D de Campos Vetoriais

## 1. Introdução
### 1.1 Objetivo
Este projeto tem como objetivo desenvolver um simulador visual interativo de campos vetoriais em 3D, com funcionalidades educacionais e científicas aplicadas ao conteúdo de Cálculo 2.

### 1.2 Motivação
A visualização de campos vetoriais e suas integrais de linha tem aplicações diretas na física, engenharia e matemática. Ferramentas que permitem a manipulação dinâmica desses campos facilitam o entendimento de conceitos abstratos como divergente e rotacional.

## 2. Conceitos Matemáticos
- **Campo Vetorial**: Função que associa um vetor a cada ponto do espaço.
- **Linhas de Fluxo**: Curvas tangentes aos vetores do campo, representando a trajetória de partículas.
- **Integral de Linha**: Trabalho realizado pelo campo ao longo de uma curva.
- **Divergente e Rotacional**: Medidas de expansão/compressão e tendência de rotação do campo, respectivamente.

## 3. Arquitetura da Aplicação
A aplicação segue uma arquitetura cliente-servidor desacoplada:

### 3.1 Backend (Node.js)
- **Tecnologias**: Node.js, Express, mathjs.
- **Responsabilidades**:
    - Processamento simbólico e numérico de expressões matemáticas.
    - Cálculo de derivadas (divergente, rotacional) e integração numérica (RK4 para linhas de fluxo).
    - Validação de segurança de expressões (AST whitelist).
- **Endpoints Principais**:
    - `/api/vector-field/evaluate`: Avaliação de campo em pontos.
    - `/api/vector-field/div` & `/curl`: Cálculo de operadores diferenciais.
    - `/api/streamlines`: Geração de linhas de fluxo via Runge-Kutta 4.

### 3.2 Frontend (Three.js)
- **Tecnologias**: Vite, Three.js, HTML/CSS.
- **Responsabilidades**:

## 5. Conclusão
O simulador atende aos requisitos principais de visualização e análise de campos vetoriais. A arquitetura escolhida mostrou-se robusta para lidar com os cálculos matemáticos e a renderização 3D. As próximas etapas focarão na implementação das integrais de linha e refinamento da experiência do usuário.