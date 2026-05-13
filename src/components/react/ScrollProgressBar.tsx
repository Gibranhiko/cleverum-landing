import { useScrollProgress } from './useScrollProgress';

export default function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 2,
        zIndex: 60,
        pointerEvents: 'none',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background:
            'linear-gradient(90deg, var(--color-brand-blue), var(--color-brand-iris), var(--color-brand-grape))',
          transform: 'translateZ(0)',
          willChange: 'width',
        }}
      />
    </div>
  );
}
