import { ReactNode } from 'react';

export type CarVariant = 'sedan' | 'suv' | 'coupe' | 'convertible' | 'electric';

const dark = { fill: '#06130f', fillOpacity: 0.35 };

/** Body outline + window shapes for each body style. Wheels are shared and drawn below. */
const SHAPES: Record<CarVariant, { body: string; glass: string; extra?: ReactNode }> = {
  sedan: {
    body: 'M8 70 Q8 62 18 59 L52 52 L82 31 Q90 26 104 26 L148 26 Q162 26 171 34 L192 52 L224 58 Q232 60 232 70 L232 74 Q232 79 226 79 L14 79 Q8 79 8 74 Z',
    glass: 'M88 34 Q93 31 104 31 L108 31 L108 51 L68 53 Z M115 31 L148 31 Q155 31 160 36 L172 51 L115 51 Z',
  },
  suv: {
    body: 'M8 70 Q8 60 18 57 L44 52 L62 27 Q66 22 74 22 L170 22 Q180 22 185 28 L204 52 L224 56 Q232 58 232 68 L232 74 Q232 79 226 79 L14 79 Q8 79 8 74 Z',
    glass: 'M71 28 L108 28 L108 50 L56 51 Z M115 28 L168 28 Q173 28 176 32 L192 50 L115 50 Z',
  },
  coupe: {
    body: 'M8 70 Q8 62 18 60 L56 54 L92 36 Q100 31 114 31 L142 31 Q156 31 166 40 L190 54 L224 59 Q232 61 232 70 L232 74 Q232 79 226 79 L14 79 Q8 79 8 74 Z',
    glass: 'M97 39 Q103 35 114 35 L138 35 Q148 35 154 40 L168 53 L76 54 Z',
  },
  convertible: {
    body: 'M8 70 Q8 62 18 60 L68 55 L90 38 L97 38 L103 54 L190 53 L224 58 Q232 60 232 70 L232 74 Q232 79 226 79 L14 79 Q8 79 8 74 Z',
    glass: 'M72 54 L90 41 L95 41 L99 54 Z',
    extra: (
      <>
        <path d="M118 54 Q119 42 128 42 Q137 42 138 54 Z" {...dark} />
        <path d="M148 54 Q149 42 158 42 Q167 42 168 54 Z" {...dark} />
      </>
    ),
  },
  electric: {
    body: 'M8 70 Q8 62 18 60 L54 54 L84 34 Q94 28 112 28 L140 28 Q158 28 172 42 L194 54 L224 58 Q232 60 232 70 L232 74 Q232 79 226 79 L14 79 Q8 79 8 74 Z',
    glass: 'M91 36 Q97 32 112 32 L140 32 Q152 32 162 42 L174 53 L70 54 Z',
    extra: <path d="M127 56 L114 70 L122 70 L118 77 L132 63 L124 63 Z" fill="#f4d03f" />,
  },
};

/** Maps a vehicle category to a body style; unknown categories fall back to a sedan. */
export function variantFor(category: string): CarVariant {
  const key = category.trim().toLowerCase();
  return key in SHAPES ? (key as CarVariant) : 'sedan';
}

/** Side-view car in SVG. Colour comes from `currentColor`, so tint it with text-* classes. */
export default function CarArt({ className = '', variant = 'sedan' }: { className?: string; variant?: CarVariant }) {
  const shape = SHAPES[variant];
  return (
    <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
      <path d={shape.body} fill="currentColor" />
      <path d={shape.glass} {...dark} />
      {shape.extra}
      <circle cx="64" cy="79" r="16" fill="#0b1013" />
      <circle cx="64" cy="79" r="7" fill="#dfe6ea" />
      <circle cx="180" cy="79" r="16" fill="#0b1013" />
      <circle cx="180" cy="79" r="7" fill="#dfe6ea" />
    </svg>
  );
}
