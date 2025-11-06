## 🧠 Backend

# 🧠 Backend – Vector Field Simulator 3D

The backend provides a simple REST API that performs vector field evaluations and mathematical operations such as line integrals.

## 🔌 Endpoints

| Method | Route                        | Description                          |
|--------|------------------------------|--------------------------------------|
| POST   | `/api/vector-field/evaluate` | Evaluate a vector field at a point   |
| POST   | `/api/integration/line`      | Compute a line integral (placeholder) |

## 🛠️ Setup

```bash
cd backend
npm install
npm run start
```

The server starts on:
👉 http://localhost:3000

## 📁 Folder Structure

```
backend/
 ├── server.js             # Entry point
 ├── routes/
 │    ├── vectorField.js   # Field evaluation route
 │    └── integration.js   # Line integral route
 ├── utils/
 │    └── mathHelpers.js   # Mathematical utilities
 └── package.json
```

## 🧮 Dependencies

- express – Fast HTTP server
- mathjs – Symbolic and numeric math engine
- cors – Allow requests from frontend

## 🧠 To Do

- [ ] Add numerical line integral calculation
- [ ] Send real-time vector field evaluation to frontend
- [ ] Parse user input equations dynamically

## 👨‍💻 Author

Lucas Ferreira. 
Part of a Calculus II capstone project.

## 📜 License

MIT License