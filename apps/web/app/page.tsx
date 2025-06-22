"use client"
import { Fragment, useContext, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { SocketContext, SocketProvider } from "../context/socket.context";
import type { ChatsType } from "@repo/types/chatsType";
import { ChatBoxContext, ChatBoxContextProvider } from "../context/chatBox.context"; import axios from "axios";

export default function Page() {
  return (
    <ChatBoxContextProvider>
      <SocketProvider>
        <ChatApp />
      </SocketProvider>
    </ChatBoxContextProvider>
  )
}

function ChatApp() {
  const socket = useContext(SocketContext);
  const chatBox = useContext(ChatBoxContext);
  const [data, setData] = useState<ChatsType>({ username: "", type: "", payload: { text: "", roomId: "" } });
  const chatBoxScroll = useRef<HTMLDivElement | null>(null);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isSended, setIsSended] = useState<boolean>(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatBoxScroll.current) {
      chatBoxScroll.current.scrollTop = chatBoxScroll.current.scrollHeight;
    }
  }, [chatBox?.chats]);

  useEffect(() => {
    if (input.current) {
      input.current.value = "";
    }
  }, [isSended]);

  const joinRoom = async () => {
    if (!socket?.current) return;
    try {
      const response = await axios.post('/api/chats', { roomId: data.payload.roomId });
      const { chats } = response.data;
      chatBox?.setChats(chats.length > 0 ? chats.map((chat: { username: string; text: string; roomId: string; }) => {
        return {
          username: chat.username,
          type: "message",
          payload: {
            text: chat.text,
            roomId: chat.roomId
          }
        }
      }) : []);

      socket.current.send(JSON.stringify({ ...data, type: "join" }));
      alert("Room joined sucessfully");
      setData({ ...data, type: "" });
      setIsJoined(true);
    } catch (err) {
      alert(err);
    }
  }

  const sendMessage = () => {
    setIsSended(!isSended);
    chatBox?.setChats(prev => [...prev, { ...data, type: "sending" }]);
    socket?.current?.send(JSON.stringify({ ...data, type: "message" }));
  }

  const inputOperate = (e: KeyboardEvent<HTMLInputElement> & ChangeEvent<HTMLInputElement>) => {
    if (e.key == "Enter") return sendMessage();
    setData({ ...data, payload: { ...data.payload, text: e.target.value } });
  }

  const resetAll = () => {
    chatBox?.setChats([]);
    setData({ username: "", type: "", payload: { text: "", roomId: "" } });
    setIsJoined(false);
    socket?.current?.close();
    alert("Room Lefted...");
  }

  return (
    <main className="h-screen w-screen m-0 p-0 flex justify-center items-center bg-[#83ade8]">
      <div className="w-[35%] h-[90%] bg-[#111827] rounded-2xl flex flex-col justify-start items-center p-4">
        <div className="w-full border-b-2 border-b-[#ffffff3d] text-white flex justify-between items-center px-4 pt-1 pb-4">
          <button><i className="fa-solid fa-users-line cursor-pointer" /></button>
          <h1 className="text-center w-full text-3xl">We Chat</h1>
          <button onClick={resetAll}><i className="fa-solid fa-users-slash cursor-pointer" /></button>
        </div>
        <div className={`h-[75%] w-full border-b-2 border-b-[#ffffff3d] text-white flex flex-col ${isJoined ? "justify-start gap-3" : "justify-center items-center"} py-4 overflow-y-auto scroll-smooth container`} ref={chatBoxScroll}>
          {!isJoined && (
            <div className="bg-gray-800 rounded-xl py-6 px-9 flex flex-col justify-center items-center gap-3 opacity-90">
              <h1 className="text-2xl">Join room to chat</h1>
              <input
                type="text"
                name="name"
                className="w-full bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-1 text-sm"
                placeholder="your name"
                value={data.username}
                onChange={(e) => setData({ ...data, username: e.target.value })}
              />
              <input
                type="text"
                name="roomId"
                className="w-full bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-1 text-sm"
                placeholder="eg - DFG7T2"
                value={data.payload.roomId}
                onChange={(e) => setData({ ...data, payload: { ...data.payload, roomId: e.target.value } })} />
              <button className="w-full py-1 bg-blue-700 rounded-lg hover:bg-blue-900 cursor-pointer" onClick={joinRoom}>Join</button>
            </div>
          )}
          {chatBox?.chats && chatBox.chats.length > 0 && chatBox.chats.map((chat, idx) => (
            <Fragment key={idx}>
              {(chat.type == "message" && chat.username !== data.username) ? (
                <div className="max-w-[80%] p-2 bg-blue-700 rounded-lg self-start break-words whitespace-pre-wrap flex flex-col justify-center items-start">
                  <span className="text-xs font-light">{chat.username}</span>
                  <span>{chat.payload.text}</span>
                </div>
              ) : (
                <div className="max-w-[80%] p-2 bg-[#1f2937] rounded-lg self-end break-words whitespace-pre-wrap">{chat.payload.text}</div>
              )}
            </Fragment>
          ))}
        </div>
        <div className={`w-full flex justify-center items-center gap-3 pt-4 text-white ${isJoined ? "cursor-text opacity-100" : "cursor-not-allowed opacity-30"}`}>
          <input
            ref={input}
            type="text"
            name="text"
            disabled={!isJoined}
            placeholder="Type a message......."
            className={`w-[87%] py-2.5 px-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isJoined ? "cursor-text" : "cursor-not-allowed"}`}
            onKeyUp={inputOperate}
          />
          <button disabled={!isJoined} onClick={sendMessage}>
            <i className={`fa-solid fa-paper-plane text-2xl ${isJoined ? "cursor-pointer" : "cursor-not-allowed"}`} />
          </button>
        </div>
      </div>
    </main >
  )
}