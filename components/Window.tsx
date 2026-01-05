import React, { useState, useRef, useEffect } from 'react';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  zIndex: number;
  initialPosition: { x: number; y: number };
  width?: string;
  onClose: () => void;
  onFocus: () => void;
}

export const Window: React.FC<WindowProps> = ({
  title,
  children,
  isOpen,
  zIndex,
  initialPosition,
  width = '400px',
  onClose,
  onFocus
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Attach global listeners for smooth dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="absolute flex flex-col bg-sand-100 border-2 border-sand-800 shadow-[8px_8px_0_rgba(137,102,70,0.2)] rounded-sm overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        zIndex: zIndex,
        width: width,
        maxWidth: '90vw',
        maxHeight: '80vh'
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="bg-sand-300 border-b-2 border-sand-800 p-2 flex justify-between items-center cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
           {/* Retro decorative lines */}
          <div className="flex gap-1">
             <div className="w-full h-[2px] bg-sand-800"></div>
             <div className="w-full h-[2px] bg-sand-800"></div>
          </div>
          <span className="font-bold text-sand-900 uppercase tracking-wider text-sm pl-2">{title}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-6 h-6 flex items-center justify-center bg-red-400 border border-sand-900 hover:bg-red-500 active:translate-y-[1px]"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </div>
  );
};
