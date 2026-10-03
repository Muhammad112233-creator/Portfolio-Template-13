import { useCallback, useEffect, useRef, useState } from 'react';
import WorldCanvas from './components/WorldCanvas.jsx';
import Hud from './components/Hud.jsx';
import Modals from './components/Modals.jsx';
import { PROFILE, STOPS } from './content/portfolio.js';
import { playTap, setAmbience } from './lib/audio.js';

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function LoadingScreen({ percent }) {
  const filled = Math.round(percent / 100 * 12);
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-label={`Preparing the portfolio, ${percent} percent`}>
      <div className="loading-vignette" />
      <div className="loading-mark"><span className="loading-house">⌂</span><span>MADE TO BE WANDERED</span></div>
      <div className="loading-message">
        <span className="loading-eyebrow">{percent < 42 ? 'THE PATH IS QUIET' : percent < 84 ? 'LIGHTS COMING ON' : 'COME ON IN'}</span>
        <h1>The Long Way Home</h1>
        <p>A small portfolio with room to look around.</p>
      </div>
      <div className="loading-meter">
        <div className="loading-meter-label"><span>SETTING THE SCENE</span><span>{String(percent).padStart(2, '0')}%</span></div>
        <div className="loading-meter-track" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} className={index < filled ? 'filled' : ''} />)}</div>
      </div>
      <div className="loading-footer"><span>WOOD · PAPER · A LITTLE MOONLIGHT</span><span>01 / 08</span></div>
    </div>
  );
}

