import React, { useState } from 'react';
import { DesktopIcon } from './components/DesktopIcon';
import { Window } from './components/Window';
import { SnakeGame } from './components/SnakeGame';
import { BrickBreaker } from './components/BrickBreaker';
import { MemeBuilder } from './components/MemeBuilder';
import { SurfCenterpiece } from './components/SurfCenterpiece';
import { RetroLoginScreen } from './components/RetroLoginScreen';
import { FeedbackApp } from './components/FeedbackApp';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WindowState, AppId } from './types';

const ICONS = {
  SNAKE: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M8 12h8"></path>
      <path d="M12 8v8"></path>
    </svg>
  ),
  MEME: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
      <path d="M15 3v6h6" />
      <path d="M10 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M10 13v.5" />
      <path d="M14 13.5a2.5 2.5 0 0 1-5 0" />
    </svg>
  ),
  ABOUT: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16v-4"></path>
      <path d="M12 8h.01"></path>
    </svg>
  ),
  BRICK_BREAKER: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="6" height="3" rx="1"></rect>
      <rect x="9" y="4" width="6" height="3" rx="1"></rect>
      <rect x="16" y="4" width="6" height="3" rx="1"></rect>
      <rect x="2" y="8" width="6" height="3" rx="1"></rect>
      <rect x="9" y="8" width="6" height="3" rx="1"></rect>
      <rect x="16" y="8" width="6" height="3" rx="1"></rect>
      <circle cx="12" cy="17" r="2"></circle>
      <rect x="6" y="20" width="12" height="2" rx="1"></rect>
    </svg>
  ),
  REMIXER: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"></polygon>
    </svg>
  ),
  NINETY_TEN: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"></path>
      <path d="M5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"></path>
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z"></path>
    </svg>
  ),
  FEEDBACK: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <path d="M12 7v2"></path>
      <path d="M12 13h.01"></path>
    </svg>
  )
};

