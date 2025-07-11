import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const clients = new Set();
const PORT = process.env.WS_PORT || 3001;

console.log(`Starting WebSocket server on port ${PORT}...`);

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
	console.log('Client connected');
	const client = { ws, userId: null };
	clients.add(client);

	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data.toString());

			switch (message.type) {
				case 'authenticate':
					client.userId = message.userId;
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
		clients.delete(client);
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
		clients.delete(client);
	});
});

function broadcast(message, excludeUserId) {
	const data = JSON.stringify(message);

	clients.forEach((client) => {
		if (excludeUserId && client.userId === excludeUserId) {
			return; // Don't send to the user who triggered the event
		}

		if (client.ws.readyState === 1) {
			// WebSocket.OPEN
			client.ws.send(data);
		}
	});
}

console.log('WebSocket server running on port 3001');

// Handle graceful shutdown
process.on('SIGINT', () => {
	console.log('Shutting down WebSocket server...');
	wss.close(() => {
		process.exit(0);
	});
});
