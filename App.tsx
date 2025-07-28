
import React, { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { GoogleGenAI } from "@google/genai";
import { Satellite, TLEData, SatelliteAPIResponse } from './types';
import Header from './components/Header';
import SatelliteList from './components/SatelliteList';
import SatelliteInfoPanel from './components/SatelliteInfoPanel';
import OrbitVisualizer from './components/OrbitVisualizer';
import Loader from './components/Loader';

const API_BASE_URL = 'https://tle.ivanstanojevic.me/api/tle';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('starlink');
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [tleData, setTleData] = useState<TLEData | null>(null);
  const [isLoadingSatellites, setIsLoadingSatellites] = useState(false);
  const [isLoadingTle, setIsLoadingTle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyProvided, setIsApiKeyProvided] = useState(false);

  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoadingAiDescription, setIsLoadingAiDescription] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    const initialKey = storedKey || process.env.API_KEY || '';
    setApiKey(initialKey);
  }, []);

  useEffect(() => {
    if (apiKey) {
      try {
        const newAiInstance = new GoogleGenAI({ apiKey });
        setAi(newAiInstance);
        setIsApiKeyProvided(true);
      } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
        setAi(null);
        setIsApiKeyProvided(false);
        setAiError("API 키 초기화에 실패했습니다. 유효한 키인지 확인해주세요.");
      }
    } else {
      setAi(null);
      setIsApiKeyProvided(false);
    }
  }, [apiKey]);
  
  const handleApiKeySave = (newKey: string) => {
    localStorage.setItem('gemini-api-key', newKey);
    setApiKey(newKey);
  };

  const handleApiKeyDelete = useCallback(() => {
    localStorage.removeItem('gemini-api-key');
    setApiKey('');
    setIsAiEnabled(false);
    setAiDescription(null);
    setAiError(null);
  }, []);

  const searchSatellites = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
        setSatellites([]);
        return;
    }
    setIsLoadingSatellites(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}?search=${encodeURIComponent(query)}&page-size=50`);
      if (!response.ok) {
        throw new Error(`API 오류: ${response.statusText}`);
      }
      const data: SatelliteAPIResponse = await response.json();
      setSatellites(data.member || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '위성 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.');
      setSatellites([]);
    } finally {
      setIsLoadingSatellites(false);
    }
  }, []);

  const debouncedSearch = useCallback(debounce(searchSatellites, 500), [searchSatellites]);

  useEffect(() => {
    searchSatellites('starlink');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };
  
  const fetchAiDescription = useCallback(async (satelliteName: string) => {
    if (!ai) {
        setAiError("Gemini API 키가 설정되지 않았습니다. 헤더에서 키를 입력하고 저장해주세요.");
        return;
    }
    setIsLoadingAiDescription(true);
    setAiError(null);
    setAiDescription(null);
    try {
        const prompt = `인공위성 '${satelliteName}'에 대해 일반인이 이해하기 쉽게 설명해줘. 이 위성의 목적은 무엇이고, 어떤 흥미로운 사실이 있는지 알려줘. 답변은 한국어로 해줘.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setAiDescription(response.text);

    } catch (err) {
        console.error("Error fetching AI description:", err);
        setAiError("AI 설명을 가져오는 데 실패했습니다. API 키가 유효한지 확인하거나 잠시 후 다시 시도해주세요.");
    } finally {
        setIsLoadingAiDescription(false);
    }
  }, [ai]);
  
  const handleAiToggle = useCallback(() => {
    const newAiState = !isAiEnabled;
    setIsAiEnabled(newAiState);

    if (newAiState && selectedSatellite && !aiDescription && !isLoadingAiDescription && !aiError) {
        fetchAiDescription(selectedSatellite.name);
    } else if (!newAiState) {
        setAiDescription(null);
        setAiError(null);
        setIsLoadingAiDescription(false);
    }
  }, [isAiEnabled, selectedSatellite, aiDescription, isLoadingAiDescription, aiError, fetchAiDescription]);

  const handleSelectSatellite = useCallback(async (satellite: Satellite) => {
    setSelectedSatellite(satellite);
    setTleData(null);
    setError(null);
    setAiDescription(null);
    setAiError(null);

    setIsLoadingTle(true);
    fetch(`${API_BASE_URL}/${satellite.satelliteId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API 오류: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data: TLEData) => {
        setTleData(data);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'TLE 데이터를 가져오는 중 알 수 없는 오류가 발생했습니다.');
        setTleData(null);
      })
      .finally(() => {
        setIsLoadingTle(false);
      });

    if (isAiEnabled) {
      fetchAiDescription(satellite.name);
    }
  }, [fetchAiDescription, isAiEnabled]);

  const handleSelectRecommendedSatellite = useCallback((satellite: Satellite) => {
    handleSelectSatellite(satellite);
    setSearchTerm(satellite.name);
    searchSatellites(satellite.name);
  }, [handleSelectSatellite, searchSatellites]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header 
        isAiEnabled={isAiEnabled} 
        onAiToggle={handleAiToggle}
        apiKey={apiKey}
        onApiKeySave={handleApiKeySave}
        onApiKeyDelete={handleApiKeyDelete}
        isApiKeyProvided={isApiKeyProvided}
      />
      <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-screen-2xl mx-auto">
        <div className="lg:col-span-1 flex flex-col gap-8 h-full">
          <SatelliteList
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            satellites={satellites}
            onSelect={handleSelectSatellite}
            onSelectRecommended={handleSelectRecommendedSatellite}
            isLoading={isLoadingSatellites}
            selectedSatelliteId={selectedSatellite?.satelliteId ?? null}
          />
          <SatelliteInfoPanel 
            tleData={tleData} 
            isLoading={isLoadingTle}
            aiDescription={aiDescription}
            isLoadingAiDescription={isLoadingAiDescription}
            aiError={aiError}
            isAiEnabled={isAiEnabled}
            isApiKeyProvided={isApiKeyProvided}
          />
        </div>
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl shadow-2xl shadow-cyan-500/10 p-4 min-h-[400px] lg:min-h-0 aspect-square lg:aspect-auto flex items-center justify-center relative">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 rounded-xl">
                <p className="text-red-300 text-center p-4">{error}</p>
            </div>
          )}
          {isLoadingTle && !error && (
            <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-slate-900/50 rounded-xl z-10">
              <Loader />
              <p className="text-cyan-400">TLE 데이터를 로드하고 궤도를 계산하는 중...</p>
            </div>
          )}
          <OrbitVisualizer tleData={tleData} />
        </div>
      </main>
    </div>
  );
};

export default App;
