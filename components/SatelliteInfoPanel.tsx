
import React, { useState, useEffect } from 'react';
import * as satellite from 'satellite.js';
import { TLEData, OrbitalData } from '../types';
import Loader from './Loader';

const formatNumber = (num: number | null) => num?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A';

const InfoItem: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-baseline py-1.5">
    <span className="text-slate-400">{label}</span>
    <span className="font-mono text-lg text-cyan-300">
      {value}
      <span className="text-sm text-cyan-400/70 ml-1.5">{unit}</span>
    </span>
  </div>
);

interface SatelliteInfoPanelProps {
  tleData: TLEData | null;
  isLoading: boolean;
  aiDescription: string | null;
  isLoadingAiDescription: boolean;
  aiError: string | null;
  isAiEnabled: boolean;
  isApiKeyProvided: boolean;
}

const SatelliteInfoPanel: React.FC<SatelliteInfoPanelProps> = ({ 
    tleData, 
    isLoading, 
    aiDescription,
    isLoadingAiDescription,
    aiError,
    isAiEnabled,
    isApiKeyProvided
}) => {
  const [orbitalData, setOrbitalData] = useState<OrbitalData | null>(null);

  useEffect(() => {
    if (tleData) {
      try {
        const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);
        
        const positionAndVelocity = satellite.propagate(satrec, new Date());
        const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
        const velocityEci = positionAndVelocity.velocity as satellite.EciVec3<number>;
        
        if (!positionEci || !velocityEci) {
            console.error("Failed to propagate satellite position.");
            setOrbitalData(null);
            return;
        }

        const gmst = satellite.gstime(new Date());
        const geodetic = satellite.eciToGeodetic(positionEci, gmst);
        const altitude = geodetic.height;

        const velocity = Math.sqrt(
          velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2
        );

        // The 'no_kozai' property from satellite.js gives mean motion in radians per minute.
        // The type definitions may be out of date, causing a compile error. Casting to `any` to bypass.
        const meanMotion = (satrec as any).no_kozai;
        const period = (2 * Math.PI) / meanMotion; // Period in minutes

        const inclination = satrec.inclo * (180 / Math.PI); // convert radians to degrees

        setOrbitalData({ altitude, velocity, period, inclination });
      } catch (error) {
        console.error("Error calculating orbital data:", error);
        setOrbitalData(null);
      }
    } else {
      setOrbitalData(null);
    }
  }, [tleData]);

  const renderAiDescription = () => {
    if (aiError) {
      return <p className="text-red-400 text-center text-sm">{aiError}</p>;
    }
    if (!isApiKeyProvided) {
        return (
          <p className="text-slate-400 text-center text-sm">
            AI 기능을 사용하려면 <br/> 상단에 Gemini API 키를 입력해주세요.
          </p>
        );
    }
    if (!isAiEnabled) {
      return (
        <p className="text-slate-400 text-center text-sm">
          AI 설명 기능이 꺼져 있습니다. <br/> 헤더에서 Gemini 기능을 활성화하세요.
        </p>
      );
    }
    if (isLoadingAiDescription) {
      return (
        <div className="flex items-center justify-center gap-2 text-sm text-cyan-400/80">
          <Loader />
          <span>AI가 위성 정보를 생성하는 중...</span>
        </div>
      );
    }
    if (aiDescription) {
      return <p className="text-slate-300 whitespace-pre-line text-base leading-relaxed">{aiDescription}</p>;
    }
    if (tleData) {
        return <p className="text-slate-500 text-center text-sm">AI 정보 로딩 대기 중...</p>;
    }
    return <p className="text-slate-500 text-center text-sm">위성을 선택하면 AI가 정보를 분석합니다.</p>;
  };
  
  const renderOrbitalData = () => {
     if (orbitalData) {
        return (
            <div className="w-full space-y-1">
                <InfoItem label="현재 고도" value={formatNumber(orbitalData.altitude)} unit="km" />
                <InfoItem label="현재 속도" value={formatNumber(orbitalData.velocity)} unit="km/s" />
                <InfoItem label="궤도 주기" value={formatNumber(orbitalData.period)} unit="분" />
                <InfoItem label="궤도 경사각" value={formatNumber(orbitalData.inclination)} unit="°" />
            </div>
        );
     }
     return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">위성 상세 정보</h2>
      <div className="bg-slate-900/70 rounded-md p-4 min-h-[300px] flex flex-col justify-center">
        {!tleData && !isLoading && (
           <p className="text-slate-500 text-center">
            위성을 선택하여 상세 정보를 확인하세요.
          </p>
        )}
        {(isLoading || (tleData && isLoadingAiDescription && isAiEnabled)) && !orbitalData && (
             <div className="flex flex-col items-center justify-center gap-4">
                <Loader />
                <p className="text-cyan-400">위성 데이터를 불러오는 중...</p>
             </div>
        )}
        {tleData && (
            <div className="flex flex-col gap-6 animate-fade-in">
                <h3 className="text-xl font-bold text-cyan-300 truncate -mb-2" title={tleData.name}>{tleData.name}</h3>
                
                {/* AI Section */}
                <div className="border-t border-slate-700 pt-4">
                    <div className="min-h-[80px] flex items-center justify-center">
                        {renderAiDescription()}
                    </div>
                </div>

                {/* Orbital Data Section */}
                {orbitalData && (
                     <div className="border-t border-slate-700 pt-4">
                        {renderOrbitalData()}
                     </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteInfoPanel;
