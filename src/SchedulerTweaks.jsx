import { useEffect } from 'react';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider } from './tweaks-panel';

const TWEAK_DEFAULTS = {
  theme: 'light',
  accent: 'green',
  density: 'balanced',
  fontScale: 1,
  motion: 'on',
  pop: 'on',
};

export const SchedulerTweaks = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', t.theme);
    html.setAttribute('data-density', t.density);
    html.setAttribute('data-motion', t.motion);
    html.setAttribute('data-pop', t.pop);
    html.style.fontSize = (16 * (t.fontScale || 1)) + 'px';

    const accents = {
      green:  { brand: '#22c55e', hover: '#16a34a', press: '#15803d', soft: '#f0fdf4' },
      sky:    { brand: '#3b82f6', hover: '#2563eb', press: '#1d4ed8', soft: '#eff6ff' },
      amber:  { brand: '#f59e0b', hover: '#d97706', press: '#b45309', soft: '#fffbeb' },
      coral:  { brand: '#ef4444', hover: '#dc2626', press: '#b91c1c', soft: '#fef2f2' },
    };
    const a = accents[t.accent] || accents.green;
    html.style.setProperty('--brand', a.brand);
    html.style.setProperty('--brand-hover', a.hover);
    html.style.setProperty('--brand-press', a.press);
    html.style.setProperty('--brand-soft', a.soft);
  }, [t.theme, t.density, t.motion, t.pop, t.fontScale, t.accent]);

  return (
    <TweaksPanel title="Tweaks · Smart Scheduler">
      <TweakSection label="מראה">
        <TweakRadio label="ערכת נושא" value={t.theme} onChange={v => setTweak('theme', v)}
          options={[{ value: 'light', label: 'בהיר' }, { value: 'dark', label: 'כהה' }]} />
      </TweakSection>

      <TweakSection label="צבע מותג">
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[
            { k: 'green', c: '#22c55e', l: 'אונו' },
            { k: 'sky',   c: '#3b82f6', l: 'שמים' },
            { k: 'amber', c: '#f59e0b', l: 'ענבר' },
            { k: 'coral', c: '#ef4444', l: 'אלמוג' },
          ].map(s => (
            <button key={s.k} onClick={() => setTweak('accent', s.k)} title={s.l} style={{
              width: 28, height: 28, borderRadius: 8, border: t.accent === s.k ? '2.5px solid rgba(0,0,0,0.5)' : '2px solid transparent',
              background: s.c, cursor: 'pointer', fontSize: 12, color: 'white', lineHeight: 1,
            }}>
              {t.accent === s.k ? '✓' : ''}
            </button>
          ))}
        </div>
      </TweakSection>

      <TweakSection label="פריסה">
        <TweakRadio label="צפיפות" value={t.density} onChange={v => setTweak('density', v)}
          options={[
            { value: 'compact', label: 'צפוף' },
            { value: 'balanced', label: 'מאוזן' },
            { value: 'cozy', label: 'נעים' },
          ]} />
        <TweakSlider label="גודל טקסט" value={t.fontScale} onChange={v => setTweak('fontScale', v)}
          min={0.85} max={1.2} step={0.05} formatValue={v => `${Math.round(v * 100)}%`} />
      </TweakSection>

      <TweakSection label="אנרגיה">
        <TweakRadio label="אנימציות" value={t.motion} onChange={v => setTweak('motion', v)}
          options={[{ value: 'on', label: 'פעיל' }, { value: 'off', label: 'כבוי' }]} />
        <TweakRadio label="לחיצת Pop" value={t.pop} onChange={v => setTweak('pop', v)}
          options={[{ value: 'on', label: 'פעיל' }, { value: 'off', label: 'שטוח' }]} />
      </TweakSection>
    </TweaksPanel>
  );
};
