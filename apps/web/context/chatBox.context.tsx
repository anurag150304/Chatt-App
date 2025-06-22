import { createContext, Dispatch, SetStateAction, useState, type ReactNode, } from "react";
import type { ChatsType } from "@repo/types/chatsType";

interface ChatsContextType {
    chats: ChatsType[];
    setChats: Dispatch<SetStateAction<ChatsType[]>>;
}

export const ChatBoxContext = createContext<ChatsContextType | null>(null);
export const ChatBoxContextProvider = ({ children }: { children: ReactNode }) => {
    const [chats, setChats] = useState<ChatsType[]>([]);

    return (
        <ChatBoxContext.Provider value={{ chats, setChats }}>
            {children}
        </ChatBoxContext.Provider>
    )
}
