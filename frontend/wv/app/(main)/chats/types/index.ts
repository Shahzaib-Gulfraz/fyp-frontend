export interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
  online: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

export interface Chat {
  id: string;
  user: User;
  lastMessage: string;
  time: string;
  unread: number;
}