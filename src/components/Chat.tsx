import React, { useState, useEffect } from 'react';
import { Send, Trash2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, ModelOption } from '../types';
import ModelSelector from './ModelSelector';
import ModelSettingsModal from './ModelSettingsModal';
import ApiKeyModal from './ApiKeyModal';

const getModelIcon = (modelId: string): string => {
  if (modelId.includes('grok')) {
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJjg0KtwpcP31-sXeMCxksMx3gGsbEb3WSkg&s';
  } else if (modelId.includes('llama')) {
    return 'https://www.phoronix.net/image.php?id=2024&image=ollama';
  } else if (modelId.includes('google') || modelId.includes('gemini')) {
    return 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.png';
  } else if (modelId.includes('openai') || modelId.includes('gpt')) {
    return 'https://static.vecteezy.com/system/resources/previews/022/227/364/non_2x/openai-chatgpt-logo-icon-free-png.png';
  } else if (modelId.includes('deepseek')) {
    return 'https://images.seeklogo.com/logo-png/61/2/deepseek-ai-icon-logo-png_seeklogo-611473.png';
  } else if (modelId.includes('qwen')) {
    return 'https://images.seeklogo.com/logo-png/61/1/qwen-icon-logo-png_seeklogo-611724.png';
  } else if (modelId.includes('claude') || modelId.includes('anthropic')) {
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxs0_1pTqRuBC2sd9p3J_AnBS6wC9lafdofKxTu-GWV_TyZT4sT2bTZhXBbeNRvlTr92s&usqp=CAU';
  } else if (modelId.includes('amazon') || modelId.includes('aws')) {
    return 'https://cdn0.iconfinder.com/data/icons/most-usable-logos/120/Amazon-512.png';
  } else if (modelId.includes('mixtral') || modelId.includes('mistral')) {
    return 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/mistral-ai-icon.png';
  } else if (modelId.includes('perplexity')) {
    return 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png';
  } else if (modelId.includes('microsoft') || modelId.includes('azure')) {
    return 'https://cdn.pixabay.com/photo/2021/08/10/15/36/microsoft-6536268_1280.png';
  }
  return '';
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState('x-ai/grok-2-vision-1212');
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) return;

    const fetchModels = async () => {
      try {
        setError(null);
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'OpenRouter Chat'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }

        const modelsList = data.data.map((model: any) => ({
          id: model.id,
          name: model.name,
          pricing: {
            prompt: model.pricing.prompt,
            completion: model.pricing.completion,
          },
          context_length: model.context_length,
        }));
        setModels(modelsList);
      } catch (error) {
        console.error('Error fetching models:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch models');
        if (error instanceof Error && error.message.includes('401')) {
          setShowApiKeyModal(true);
        }
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !apiKey) return;

    const newMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Get only the messages that belong to the current model or user messages
      const relevantMessages = messages
        .filter(msg => msg.role === 'user' || msg.modelId === selectedModel)
        .concat(newMessage);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'OpenRouter Chat'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: relevantMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
        modelId: selectedModel, // Always store the current model ID with the message
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        setShowApiKeyModal(true);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${errorMessage}`,
          modelId: selectedModel,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (messages.length > 0 && window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      setError(null);
    }
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OR</span>
            </div>
            <h1 className="text-xl font-semibold text-purple-600">OpenRouter</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelect={setSelectedModel}
              isLoading={isLoadingModels}
            />
            {selectedModelData && (
              <button
                className="p-2 hover:bg-purple-100 rounded-full text-purple-600"
                onClick={() => setShowSettings(true)}
                title="Model Information"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
            <button 
              className="p-2 hover:bg-red-100 rounded-full text-red-600"
              onClick={clearChat}
              title="Clear chat history"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-auto max-w-4xl mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-6 ${
                message.role === 'assistant' ? 'bg-white' : ''
              } p-4 rounded-lg`}
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-start gap-4">
                  {message.role === 'assistant' ? (
                    <img
                      src={getModelIcon(message.modelId || selectedModel)}
                      alt="AI"
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 flex items-center justify-center text-white">
                      U
                    </div>
                  )}
                  <div className="flex-1 prose">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-pulse text-purple-600">Thinking...</div>
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message OpenRouter..."
              className="w-full p-4 pr-16 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !apiKey}
                className="p-2 hover:bg-purple-100 rounded-full text-purple-600 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSettings && selectedModelData && (
        <ModelSettingsModal
          model={selectedModelData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          onSubmit={handleApiKeySubmit}
          onClose={() => {
            if (apiKey) {
              setShowApiKeyModal(false);
            }
          }}
        />
      )}
    </div>
  );
}