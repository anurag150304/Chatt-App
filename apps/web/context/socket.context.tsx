import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { ChatBoxContext } from "./chatBox.context";

export const SocketContext = createContext<RefObject<WebSocket | null> | null>(null);
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const socket = useRef<WebSocket | null>(null);
    const chatBox = useContext(ChatBoxContext);
    useEffect(() => {
        socket.current = new WebSocket("ws://localhost:8080");
        socket.current.onopen = () => console.log("Socked Connected");
        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            chatBox?.setChats(prev => [...prev, data]);
        }
        socket.current.onerror = (err) => console.log("Socket Error : ", err);
        return () => socket.current?.close();
    }, []);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}
