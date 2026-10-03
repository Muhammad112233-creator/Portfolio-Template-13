import { useEffect, useRef } from 'react';
import { PROFILE, PROJECTS, ROUTE_NOTES, STOPS } from '../content/portfolio.js';
import { Icon } from './Hud.jsx';

function ModalFrame({ eyebrow, title, onClose, children, size = '' }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`modal-window ${size}`} role="dialog" aria-modal="true" aria-label={title} data-lock-scroll="true">
        <header className="modal-header">
          <div className="modal-heading">
            <span className="modal-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Close window" title="Close · Esc">
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        <div className="modal-footline"><span>THE LONG WAY HOME</span><span>ESC TO CLOSE</span></div>
      </section>
    </div>
  );
}

const FLOOR_STOPS = {
  lower: [0, 1, 2, 3],
  upper: [4, 5, 6, 7],
};

function FloorPlan({ floor, activeStopIndex, onTeleport }) {
  const stops = FLOOR_STOPS[floor];
  const nodes = floor === 'lower'
    ? [
      { id: 1, x: 88, y: 225, label: 'PORCH' },
      { id: 2, x: 202, y: 153, label: 'LIVING ROOM' },
      { id: 3, x: 399, y: 153, label: 'KITCHEN TABLE' },
    ]
    : [
      { id: 4, x: 105, y: 206, label: 'LANDING' },
      { id: 5, x: 253, y: 146, label: 'READING NOOK' },
      { id: 6, x: 400, y: 146, label: 'STUDIO' },
      { id: 7, x: 424, y: 61, label: 'WINDOW SEAT' },
    ];
  return (
    <svg className="floor-plan" viewBox="0 0 520 290" role="img" aria-label={`${floor === 'lower' ? 'Lower floor' : 'Upper floor'} map. Choose a stop to travel there.`}>
      <defs>
        <pattern id={`paper-${floor}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 11.5H12M11.5 0V12" stroke="#8c8169" strokeOpacity=".14" strokeWidth=".5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="520" height="290" rx="4" fill="#d0c7ac" />
      <rect x="0" y="0" width="520" height="290" rx="4" fill={`url(#paper-${floor})`} />
      <path d="M38 236h51V102h75V60h318v188H89" fill="none" stroke="#83735b" strokeWidth="2" strokeDasharray="6 6" />
      {floor === 'lower' ? (
        <g className="floor-rooms">
          <path d="M62 93H185V212H62zM185 93H312V212H185zM312 93H455V212H312z" fill="#b9ad90" stroke="#6d604d" strokeWidth="4" />
          <path d="M62 220H185V253H62z" fill="#c2b28f" stroke="#6d604d" strokeWidth="4" />
          <path d="M185 213h127M312 213h143" stroke="#8b7c62" strokeWidth="3" strokeDasharray="3 7" />
          <path d="M76 106h92M202 106h95M330 106h107" stroke="#dfd5bb" strokeWidth="3" />
          <text x="124" y="132">PORCH</text><text x="211" y="139">LIVING</text><text x="338" y="139">KITCHEN</text><text x="208" y="179">THE HOUSE</text>
          <rect x="212" y="164" width="73" height="20" rx="2" fill="#93856a" opacity=".45" />
          <rect x="102" y="228" width="94" height="8" fill="#9b8767" />
        </g>
      ) : (
        <g className="floor-rooms">
          <path d="M58 88H177V211H58zM177 88H317V211H177zM317 88H457V211H317z" fill="#b9ad90" stroke="#6d604d" strokeWidth="4" />
          <path d="M317 36H457V88H317z" fill="#c2b28f" stroke="#6d604d" strokeWidth="4" />
          <path d="M80 104h74M198 104h96M336 104h101M335 51h101" stroke="#dfd5bb" strokeWidth="3" />
          <text x="89" y="137">LANDING</text><text x="204" y="137">READING</text><text x="360" y="137">STUDIO</text><text x="333" y="63">WINDOW</text>
          <path d="M60 224h100v20H60z" fill="#9d8d6d" stroke="#6d604d" strokeWidth="3" />
          <path d="M88 212v-8m14 8v-8m14 8v-8m14 8v-8m14 8v-8" stroke="#645540" strokeWidth="2" />
        </g>
      )}
      <path d={floor === 'lower' ? 'M88 225 88 153 202 153 399 153' : 'M105 206 105 146 253 146 400 146 424 61'} fill="none" stroke="#b85f39" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
      {nodes.map((node) => {
        const isCurrent = node.id === activeStopIndex;
        return (
          <g
            key={node.id}
            role="button"
            tabIndex="0"
            aria-label={`Travel to ${STOPS[node.id].title}`}
            className={`map-node ${isCurrent ? 'is-current' : ''}`}
            onClick={() => onTeleport(node.id)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onTeleport(node.id); } }}
          >
            <circle cx={node.x} cy={node.y} r="16" className="map-node-halo" />
            <circle cx={node.x} cy={node.y} r="9" className="map-node-dot" />
            <text x={node.x} y={node.y + 31} className="map-node-label">{STOPS[node.id].number} · {node.label}</text>
          </g>
        );
      })}
      <g className="map-compass" transform="translate(475 248)"><path d="m0-15 6 15-6-4-6 4z"/><text x="0" y="23">N</text></g>
    </svg>
  );
}

