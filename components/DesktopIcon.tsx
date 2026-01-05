import React from 'react';
import { IconProps } from '../types';

export const DesktopIcon: React.FC<IconProps> = ({ label, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center w-24 p-2 rounded-lg hover:bg-sand-400/30 transition-colors focus:outline-none focus:bg-sand-400/50"
    >
      <div className="w-12 h-12 mb-2 text-sand-800 drop-shadow-sm group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <span className="text-sm font-bold text-sand-900 text-center leading-tight drop-shadow-sm">
        {label}
      </span>
    </button>
  );
};
