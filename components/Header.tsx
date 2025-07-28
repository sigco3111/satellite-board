
import React, { useState, useEffect } from 'react';
import SatelliteIcon from './icons/SatelliteIcon';

interface HeaderProps {
  isAiEnabled: boolean;
  onAiToggle: () => void;
  apiKey: string;
  onApiKeySave: (key: string) => void;
  onApiKeyDelete: () => void;
  isApiKeyProvided: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAiEnabled, onAiToggle, apiKey, onApiKeySave, onApiKeyDelete, isApiKeyProvided }) => {
  const [inputApiKey, setInputApiKey] = useState('');

  useEffect(() => {
    setInputApiKey(apiKey);
  }, [apiKey]);

  const handleSaveClick = () => {
    if (inputApiKey.trim()) {
        onApiKeySave(inputApiKey.trim());
    }
  };
  
  const handleDeleteClick = () => {
    setInputApiKey('');
    onApiKeyDelete();
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    }
  };

  return (
    <header className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-4">
          <SatelliteIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-slate-100 tracking-wider">
            위성 궤도 <span className="text-cyan-400">시각화</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 flex-grow md:flex-grow-0 md:w-auto order-3 md:order-2 w-full">
            <div className="relative flex-grow">
                <input
                    type="password"
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    onKeyPress={handleInputKeyPress}
                    placeholder="여기에 Gemini API 키를 입력하세요"
                    className="w-full bg-slate-800/70 border border-slate-600 rounded-md py-1.5 pl-3 pr-32 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-slate-500"
                    aria-label="Gemini API Key"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button 
                        onClick={handleSaveClick}
                        className="px-4 py-1 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 rounded-md text-white transition-colors flex-shrink-0"
                        aria-label="Save API Key"
                    >
                        저장
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="ml-2 px-3 py-1 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors flex-shrink-0"
                        title="API 키 삭제"
                        aria-label="Delete API Key"
                    >
                        삭제
                    </button>
                </div>
            </div>
             <div className="flex items-center gap-2 flex-shrink-0" title={isApiKeyProvided ? "API 키가 활성화되었습니다." : "API 키가 제공되지 않았습니다."}>
                <span className={`w-2.5 h-2.5 rounded-full ${isApiKeyProvided ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                <span className="text-xs font-medium text-slate-400">{isApiKeyProvided ? 'Active' : 'Inactive'}</span>
            </div>
        </div>

        <div className="flex items-center gap-3 order-2 md:order-3">
          <span className="text-sm font-medium text-slate-300">Gemini 기능</span>
          <button
            onClick={onAiToggle}
            role="switch"
            aria-checked={isAiEnabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${
              isAiEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            } ${!isApiKeyProvided ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={!isApiKeyProvided}
            title={isApiKeyProvided ? "Gemini AI 기능 활성화/비활성화" : "API 키를 먼저 입력해야 합니다."}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
                isAiEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
