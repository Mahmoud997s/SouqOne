// ──────────────────────────────────────
// أنواع المحادثات والرسائل
// ──────────────────────────────────────

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

export interface IConversation {
  id: string;
  listingId: string;
  participants: IConversationParticipant[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  lastReadAt?: Date | null;
}

export interface IMessage {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISendMessage {
  content: string;
  type?: MessageType;
  conversationId: string;
}
