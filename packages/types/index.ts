export interface ChatsType {
    username: string;
    type: string;
    payload: {
        text: string,
        roomId: string
    }
}