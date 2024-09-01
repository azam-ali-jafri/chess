# Real-Time Multiplayer Chess Game

## Overview

This project is a real-time multiplayer chess game designed for engaging and competitive play. It features real-time updates, robust move validation using the chess.js library, and efficient game state management with persistent and recoverable game states.

## Key Features

- **Real-Time Gameplay**: Instant move updates and live game interaction.
- **Move Validation**: Leveraging chess.js for accurate move validation and game rules enforcement.
- **Efficient Move Handling**: Implemented a queue system to handle and store game moves, reducing WebSocket response delays.
- **Game State Recovery**: Persistent game state with mechanisms for recovery to prevent progress loss during server failures.
- **Customizable Time Controls**: Configurable countdown timers for each player.

## Technologies

- **Frontend**: React for a dynamic user interface.
- **Backend**: Node.js for server-side logic and real-time WebSocket communication.
- **Database**: PostgreSQL for persistent storage.
- **In-Memory Database**: For fast access and performance optimization.
- **Chess.js**: For handling chess game logic and validation.

## Getting Started

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/azamalijafri/chess.git
   cd chess
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Prisma generate**

   ```bash
   cd packages/db
   npx prisma generate
   ```

4. **Start development server**

   ```bash
   cd ../..
   turbo run dev
   ```
