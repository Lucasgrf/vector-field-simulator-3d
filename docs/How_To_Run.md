# Como Executar o Projeto

Este guia descreve como configurar e rodar o **Simulador Interativo 3D de Campos Vetoriais**. O projeto é dividido em duas partes: **Backend** (Node.js) e **Frontend** (Three.js/Vite).

## Pré-requisitos

- **Node.js** (versão 18 ou superior recomendada)
- **NPM** (geralmente instalado junto com o Node.js)

## Instalação

Antes de rodar, é necessário instalar as dependências de cada módulo.

### 1. Backend
Abra um terminal na pasta `backend` e execute:
```bash
cd backend
npm install
```

### 2. Frontend
Abra um novo terminal na pasta `frontend` e execute:
```bash
cd frontend
npm install
```

---

## Executando a Aplicação

Você precisará de **dois terminais** rodando simultaneamente (um para o backend e outro para o frontend).

### 1. Iniciar o Backend
No terminal do `backend`:
```bash
npm start
```
*O servidor iniciará na porta 3000 (http://localhost:3000).*
> **Nota:** O comando `npm start` executa automaticamente os testes unitários antes de subir o servidor.

### 2. Iniciar o Frontend
No terminal do `frontend`:
```bash
npm run dev
```
*O Vite iniciará o servidor de desenvolvimento, geralmente em http://localhost:5173.*

---

## Acessando o Simulador

Abra seu navegador e acesse o link fornecido pelo terminal do Frontend (ex: `http://localhost:5173`).

- O frontend se comunicará automaticamente com o backend via proxy configurado (`/api` -> `http://localhost:3000`).
- Se o backend não estiver rodando, você verá erros de conexão ao tentar renderizar o campo.

## Testes

Para rodar apenas os testes do backend sem iniciar o servidor:
```bash
cd backend
npm test
```
