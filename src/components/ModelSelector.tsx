import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { ModelOption } from '../types';
import ModelSettingsModal from './ModelSettingsModal';

interface ModelSelectorProps {
  models: ModelOption[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
  isLoading: boolean;
}

export default function ModelSelector({ models, selectedModel, onSelect, isLoading }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

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

  const selectedModelData = models.find(m => m.id === selectedModel);
  
  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[200px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                <span className="text-gray-600">Loading models...</span>
              </div>
            ) : (
              <>
                {selectedModelData && (
                  <>
                    {getModelIcon(selectedModelData.id) && (
                      <img 
                        src={getModelIcon(selectedModelData.id)} 
                        alt={selectedModelData.name}
                        className="w-5 h-5 object-contain cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSettings(true);
                        }}
                      />
                    )}
                    <span className="flex-1 text-left text-sm truncate">{selectedModelData.name}</span>
                  </>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
              </>
            )}
          </button>
        </div>

        {isOpen && !isLoading && (
          <div className="absolute z-10 w-[300px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredModels.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No models found
                </div>
              ) : (
                filteredModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelect(model.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-purple-50 ${
                      model.id === selectedModel ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {getModelIcon(model.id) && (
                      <img 
                        src={getModelIcon(model.id)} 
                        alt={model.name}
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">
                        Context: {model.context_length.toLocaleString()} tokens
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showSettings && selectedModelData && (
        <ModelSettingsModal
          model={selectedModelData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}