function App() {
  const [progress, setProgress] = useState(0);
  const [modal, setModal] = useState(null);
  const [floor, setFloor] = useState('lower');
  const [helpOpen, setHelpOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [tipsVisible, setTipsVisible] = useState(true);
  const [worldReady, setWorldReady] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const touchStart = useRef(null);
  const loadingTimer = useRef(null);
  const activeStopIndex = Math.round(progress * (STOPS.length - 1));
  const activeStop = STOPS[activeStopIndex];

  const setJourney = useCallback((next) => {
    setProgress((current) => clamp(typeof next === 'function' ? next(current) : next));
  }, []);

  const moveToStop = useCallback((index) => {
    const next = Math.max(0, Math.min(STOPS.length - 1, index));
    setJourney(next / (STOPS.length - 1));
    setFloor(STOPS[next].floor === 'upper' ? 'upper' : 'lower');
    setTipsVisible(false);
    setModal(null);
    document.body.classList.remove('art-hover');
  }, [setJourney]);

  const moveByStop = useCallback((direction) => {
    moveToStop(activeStopIndex + direction);
  }, [activeStopIndex, moveToStop]);

  const openProject = useCallback((project) => {
    if (!project) return;
    setTipsVisible(false);
    setModal({ type: 'project', data: project });
  }, []);

  const openModal = useCallback((type, data) => {
    setTipsVisible(false);
    if (type === 'map') setFloor(activeStop.floor === 'upper' ? 'upper' : 'lower');
    setModal({ type, data });
  }, [activeStop.floor]);

  const closeModal = useCallback(() => {
    setModal(null);
    document.body.classList.remove('art-hover');
  }, []);

  const toggleSound = useCallback(async () => {
    const nextMuted = !muted;
    const available = await setAmbience(!nextMuted);
    setMuted(available ? nextMuted : true);
    if (available && !nextMuted) playTap();
  }, [muted]);

  const runAction = useCallback((action) => {
    playTap();
    if (action === 'map') openModal('map');
    if (action === 'citations') openModal('citations');
    if (action === 'route') openModal('route');
    if (action === 'sound') void toggleSound();
    if (action === 'help') setHelpOpen((value) => !value);
    if (action === 'home') {
      setProgress(0);
      setModal(null);
      setFloor('lower');
      setTipsVisible(false);
    }
  }, [openModal, toggleSound]);

  useEffect(() => {
    if (!worldReady) return undefined;
    const id = window.setInterval(() => setLoadingPercent((value) => Math.min(100, value + 8)), 42);
    return () => window.clearInterval(id);
  }, [worldReady]);

  useEffect(() => {
    if (loadingPercent < 100) return undefined;
    loadingTimer.current = window.setTimeout(() => setIsLoading(false), 330);
    return () => window.clearTimeout(loadingTimer.current);
  }, [loadingPercent]);

  useEffect(() => {
    if (worldReady) return undefined;
    const id = window.setInterval(() => setLoadingPercent((value) => Math.min(91, value + 3)), 70);
    return () => window.clearInterval(id);
  }, [worldReady]);

  useEffect(() => {
    const handleWheel = (event) => {
      if (isLoading || modal || helpOpen) return;
      event.preventDefault();
      const movement = event.deltaY / Math.max(850, window.innerHeight * 1.7);
      setJourney((current) => current + movement);
      setTipsVisible(false);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [helpOpen, isLoading, modal, setJourney]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const onControl = event.target instanceof HTMLElement && Boolean(event.target.closest('button, a, input, textarea, select, [contenteditable="true"]'));
      if (key === 'escape') {
        if (modal) { event.preventDefault(); closeModal(); }
        else if (helpOpen) setHelpOpen(false);
        return;
      }
      if (modal) {
        if (modal.type === 'map' && key === 'h') setFloor((current) => current === 'lower' ? 'upper' : 'lower');
        return;
      }
      if (onControl || isLoading) return;
      if (key === 'arrowdown' || key === 'pagedown' || key === ' ') {
        event.preventDefault(); moveByStop(1);
      } else if (key === 'arrowup' || key === 'pageup') {
        event.preventDefault(); moveByStop(-1);
      } else if (key === 'a' || key === 'arrowleft') {
        event.preventDefault(); moveByStop(-1);
      } else if (key === 'd' || key === 'arrowright') {
        event.preventDefault(); moveByStop(1);
      } else if (key === 'f') {
        event.preventDefault(); openModal('map');
      } else if (key === 'c') {
        event.preventDefault(); openModal('citations');
      } else if (key === 'r') {
        event.preventDefault(); openModal('route');
      } else if (key === 'm') {
        event.preventDefault(); void toggleSound();
      } else if (key === 'h') {
        setHelpOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal, helpOpen, isLoading, modal, moveByStop, openModal, toggleSound]);

  useEffect(() => {
    const start = (event) => {
      if (modal || isLoading || event.touches.length !== 1) return;
      touchStart.current = event.touches[0].clientY;
    };
    const move = (event) => {
      if (modal || isLoading || touchStart.current === null || event.touches.length !== 1) return;
      const nextY = event.touches[0].clientY;
      const difference = touchStart.current - nextY;
      if (Math.abs(difference) < 2) return;
      event.preventDefault();
      setJourney((current) => current + difference / Math.max(680, window.innerHeight * 1.65));
      touchStart.current = nextY;
      setTipsVisible(false);
    };
    const end = () => { touchStart.current = null; };
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end, { passive: true });
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, [isLoading, modal, setJourney]);

  const handleReady = useCallback(() => setWorldReady(true), []);
  const noteStop = useCallback(() => openModal('note', activeStop), [activeStop, openModal]);
  const isProject = modal?.type === 'project';

  return (
    <main className={`portfolio-app ${isLoading ? 'is-loading' : ''} ${modal ? 'has-modal' : ''}`}>
      <a className="skip-link" href="#portfolio-controls">Skip to portfolio controls</a>
      <WorldCanvas progress={progress} onProjectOpen={openProject} onReady={handleReady} />
      <div className="scene-grain" aria-hidden="true" />
      <div className="scene-vignette" aria-hidden="true" />
      {!isLoading && (
        <Hud
          progress={progress}
          activeStop={activeStop}
          muted={muted}
          helpOpen={helpOpen}
          tipsVisible={tipsVisible}
          onAction={runAction}
          onMove={moveByStop}
          onReadStop={noteStop}
          onDismissTips={() => setTipsVisible(false)}
        />
      )}
      <div id="portfolio-controls" className="sr-only">Interactive portfolio by {PROFILE.name}. {activeStop.title}, {Math.round(progress * 100)} percent through the house tour. Use scroll, A and D, or the map to move between rooms.</div>
      {modal && <Modals modal={modal} onClose={closeModal} activeStopIndex={activeStopIndex} floor={floor} setFloor={setFloor} onTeleport={moveToStop} />}
      {isProject && <span className="sr-only" aria-live="polite">Project details opened: {modal.data.name}</span>}
      {isLoading && <LoadingScreen percent={loadingPercent} />}
    </main>
  );
}

export default App;
