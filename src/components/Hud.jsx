import { PROFILE } from '../content/portfolio.js';

export function Icon({ name, size = 22 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'square', strokeLinejoin: 'miter', 'aria-hidden': true };
  if (name === 'house') return <svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5.7 9.4V21h12.6V9.4M9.3 21v-6.4h5.4V21"/><path d="M17 5.5V3h2.7v4.7"/></svg>;
  if (name === 'map') return <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/><path d="M11.2 10.8c0-1.6 2.2-1.7 2.2 0 0 1.2-1.1 1.9-1.1 1.9s-1.1-.8-1.1-1.9Z"/></svg>;
  if (name === 'book') return <svg {...common}><path d="M4 4.5c2.9-.8 5.5-.3 8 1.3v15c-2.5-1.6-5.1-2.1-8-1.3z"/><path d="M20 4.5c-2.9-.8-5.5-.3-8 1.3v15c2.5-1.6 5.1-2.1 8-1.3z"/><path d="M6.5 8h3m5-.1h3M6.5 11h3m5-.1h3"/></svg>;
  if (name === 'route') return <svg {...common}><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h3.2c2 0 2.3-2.2 2.3-4s.3-4 2.3-4H17"/><path d="m11.5 7.6 2 2.4-2 2.4"/></svg>;
  if (name === 'sound-on') return <svg {...common}><path d="M4 10v4h3.2l4.3 3.5v-15L7.2 6H4z"/><path d="M15 9a4.5 4.5 0 0 1 0 6m2.3-8.5a8 8 0 0 1 0 11"/></svg>;
  if (name === 'sound-off') return <svg {...common}><path d="M4 10v4h3.2l4.3 3.5v-15L7.2 6H4z"/><path d="m16 9 5 6m0-6-5 6"/></svg>;
  if (name === 'arrow-left') return <svg {...common}><path d="M19 12H5m0 0 6-6m-6 6 6 6"/></svg>;
  if (name === 'arrow-right') return <svg {...common}><path d="M5 12h14m0 0-6-6m6 6-6 6"/></svg>;
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if (name === 'info') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg>;
  return null;
}

function HudButton({ icon, label, hint, onClick, active, className = '', ariaLabel = label }) {
  return (
    <button
      type="button"
      className={`hud-button ${active ? 'is-active' : ''} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      title={hint || label}
    >
      <span className="hud-button-icon"><Icon name={icon} /></span>
      <span className="hud-button-label">{label}</span>
    </button>
  );
}

export default function Hud({
  progress,
  activeStop,
  muted,
  helpOpen,
  tipsVisible,
  onAction,
  onMove,
  onReadStop,
  onDismissTips,
}) {
  const filledSegments = Math.round(progress * 12);
  return (
    <div className="hud-layer">
      <div className="brand-lockup">
        <button type="button" className="home-button" onClick={() => onAction('home')} aria-label="Return to the front gate" title="Back to the front gate">
          <Icon name="house" size={25} />
        </button>
        <div className="brand-copy">
          <span className="brand-title">THE LONG WAY HOME</span>
          <span className="brand-subtitle">A PORTFOLIO BY {PROFILE.shortName}</span>
        </div>
      </div>

      <nav className="quick-actions" aria-label="Portfolio tools">
        <HudButton icon="map" label="Teleport" hint="Fast travel · F" onClick={() => onAction('map')} />
        <HudButton icon="book" label="Citations" hint="Credits and materials · C" onClick={() => onAction('citations')} />
        <HudButton icon="route" label="Road map" hint="A note on the route · R" onClick={() => onAction('route')} />
        <HudButton icon={muted ? 'sound-off' : 'sound-on'} label="Mute" ariaLabel={muted ? 'Turn ambience on' : 'Mute ambience'} hint="Toggle the quiet night ambience · M" onClick={() => onAction('sound')} active={!muted} />
      </nav>

      <div className={`description-wrap ${helpOpen ? 'is-open' : ''}`}>
        <button type="button" className="description-toggle" onClick={() => onAction('help')} aria-expanded={helpOpen}>
          <span className="description-led" />
          {helpOpen ? 'Close field guide' : 'Button descriptions'}
          <span className="description-chevron">{helpOpen ? '−' : '+'}</span>
        </button>
        {helpOpen && (
          <div className="description-panel">
            <p><kbd>SCROLL</kbd> or swipe to follow the path</p>
            <p><kbd>A</kbd> / <kbd>D</kbd> skip between stops</p>
            <p><kbd>F</kbd> opens the map · <kbd>H</kbd> swaps floors there · <kbd>M</kbd> toggles ambience</p>
            <p>Click a glowing frame for a project note. <kbd>ESC</kbd> closes a window.</p>
          </div>
        )}
      </div>

      {tipsVisible && (
        <aside className="first-visit-tip" aria-label="First visit hint">
          <div className="tip-copy">
            <span className="tip-kicker">A SMALL POINTER</span>
            <span className="tip-headline">Look for the lit frames.</span>
            <span className="tip-note">They open the stories behind each project.</span>
          </div>
          <button type="button" className="tip-close" onClick={onDismissTips} aria-label="Dismiss tip"><Icon name="close" size={16} /></button>
        </aside>
      )}

      <div className="location-note" aria-live="polite" aria-atomic="true">
        <span className="location-number">{activeStop.number} / 07</span>
        <span className="location-copy">
          <span className="location-kicker">{activeStop.kicker}</span>
          <span className="location-title">{activeStop.title}</span>
          <span className="location-label">{activeStop.label}</span>
          <button type="button" className="read-note-button" onClick={onReadStop}>Read this note <span>↗</span></button>
        </span>
      </div>

      <div className="movement-hint" aria-hidden="true">
        <span className="movement-glyph">↕</span>
        <span><b>SCROLL</b> TO WANDER</span>
        <span className="movement-divider">·</span>
        <span><b>A / D</b> TO SKIP</span>
      </div>

      <div className="progress-dock" aria-label={`Journey progress ${Math.round(progress * 100)} percent`}>
        <div className="progress-meta">
          <span>THE HOUSE TOUR</span>
          <span>{activeStop.number} — 07</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          {Array.from({ length: 12 }, (_, index) => <span key={index} className={`progress-segment ${index < filledSegments ? 'filled' : ''}`} />)}
        </div>
        <span className="progress-percent">{Math.round(progress * 100)}<small>%</small></span>
      </div>

      <div className="mobile-move-controls" aria-label="Move between stops">
        <button type="button" onClick={() => onMove(-1)} aria-label="Previous stop"><Icon name="arrow-left" size={26} /></button>
        <span>MOVE</span>
        <button type="button" onClick={() => onMove(1)} aria-label="Next stop"><Icon name="arrow-right" size={26} /></button>
      </div>

      <div className="world-signature"><span className="signature-dot" /> BUILT SLOWLY · LEFT A LIGHT ON</div>
    </div>
  );
}
