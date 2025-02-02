import React from 'react';
import { X } from 'lucide-react';
import { ModelOption } from '../types';

interface ModelSettingsModalProps {
  model: ModelOption;
  onClose: () => void;
}

export default function ModelSettingsModal({ model, onClose }: ModelSettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Model Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Model Name */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Model Name</h4>
            <p className="text-base text-gray-900">{model.name}</p>
          </div>

          {/* Context Length */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Context Length</h4>
            <p className="text-base text-gray-900">
              {model.context_length.toLocaleString()} tokens
            </p>
          </div>

          {/* Pricing */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Pricing</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prompt</span>
                <span className="text-sm font-medium text-gray-900">
                  ${model.pricing.prompt}/1k tokens
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion</span>
                <span className="text-sm font-medium text-gray-900">
                  ${model.pricing.completion}/1k tokens
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}