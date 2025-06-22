import { WebSocket, WebSocketServer } from "ws";
import dbClient from "@repo/db-config/client";

const server = new WebSocketServer({ port: 8080 });
const rooms = new Map<string, WebSocket[]>();

server.on("connection", (socket) => {
    console.log("socket connected");

    socket.on("message", async (event) => {
        console.log(event.toString());
        const response = JSON.parse(event.toString());
        const { username, type, payload } = response;
        if (!username || !type || !payload) return;

        const roomExistsInDB = await dbClient.rooms.findFirst({ where: { roomId: payload.roomId } });
        const roomExistsInMap = rooms.has(payload.roomId);

        if (type === "join") {
            if (!roomExistsInDB) {
                dbClient.rooms.create({ data: { roomId: payload.roomId } })
                    .catch(err => console.log(err));
                return;
            }

            if (!roomExistsInMap) {
                rooms.set(payload.roomId, [socket]);
                return;
            }

            const existingSocket = rooms.get(payload.roomId);
            if (existingSocket.includes(socket)) return;
            rooms.set(payload.roomId, [...existingSocket, socket]);
        }
        if (type === "message") {
            if (!roomExistsInDB && !roomExistsInMap) return;

            dbClient.chats.create({
                data: {
                    username,
                    text: payload.text,
                    room: { connect: { roomId: payload.roomId } }
                }
            }).catch(err => console.log(err));

            const currentRoom = rooms.get(payload.roomId);
            currentRoom.forEach(userSocket => {
                if (userSocket !== socket) {
                    userSocket.send(JSON.stringify({
                        username,
                        type: "message",
                        payload: { text: payload.text, roomId: payload.roomId }
                    }));
                }
            });
        }
    });

    socket.on("close", (code, reason) => {
        console.log("socket disconnected");
        socket.close();
    });
});