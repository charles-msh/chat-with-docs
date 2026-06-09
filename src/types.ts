export enum MessageSender {
  USER = "user",
  MODEL = "model",
  SYSTEM = "system",
}

export interface UrlContextMetadataItem {
  retrievedUrl: string;
  urlRetrievalStatus: string;
}

export interface LocalFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  isLoading?: boolean;
  urlContext?: UrlContextMetadataItem[];
}

export interface URLGroup {
  id: string;
  name: string;
  urls: string[];
  files: LocalFile[];
}
