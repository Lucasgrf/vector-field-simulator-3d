## 🎨 Frontend

# 🎨 Frontend – Vector Field Simulator 3D

This is the interactive 3D interface of the project.
It uses Vite for fast development and Three.js for real-time rendering.

## 🛠️ Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run at:
👉 http://localhost:5173

## 📁 Folder Structure

```
frontend/
 ├── src/
 │    ├── main.js                # Core entry point
 │    ├── canvas.js              # Handles 3D rendering
 │    ├── vectorFieldRenderer.js # (WIP) Renders vectors in 3D
 │    └── ui.js                  # UI components and logic
 ├── vite.config.js
 └── package.json
```

## 🚀 Features

✅ Renders 3D grid and camera  
✅ Ready for vector field rendering  
✅ Modular structure for expandability  
✅ Hot reload via Vite

## 📌 That’s next

- [ ] Add visual particles to display flow
- [ ] Add control panel UI for user-defined fields
- [ ] Connect to backend for dynamic math calculation

## 🔧 Tech In Use

- Three.js – WebGL-based 3D rendering
- Vite – Ultra-fast development server
- Vanilla JS – No frameworks required

## 👨‍💻 Author

Lucas Ferreira,
Part of a Calculus II capstone project.

## 📜 License

MIT License