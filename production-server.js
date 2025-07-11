import { handler } from './build/handler.js';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
/*
// WebSocket server setup (embedded)
const clients = new Set();

const wss = new WebSocketServer({ 
	server: server,
	path: '/api/ws'
});

wss.on('connection', (ws) => {
	console.log('WebSocket client connected');
	const client = { ws, userId: null };
	clients.add(client);

	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data.toString());
			
			switch (message.type) {
				case 'authenticate':
					client.userId = message.userId;
					console.log('Client authenticated:', message.userId);
					break;
				case 'create_post':
					broadcast(message, client.userId);
					break;
				case 'like_post':
					broadcast(message, client.userId);
					break;
				case 'add_comment':
					broadcast(message, client.userId);
					break;
				default:
					console.log('Unknown message type:', message.type);
			}
		} catch (error) {
			console.error('Error parsing WebSocket message:', error);
		}
	});

	ws.on('close', () => {
		console.log('WebSocket client disconnected');
		clients.delete(client);
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
		clients.delete(client);
	});
});

function broadcast(message, excludeUserId) {
	const data = JSON.stringify(message);
	
	clients.forEach(client => {
		if (excludeUserId && client.userId === excludeUserId) {
			return; // Don't send to the user who triggered the event
		}
		
		if (client.ws.readyState === 1) { // WebSocket.OPEN
			client.ws.send(data);
		}
	});
}*/

// SvelteKit handler
app.use(handler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log(`WebSocket server running on /api/ws`);
});
