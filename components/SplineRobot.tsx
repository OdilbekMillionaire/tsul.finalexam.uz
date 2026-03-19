import React, { useState } from 'react';

const SplineRobot: React.FC = () => {
    const [dismissed, setDismissed] = useState(false);
    const [minimized, setMinimized] = useState(false);

    if (dismissed) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: minimized ? 16 : 0,
                right: minimized ? 16 : 0,
                width: minimized ? 64 : 'min(420px, 42vw)',
                height: minimized ? 64 : 'min(500px, 50vh)',
                zIndex: 50,
                borderRadius: minimized ? '50%' : '24px 0 0 0',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,33,71,0.15)',
                border: '1.5px solid rgba(196,164,132,0.3)',
                transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                background: minimized ? '#002147' : 'transparent',
                cursor: minimized ? 'pointer' : 'default',
            }}
            onClick={minimized ? () => setMinimized(false) : undefined}
        >
            {!minimized && (
                <>
                    <iframe
                        src="https://my.spline.design/nexbotrobotcharacterconcept-GMhByIfZsnPwyHWor7SGOF51/"
                        frameBorder={0}
                        title="OXFORDER AI"
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        allow="fullscreen"
                    />
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, zIndex: 10 }}>
                        <button onClick={() => setMinimized(true)} title="Minimise"
                            style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,33,71,0.75)', border: '1px solid rgba(196,164,132,0.4)', color: '#C4A484', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>─</button>
                        <button onClick={() => setDismissed(true)} title="Close"
                            style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,33,71,0.75)', border: '1px solid rgba(196,164,132,0.4)', color: '#C4A484', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: '#002147', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 14, gap: 7, zIndex: 20, pointerEvents: 'none' }}>
                      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                        <circle cx="12" cy="12" r="10" stroke="#C4A484" strokeWidth="1.5"/>
                        <path d="M8 12l3 3 5-5" stroke="#C4A484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ color: '#C4A484', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>OXFORDER AI</span>
                    </div>
                </>
            )}
            {minimized && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C4A484" strokeWidth="2" width="28" height="28">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" /><path d="M2 17L12 22L22 17" /><path d="M2 12L12 17L22 12" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default SplineRobot;
