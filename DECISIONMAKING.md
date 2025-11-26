# Decision Making & Architecture Considerations

This document summarizes the key architectural decisions, trade-offs, and design reasoning behind the **FunWordle** server/client Wordle implementation. The goal is to clearly articulate *why* each choice was made, especially under time constraints and ambiguous requirements.

---

## 1. Choosing Languages and Frameworks

### Backend – .NET 9 Minimal API
I selected **.NET Minimal API** because:

- It provides a **lightweight HTTP API surface**, perfect for a small project like Wordle.
- Startup template is minimal, with nearly zero boilerplate.
- It offers excellent **performance** and concise routing syntax.
- I have extensive experience in **C# / .NET**, which reduces development time.
- The backend requirements (guess validation, scoring, game lifecycle management) are small in scope and align well with Minimal API.

This allowed me to focus on game logic and correctness instead of framework overhead.

### Frontend – Next.js
I chose **Next.js** for the client UI because:

- It fits the requirement of a **single-page, interactive UI**.
- Good developer experience for rapid UI iteration.
- Built-in routing, client/server components, environmental variables, and fetch support.
- Easy to package with Docker and deploy.

Next.js provides all the tools necessary for a clean and responsive client-side user experience.

---

## 2. Word Collection Storage Strategy

### Why a Text File + In-Memory Cache
The Wordle word list:

- Changes extremely rarely (stable English dictionary subset).
- Needs to be read **very frequently**:
  - For input validation
  - For random answer selection
- The dataset is small (a few KB)

Given this, a **plain text file** plus **in-memory caching** offers:

- Simplicity
- Fast read access
- No database dependency
- Zero overhead in both dev and deployment

A database or external store would introduce unnecessary complexity and does not provide additional value at this scale.

---

## 3. Scoring System Design

### Base Wordle Logic
A Wordle game is binary:

- **Win** — the correct answer is guessed within the limit  
- **Lose** — the limit is reached without finding the answer  

However, this model cannot differentiate between players who barely solved the puzzle and players who solved it efficiently.

### Added Enhancement – Countdown Bonus Timer
To introduce skill differentiation, I added:

- A **countdown timer**  
- Remaining time becomes a **bonus score**

This provides a more meaningful performance metric while staying within the original Wordle concept.

---

## 4. Improving User Input Experience

Manually clicking each input box leads to slower gameplay and a less polished experience.

To improve UX:

- A **global key listener** was added
- The system automatically:
  - Focuses input
  - Tracks typed characters
  - Submits the guess automatically when 5 characters are entered

This significantly improves flow and keeps gameplay closer to the real Wordle UX.

---

## 5. Game State Persistence

Users often close or refresh their browser. Losing the game progress would lead to a poor experience.

To solve this:

- Each game receives a unique **gameId**
- The client stores the gameId in **localStorage**
- When the app loads, it checks if a gameId exists:
  - If yes → fetch existing game state
  - If no → start a new game

This allows users to continue their ongoing game seamlessly.

---

## 6. Login / Authentication Considerations

Implementing a user login system introduces significant complexity:

- Account management  
- Authentication  
- Persistent user profiles  
- Server-side user linkage  

For a small Wordle mini-game, this is unnecessary overhead.

### Decision: No login system
All essential logic can be tied to:

- Game ID  
- Local storage  
- Server session logic  

No authentication is required for meaningful gameplay.

---

## 7. Time Constraints & Feature Prioritization

The project was developed under time limitations. Therefore, I focused on:

### Core Deliverables First
- Game loop  
- Input validation  
- Scoring logic  
- Server/client separation  
- Dockerized deployment  
- Persistence of game state  
- Secure answer reveal

### Deferred / Future Features
These features are nice-to-have but were intentionally excluded due to time constraints:

- Full database persistence
- Multi-player leaderboard / ranking system
- Player authentication / profiles
- Real-time opponent mode
- Session analytics

This prioritization ensures a stable, functional, and maintainable core product while keeping future extension options open.

---

## 8. Deployment & Infrastructure Considerations

### Why Docker / Docker Compose
Docker was chosen because:

- It guarantees consistent environment setup  
- Simplifies onboarding and testing  
- Ensures API + Web containers work exactly the same on all machines  
- Clean separation between client and server  
- Minimizes OS-level configuration issues

Docker Compose orchestrates:

- API container  
- Next.js container  
- Internal networking  
- Health checks (optional)  

This results in a clean, reproducible deployment workflow.

---

## 9. Documentation & Maintainability

To keep the codebase understandable:

- Core logic is encapsulated in **FunWordle.Core**  
- API logic in **FunWordle.API**  
- UI logic in **FunWordle.Web**  
- Naming conventions follow C# / Next.js best practices  
- Comments/documentation describe:
  - Intent  
  - Edge cases  
  - Design choices  

This structure makes the project easy to navigate, refactor, and extend.
