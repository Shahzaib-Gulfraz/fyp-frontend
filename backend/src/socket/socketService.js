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
            console.log('[Socket] ✅ User connected. Socket ID:', socket.id);

            socket.on('join', (userId) => {
                const room = String(userId);
                this.users.set(room, socket.id);
                socket.join(room); // Join a room explicitly named after userId for targeted messages
                console.log(`[Socket] ✅ User/Shop ${room} joined room with socket ${socket.id}`);
                
                // Verify room membership
                const roomMembers = this.io.sockets.adapter.rooms.get(room);
                if (roomMembers) {
                    console.log(`[Socket] ✅ Room '${room}' now has ${roomMembers.size} member(s)`);
                } else {
                    console.log(`[Socket] ⚠️ Room '${room}' join might have failed`);
                }
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
                        console.log(`[Socket] ❌ User/Shop ${userId} disconnected from socket ${socket.id}`);
                        break;
                    }
                }
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
            
            // Get room info before emitting
            const room = this.io.sockets.adapter.rooms.get(roomName);
            if (room && room.size > 0) {
                console.log(`[Socket] ✅ Room '${roomName}' has ${room.size} socket(s)`);
                this.io.to(roomName).emit(event, data);
            } else {
                console.log(`[Socket] ⚠️ Room '${roomName}' is empty or does not exist`);
                console.log(`[Socket] Available rooms:`, Array.from(this.io.sockets.adapter.rooms.keys()));
                // Still emit in case socket joins later
                this.io.to(roomName).emit(event, data);
            }
        } else {
            console.log('[Socket] ❌ IO not initialized');
        }
    }

    getIO() {
        return this.io;
    }
}

module.exports = SocketService.getInstance();
