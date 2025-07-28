
import React from 'react';
import { Satellite } from '../types';
import SearchIcon from './icons/SearchIcon';
import Loader from './Loader';

interface SatelliteListProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  satellites: Satellite[];
  onSelect: (satellite: Satellite) => void;
  onSelectRecommended: (satellite: Satellite) => void;
  isLoading: boolean;
  selectedSatelliteId: number | null;
}

const recommendedSatellites = [
  { name: 'ISS (ZARYA)', satelliteId: 25544 },
  { name: 'TIANHE', satelliteId: 48274 },
  { name: 'HST', satelliteId: 20580 },
  { name: 'STARLINK-4378', satelliteId: 51073 },
  { name: 'NOAA 19', satelliteId: 33591 },
  { name: 'GOES 18', satelliteId: 52182 },
  { name: 'TERRA', satelliteId: 25994 },
  { name: 'GPS BIIF-12', satelliteId: 41328 },
];

const SatelliteList: React.FC<SatelliteListProps> = ({
  searchTerm,
  onSearchChange,
  satellites,
  onSelect,
  onSelectRecommended,
  isLoading,
  selectedSatelliteId,
}) => {
  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 flex flex-col h-auto lg:flex-grow">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">위성 검색</h2>
      
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">추천 위성</h3>
        <div className="flex flex-wrap gap-2">
          {recommendedSatellites.map(sat => (
            <button
              key={sat.satelliteId}
              onClick={() => onSelectRecommended(sat)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedSatelliteId === sat.satelliteId
                  ? 'bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {sat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="또는 이름으로 검색..."
          className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
        />
      </div>
      <div className="flex-grow overflow-y-auto pr-2 min-h-[20vh] max-h-72 lg:max-h-96">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        ) : satellites.length > 0 ? (
          <ul className="space-y-2">
            {satellites.map((sat) => (
              <li key={sat.satelliteId}>
                <button
                  onClick={() => onSelect(sat)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                    selectedSatelliteId === sat.satelliteId
                      ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500'
                      : 'bg-slate-700/30 hover:bg-slate-700/60 text-slate-300'
                  }`}
                >
                  <span className="font-medium">{sat.name}</span>
                  <span className="text-xs text-slate-400 ml-2">ID: {sat.satelliteId}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 mt-8">
            {searchTerm.length < 3 ? '검색하려면 3자 이상 입력하세요.' : '위성을 찾을 수 없습니다.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SatelliteList;
