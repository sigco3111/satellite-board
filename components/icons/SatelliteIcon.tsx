
import React from 'react';

const SatelliteIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5.63 21.08a2 2 0 0 0 2.7-2.8L5.7 15.65a2 2 0 0 0-2.8 2.7z"></path>
      <path d="m13.4 12.6-1.6 1.6a2 2 0 0 1-2.8 0L8.4 13.6a2 2 0 0 1 0-2.8l1.6-1.6"></path>
      <path d="m12.6 13.4 1.6 1.6a2 2 0 0 0 2.8 0l.6-.6a2 2 0 0 0 0-2.8l-1.6-1.6"></path>
      <path d="M18 2a2 2 0 0 0-2 2v2"></path>
      <path d="M22 6h-2a2 2 0 0 0-2 2"></path>
      <path d="M12.6 8.4 9.8 5.6a2 2 0 0 0-2.8 0L6.4 6.2a2 2 0 0 0 0 2.8l2.8 2.8"></path>
      <path d="M2 18h2a2 2 0 0 0 2-2v-2"></path>
      <path d="M6 2h-2a2 2 0 0 0-2 2"></path>
    </svg>
  );
};

export default SatelliteIcon;
