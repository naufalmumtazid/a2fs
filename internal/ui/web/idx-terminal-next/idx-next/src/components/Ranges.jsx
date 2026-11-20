'use client';

import { RANGES } from '@/data/stocks';

export default function Ranges({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {RANGES.map(([label]) => (
        <button key={label} className={'btn ' + (value === label ? 'on' : '')} onClick={() => onChange(label)}>
          {label}
        </button>
      ))}
    </div>
  );
}
