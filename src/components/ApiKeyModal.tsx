import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ApiKeyModalProps {
  onSubmit: (apiKey: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ onSubmit, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Enter OpenRouter API Key</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            To get a free OpenRouter API key:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-6">
            <li>Visit <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">openrouter.ai/keys</a></li>
            <li>Sign up or log in with your account</li>
            <li>Create a new API key</li>
            <li>Copy and paste your key below</li>
          </ol>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>

            <p className="mt-2 text-xs text-gray-500 text-center">
              We never save or store your API key
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}