const Desktop: React.FC = () => {
  const { user, profile, loading, signOut, subscriptionCheckInProgress } = useAuth();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [topZIndex, setTopZIndex] = useState(100);

  if (loading || subscriptionCheckInProgress) {
    return (
      <div className="fixed inset-0 bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-teal-400 font-mono text-sm">
            {subscriptionCheckInProgress ? 'Verifying subscription...' : 'Loading SurfOS...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <RetroLoginScreen />;
  }

  const openApp = (appId: AppId) => {
    const existingWindow = windows.find(w => w.id === appId);
    if (existingWindow) {
      focusWindow(appId);
      return;
    }

    let component;
    let title;
    let width = '400px';
    let initialX = 100 + (windows.length * 30);
    let initialY = 100 + (windows.length * 30);

    switch (appId) {
      case AppId.SNAKE:
        title = "Surf Snake.exe";
        component = <SnakeGame />;
        break;
      case AppId.BRICK_BREAKER:
        title = "Brick Breaker.exe";
        component = <BrickBreaker />;
        break;
      case AppId.MEME:
        title = "BananaPro_Meme.app";
        component = <MemeBuilder />;
        break;
      case AppId.ABOUT:
        title = "ReadMe.txt";
        component = (
          <div className="p-2 space-y-2 text-sm">
            <h2 className="font-bold text-lg">SurfOS v1.0</h2>
            <p>Welcome to the beach.</p>
            <p>Built with React, Tailwind, and Gemini Nano Banana Pro.</p>
            <hr className="border-sand-400" />
            <p className="text-xs">Drag windows by the title bar.</p>
          </div>
        );
        break;
      case AppId.REMIXER:
        title = "Remixer.exe";
        component = (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="text-6xl mb-4">~</div>
            <h2 className="font-bold text-2xl text-ocean-600 mb-2 tracking-wider">REMIXER</h2>
            <div className="relative">
              <p className="text-lg font-semibold text-sand-700 mb-4">COMING SOON</p>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-ocean-400 via-teal-400 to-ocean-400 rounded"></div>
            </div>
            <p className="text-sm text-sand-500 mt-6 max-w-xs">Catch the next wave... something rad is on the horizon.</p>
            <div className="mt-6 flex gap-2">
              <span className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        );
        break;
      case AppId.NINETY_TEN:
        title = "90TEN.exe";
        component = (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="text-5xl font-bold text-sand-800 mb-2">90<span className="text-ocean-500">:</span>10</div>
            <h2 className="font-bold text-xl text-ocean-600 mb-2 tracking-wider">90TEN</h2>
            <div className="relative">
              <p className="text-lg font-semibold text-sand-700 mb-4">COMING SOON</p>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-ocean-400 to-teal-400 rounded"></div>
            </div>
            <p className="text-sm text-sand-500 mt-6 max-w-xs">Paddle out... something gnarly is brewing.</p>
            <div className="mt-6 flex gap-2">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        );
        break;
      case AppId.FEEDBACK:
        title = "Feedback.exe";
        width = '600px';
        component = <FeedbackApp />;
        break;
      default:
        return;
    }

    const newWindow: WindowState = {
      id: appId,
      title,
      component,
      isOpen: true,
      isMinimized: false,
      zIndex: topZIndex + 1,
      position: { x: initialX, y: initialY },
      width
    };

    setWindows([...windows, newWindow]);
    setTopZIndex(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setWindows(windows.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: topZIndex + 1 };
      }
      return w;
    }));
    setTopZIndex(prev => prev + 1);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden selection:bg-teal-300">
      <div className="absolute top-0 left-0 right-0 h-12 bg-sand-200/90 backdrop-blur-sm border-b border-sand-400 flex items-center px-6 justify-between z-50">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl tracking-tight text-sand-900 flex items-center gap-2">
            <span className="w-4 h-4 bg-ocean-500 rounded-full inline-block"></span>
            SurfOS
          </span>
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-sand-700 ml-8">
            <button className="hover:text-ocean-700 transition-colors">System</button>
            <button className="hover:text-ocean-700 transition-colors">Games</button>
            <button className="hover:text-ocean-700 transition-colors">Tools</button>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-sand-700 font-medium">
              {profile?.first_name} {profile?.last_name.charAt(0)}.
            </span>
            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-sand-300 hover:bg-sand-400 text-sand-800 rounded border border-sand-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
          <span className="font-mono text-sand-600">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="absolute top-12 left-0 right-0 bottom-0 p-8 flex justify-between">
        <div className="flex flex-col gap-6 z-0">
          <DesktopIcon
            id="icon-snake"
            label="Snake Game"
            icon={ICONS.SNAKE}
            onClick={() => openApp(AppId.SNAKE)}
          />
          <DesktopIcon
            id="icon-brick"
            label="Brick Breaker"
            icon={ICONS.BRICK_BREAKER}
            onClick={() => openApp(AppId.BRICK_BREAKER)}
          />
          <DesktopIcon
            id="icon-meme"
            label="Meme Maker"
            icon={ICONS.MEME}
            onClick={() => openApp(AppId.MEME)}
          />
           <DesktopIcon
            id="icon-about"
            label="Read Me"
            icon={ICONS.ABOUT}
            onClick={() => openApp(AppId.ABOUT)}
          />
        </div>

        <SurfCenterpiece />

        <div className="flex flex-col gap-6 z-0">
          <DesktopIcon
            id="icon-remixer"
            label="Remixer"
            icon={ICONS.REMIXER}
            onClick={() => openApp(AppId.REMIXER)}
          />
          <DesktopIcon
            id="icon-ninety-ten"
            label="90TEN"
            icon={ICONS.NINETY_TEN}
            onClick={() => openApp(AppId.NINETY_TEN)}
          />
          <DesktopIcon
            id="icon-feedback"
            label="Feedback"
            icon={ICONS.FEEDBACK}
            onClick={() => openApp(AppId.FEEDBACK)}
          />
        </div>

        {windows.map(window => (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            isOpen={window.isOpen}
            zIndex={window.zIndex}
            initialPosition={window.position}
            width={window.width}
            onClose={() => closeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
          >
            {window.component}
          </Window>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-sand-400 rounded-full"></div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Desktop />
    </AuthProvider>
  );
};

export default App;
