import { User, Message, Chat } from '../types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Available', online: true },
  { id: '2', name: 'Fashion Hub', avatar: 'https://i.pravatar.cc/150?u=2', status: 'Business Account', online: false },
  { id: '3', name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=3', status: 'Available', online: true },
  { id: '4', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?u=4', status: 'Away', online: false },
  { id: '5', name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=5', status: 'Available', online: true },
  { id: '6', name: 'Lisa Anderson', avatar: 'https://i.pravatar.cc/150?u=6', status: 'Available', online: true },
];

export const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hi there! I saw your collection and I love it.', sender: 'them', time: '10:00 AM' },
  { id: '2', text: 'Thank you! Is there anything specific you are looking for?', sender: 'me', time: '10:05 AM' },
  { id: '3', text: 'I was wondering if the summer dress is available in size S?', sender: 'them', time: '10:10 AM' },
  { id: '4', text: 'Yes, we have a few pieces left in stock.', sender: 'me', time: '10:12 AM' },
  { id: '5', text: 'Great! Can you send me the link?', sender: 'them', time: '10:15 AM' },
];

export const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    user: MOCK_USERS[0],
    lastMessage: 'The dress fits perfectly! Thank you so much.',
    time: '2m ago',
    unread: 2,
  },
  {
    id: '2',
    user: MOCK_USERS[1],
    lastMessage: 'Your order #12345 has been shipped.',
    time: '1h ago',
    unread: 0,
  },
  {
    id: '3',
    user: MOCK_USERS[2],
    lastMessage: 'Do you have this in blue?',
    time: '3h ago',
    unread: 1,
  },
  {
    id: '4',
    user: MOCK_USERS[3],
    lastMessage: 'Thanks for the quick delivery!',
    time: '1d ago',
    unread: 0,
  },
];