function TravelModal({ onClose, activeStopIndex, floor, setFloor, onTeleport }) {
  const stops = floor === 'lower' ? FLOOR_STOPS.lower : FLOOR_STOPS.upper;
  return (
    <ModalFrame eyebrow="FAST TRAVEL · PICK A ROOM" title="The house map" onClose={onClose} size="map-window">
      <div className="map-intro"><span>Eight stops. No wrong turn.</span><span>Current stop: <b>{STOPS[activeStopIndex].title}</b></span></div>
      <div className="floor-switch" role="tablist" aria-label="Choose a floor">
        <button type="button" role="tab" aria-selected={floor === 'lower'} className={floor === 'lower' ? 'selected' : ''} onClick={() => setFloor('lower')}>
          <span>01</span> LOWER FLOOR
        </button>
        <button type="button" role="tab" aria-selected={floor === 'upper'} className={floor === 'upper' ? 'selected' : ''} onClick={() => setFloor('upper')}>
          <span>02</span> UPPER FLOOR
        </button>
      </div>
      <div className="map-layout">
        <div className="map-paper"><FloorPlan floor={floor} activeStopIndex={activeStopIndex} onTeleport={onTeleport} /><div className="map-scale">MAP NOT TO SCALE · MADE FOR WANDERING</div></div>
        <div className="map-stop-list">
          <span className="map-list-heading">THIS FLOOR</span>
          {stops.map((index) => (
            <button type="button" key={index} onClick={() => onTeleport(index)} className={`map-stop ${activeStopIndex === index ? 'is-current' : ''}`}>
              <span className="map-stop-num">{STOPS[index].number}</span>
              <span className="map-stop-copy"><b>{STOPS[index].title}</b><small>{STOPS[index].label}</small></span>
              <span className="map-stop-arrow">↗</span>
            </button>
          ))}
          {floor === 'lower' && <button type="button" onClick={() => onTeleport(0)} className={`map-stop ${activeStopIndex === 0 ? 'is-current' : ''}`}><span className="map-stop-num">00</span><span className="map-stop-copy"><b>The front gate</b><small>Start at the path</small></span><span className="map-stop-arrow">↗</span></button>}
          <p className="map-help"><kbd>A</kbd> / <kbd>D</kbd> move between neighbouring stops</p>
        </div>
      </div>
    </ModalFrame>
  );
}

function CreditsModal({ onClose }) {
  const credits = [
    { number: '01', title: 'The house', text: 'Built from hand-placed, procedural Three.js meshes. The rooms, lanterns, and little block illustrations were made for this template; no source-site models or photographs are bundled.' },
    { number: '02', title: 'The pictures', text: 'The framed project art is drawn locally with Canvas, then mapped onto planes in the scene. Swap the project data in src/content/portfolio.js to make the walls yours.' },
    { number: '03', title: 'The stack', text: 'React, Vite, Three.js, and React Three Fiber. The reference lists Blender in its tool stack; this template keeps the model procedural, so there is no Blender export to install or maintain.' },
    { number: '04', title: 'Type', text: 'Silkscreen is served locally from the included font files. It is distributed under the SIL Open Font License; the license text is in public/fonts/OFL-silkscreen.txt.' },
  ];
  return (
    <ModalFrame eyebrow="CREDITS · MATERIALS · TOOLS" title="What went into it" onClose={onClose} size="credits-window">
      <p className="modal-lede">A note on the materials, not a mystery list of borrowed assets.</p>
      <div className="credit-grid">
        {credits.map((credit) => <article className="credit-card" key={credit.number}><span className="credit-number">{credit.number}</span><h3>{credit.title}</h3><p>{credit.text}</p></article>)}
      </div>
      <div className="credit-bottom"><span className="credit-swatch wood"/><span className="credit-swatch moss"/><span className="credit-swatch lamp"/><span>Palette sampled from old timber, moss, and late-night windows.</span></div>
    </ModalFrame>
  );
}

