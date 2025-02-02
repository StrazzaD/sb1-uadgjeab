export interface Message {
  role: 'user' | 'assistant';
  content: string;
  modelId?: string; // Add modelId to track which model generated the response
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedModel: string;
}

export interface ModelOption {
  id: string;
  name: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
}