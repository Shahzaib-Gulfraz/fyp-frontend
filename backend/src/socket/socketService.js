const socketIo = require('socket.io');

class SocketService {
    constructor() {
        this.io = null;
        this.users = new Map(); // Map<UserId, SocketId>
    }

    init(server) {
        this.io = socketIo(server, {
            cors: {
                origin: "*", // Configure strictly in production
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join', (userId) => {
                const room = String(userId);
                this.users.set(room, socket.id);
                socket.join(room); // Join a room explicitly named after userId for targeted messages
                console.log(`User ${room} joined room ${room}`);
            });

            // Typing indicators
            socket.on('typing', ({ conversationId, userId }) => {
                socket.to(conversationId).emit('user_typing', { userId, conversationId });
            });

            socket.on('stopped_typing', ({ conversationId, userId }) => {
                socket.to(conversationId).emit('user_stopped_typing', { userId, conversationId });
            });

            socket.on('disconnect', () => {
                // Remove user from map on disconnect
                for (const [userId, socketId] of this.users.entries()) {
                    if (socketId === socket.id) {
                        this.users.delete(userId);
                        break;
                    }
                }
                console.log('User disconnected:', socket.id);
            });
        });

        return this.io;
    }

    // Singleton instance accessor
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    // Method to emit event to specific user
    emitToUser(userId, event, data) {
        if (this.io) {
            const roomName = String(userId);
            console.log(`[Socket] Emitting '${event}' to room '${roomName}'`);
            this.io.to(roomName).emit(event, data);

            // Check if room has sockets
            const room = this.io.sockets.adapter.rooms.get(userId.toString());
            if (room) {
                console.log(`[Socket] Room '${userId}' has ${room.size} sockets`);
            } else {
                console.log(`[Socket] Room '${userId}' is empty or does not exist`);
            }
        } else {
            console.log('[Socket] IO not initialized');
        }
    }

    getIO() {
        return this.io;
    }
}

module.exports = SocketService.getInstance();