function RouteModal({ onClose, activeStopIndex, onTeleport }) {
  return (
    <ModalFrame eyebrow="ROAD MAP · A FEW THOUGHTS" title="How the route came together" onClose={onClose} size="route-window">
      <div className="route-opening"><span className="route-stamp">FIELD NOTES<br />NO. 08</span><p>The house is less a building than a way to keep a portfolio from feeling like a filing cabinet. Each room has a reason to be here; each turn gives the work a little context.</p></div>
      <div className="route-notes">
        {ROUTE_NOTES.map((note, index) => <article className="route-note" key={note.title}><span className="route-note-index">0{index + 1}</span><div><h3>{note.title}</h3><p>{note.text}</p></div></article>)}
      </div>
      <div className="route-current"><span>YOU ARE HERE · {STOPS[activeStopIndex].title.toUpperCase()}</span><button type="button" onClick={() => onTeleport(Math.min(activeStopIndex + 1, STOPS.length - 1))}>Take the next step <span>→</span></button></div>
    </ModalFrame>
  );
}

function ProjectArt({ project }) {
  return (
    <div className={`project-art-panel motif-${project.motif}`} aria-hidden="true">
      <span className="art-label">FIELD NOTE / {project.number}</span>
      <div className="art-scene">
        {project.motif === 'sunrise' && <><i className="art-sun"/><i className="art-roof"/><i className="art-window"/><i className="art-land"/></>}
        {project.motif === 'clouds' && <><i className="art-cloud one"/><i className="art-cloud two"/><i className="art-horizon"/><i className="art-rain"/></>}
        {project.motif === 'atlas' && <><i className="atlas-mark"/><i className="atlas-trail"/><i className="atlas-dot a"/><i className="atlas-dot b"/><i className="atlas-dot c"/></>}
      </div>
      <span className="art-title">{project.name}</span>
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  return (
    <ModalFrame eyebrow={`${project.number} · ${project.category}`} title={project.name} onClose={onClose} size="project-window">
      <div className="project-layout">
        <div className="project-art-wrap"><ProjectArt project={project} /><span className="art-side-note">A WORKING NOTE<br />FROM THE STUDIO</span></div>
        <div className="project-copy">
          <span className="project-subtitle">{project.subtitle}</span>
          <p className="project-summary">{project.summary}</p>
          <div className="project-meta"><div><span>MY PART</span><b>{project.role}</b></div><div><span>WHEN</span><b>{project.category.split('·').at(-1).trim()}</b></div></div>
          <p className="project-detail">{project.detail}</p>
          <div className="project-result"><span>WHAT CHANGED</span><p>{project.result}</p></div>
          <a className="project-contact-link" href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(`A note about ${project.name}`)}`}>Ask me about this project <span>↗</span></a>
        </div>
      </div>
    </ModalFrame>
  );
}

function NoteModal({ stop, onClose, onTeleport }) {
  return (
    <ModalFrame eyebrow={`${stop.number} · ${stop.kicker}`} title={stop.title} onClose={onClose} size="note-window">
      <div className="note-layout">
        <div className="note-number-plate"><span>{stop.number}</span><i>THE<br />HOUSE<br />NOTES</i></div>
        <div className="note-copy"><p className="note-label">{stop.label}</p><p>{stop.note}</p>
          {stop.id === 'window' ? <a className="project-contact-link" href={`mailto:${PROFILE.email}`}>Write to {PROFILE.shortName.toLowerCase()} <span>↗</span></a> : <button className="project-contact-link as-button" type="button" onClick={() => onTeleport(Math.min(STOPS.indexOf(stop) + 1, STOPS.length - 1))}>Keep wandering <span>→</span></button>}
        </div>
      </div>
    </ModalFrame>
  );
}

export default function Modals({ modal, onClose, activeStopIndex, floor, setFloor, onTeleport }) {
  if (!modal) return null;
  if (modal.type === 'map') return <TravelModal onClose={onClose} activeStopIndex={activeStopIndex} floor={floor} setFloor={setFloor} onTeleport={onTeleport} />;
  if (modal.type === 'citations') return <CreditsModal onClose={onClose} />;
  if (modal.type === 'route') return <RouteModal onClose={onClose} activeStopIndex={activeStopIndex} onTeleport={onTeleport} />;
  if (modal.type === 'project') return <ProjectModal project={modal.data} onClose={onClose} />;
  if (modal.type === 'note') return <NoteModal stop={modal.data} onClose={onClose} onTeleport={onTeleport} />;
  return null;
}
