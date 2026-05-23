# YouTube Watch Party System

A real-time watch party application that allows multiple users 
to watch YouTube videos together in sync.

## Live URLs
- Frontend: https://watch-party-client-mi13.onrender.com
- Backend: https://watch-party-server-75om.onrender.com

## GitHub Repositories
- Frontend: https://github.com/kamalsahani2005/watch-party-client
- Backend: https://github.com/kamalsahani2005/watch-party-server

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Realtime: Socket.IO (WebSockets)
- Deployment: Render

## Setup Locally

### Prerequisites
- Node.js installed
- npm installed

### Server Setup
1. Clone the server repo
   git clone https://github.com/kamalsahani2005/watch-party-server
2. Go into the folder
   cd watch-party-server
3. Install dependencies
   npm install
4. Create a .env file
   PORT=3001
   CLIENT_URL=http://localhost:5173
5. Start the server
   node index.js

### Client Setup
1. Clone the client repo
   git clone https://github.com/kamalsahani2005/watch-party-client
2. Go into the folder
   cd watch-party-client
3. Install dependencies
   npm install
4. Create a .env file
   VITE_SERVER_URL=http://localhost:3001
5. Start the client
   npm run dev
6. Open browser at
   http://localhost:5173

## Architecture Overview
When a user creates a room, they become the Host automatically.
Other users join via room code and get Participant role by default.
All playback events (play, pause, seek, change video) are sent 
via Socket.IO WebSockets to the server. The server validates the 
user role before broadcasting the event to all participants in 
the room. This ensures only Host and Moderators can control 
playback.

## WebSocket Events
- join_room: User joins a room
- play/pause/seek: Playback control (Host/Moderator only)
- change_video: Change YouTube video (Host/Moderator only)
- assign_role: Host assigns roles to participants
- remove_participant: Host removes a user from room

## Deployment
Both frontend and backend are deployed on Render.
- Backend runs as a Web Service (Node.js)
- Frontend runs as a Static Site
- Environment variables are configured on Render dashboard
