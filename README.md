# FunWordle – Server/Client Wordle Game

A multi-task Wordle implementation featuring a **.NET 9 Minimal API**, **Next.js web client**, and **CLI** mode.  
Task 2 extends the original Wordle logic into a full **client/server** model, ensuring:

- The client **never knows the answer** until the game is finished  
- All scoring and validation run on the **server**  
- Game state is stored on the server so players can **continue** their game  
- Secure, structured API design  
- Docker support for simplified start-up and deployment  

---

# 🚀 Features
- Wordle-style gameplay  
- Server-side scoring (correct, misplaced, missing)  
- Persisted game state (resume after refresh and closing the browser)  
- Timer enforced by server (client cannot tamper. Just visualized effect)  
- Answer revealed only after the game ends  (answer api returns 401 before the game is completed)
- Minimal API backend written in **.NET 9**  
- Next.js 16 frontend  
- Optional CLI version for Task 1 compatibility  
- Docker / docker-compose build for one-command startup  

📌 **Important Folder Structure Note**

 The Git repository root contains the `.git` folder, but the actual project source code
 (including `docker-compose.yml`) is located under the `FunWordle/` directory.

 Before running any commands, make sure to navigate into the project folder:

 ```bash
 cd FunWordle
 ```

# 🐳 Run the Project Using Docker (recommended)

## Prerequisites
- Docker Desktop  
- Linux container mode enabled

## Start everything

```bash
docker compose build
docker compose up
```

Services started:

- API → http://localhost:7216  
- Next.js → http://localhost:3000  

Next.js communicates with the API via Docker internal hostname **api:8080**.

---

## Rebuild after updates

```bash
docker compose build
docker compose up -d
```

Clean rebuild:

```bash
docker compose down --rmi local
docker compose build --no-cache
docker compose up -d
```

---

# 💻 Run Locally (Without Docker)

## 1. Run API

```bash
cd FunWordle.API
dotnet restore
dotnet run
```

## 2. Run Next.js

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE=http://localhost:7216
```

Then:

```bash
cd FunWordle.Web/funwordle-next
npm install
npm run dev
```

## 3. Run CLI Version

```bash
cd FunWordle
dotnet run
```

---

# 🧪 API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/api/config` | Get game configuration |
| POST | `/api/games` | Create new game |
| GET | `/api/games/{id}` | Get game state |
| POST | `/api/games/{id}` | Submit guess |
| GET | `/api/games/{id}/start` | start the game |
| GET | `/api/games/{id}/answer` | Returns answer **only after finished** |


---

# 🧠 Key Architecture Concepts
- Fully server-driven logic  
- Client never receives answer until completion  
- Game state persisted server-side  
- Secure validation & scoring  
- Clean project separation (Core, API, Web, CLI)  
- Docker-based reproducibility  

---

# 📚 How to Extend
- Add new logic in **FunWordle.Core**  
- Add API endpoints in **FunWordle.API**  
- Add UI components in **funwordle-next/app**  
- Rebuild Docker images for new features  

---

# 📝 Credits
Created as part of a one-week take-home project
