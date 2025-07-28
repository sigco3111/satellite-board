
import React from 'react';
import { TLEData } from '../types';
import Loader from './Loader';

interface TleDisplayProps {
  tleData: TLEData | null;
  satelliteName?: string;
  isLoading: boolean;
}

const TleDisplay: React.FC<TleDisplayProps> = ({ tleData, satelliteName, isLoading }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">TLE 데이터</h2>
      <div className="bg-slate-900/70 rounded-md p-4 min-h-[120px] flex items-center justify-center">
        {isLoading ? (
          <Loader />
        ) : tleData ? (
          <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap break-all">
            <code className="block text-slate-300 mb-1">{tleData.name}</code>
            <code className="block">{tleData.line1}</code>
            <code className="block">{tleData.line2}</code>
          </pre>
        ) : (
          <p className="text-slate-500 text-center">
            {satelliteName ? `${satelliteName}의 데이터를 가져오는 중...` : 'TLE 데이터를 보려면 위성을 선택하세요.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TleDisplay;