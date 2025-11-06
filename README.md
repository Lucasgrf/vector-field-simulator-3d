# 📘 Vector Field Simulator 3D – Complete Documentation

This file combines the three main README files of the project:
- Root README (general overview)
- Backend README
- Frontend README

Use this document as a unified reference or split it later if needed.

---

## 🌐 Root – Project Overview

# 🌐 Vector Field Simulator 3D

An interactive 3D simulator of vector fields built for a Calculus II capstone project.
This project visualizes vector fields, particle flow, and supports basic calculations such as line integrals.

## 🚀 Tech Stack

| Layer     | Technology                 |
|-----------|----------------------------|
| Frontend  | Vite + JavaScript + Three.js |
| Backend   | Node.js + Express + mathjs |
| Docs      | Markdown (exported later to Word) |

## 📂 Project Structure

```
vector-field-simulator-3d/
 ├── backend/          # Node.js API for vector field math
 ├── frontend/         # 3D rendering UI built with Three.js
 ├── docs/             # Project report, derivations, images
 └── README.md         # Main project instructions
```

## 🛠️ How to Run

### 1. Start Backend (port 3000)
```bash
cd backend
npm install
npm run start
```

### 2. Start Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

Access the simulator at:
👉 http://localhost:5173

## 🔍 Features

✅ 3D vector field visualization  
✅ Simple particle movement simulation  
✅ Extensible API for math calculations  
✅ Educational focus for Calculus II concepts

## 📚 Documentation

The full mathematical report and derivations are inside the `docs/` folder:
- `Relatorio.md` – Main project report
- `Derivacao_Matematica.md` – Math derivation and concepts
- `imagens/` – Screenshots and rendered images

## ✅ Roadmap

- [ ] Add UI input for custom vector fields
- [ ] Implement curl and divergence visualizers
- [ ] Add numerical line integral solver in backend
- [ ] Create demo GIF for README

## 👨‍🏫 Educational Purpose

This tool demonstrates key topics from multivariable calculus to make abstract math concepts more intuitive and visual.

## 📝 License

MIT License  
Author: Lucas Ferreira