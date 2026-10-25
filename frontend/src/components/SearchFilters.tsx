import { EMPTY_FILTERS, Filters } from '../types';
import { inputClass } from './Field';

interface Props { filters: Filters; categories: string[]; onChange: (f: Filters) => void }

export default function SearchFilters({ filters, categories, onChange }: Props) {
  const set = (key: keyof Filters) => (e: { target: { value: string } }) => onChange({ ...filters, [key]: e.target.value });
  const active = Object.values(filters).some((v) => v !== '');
  const label = 'mb-1 block text-sm font-semibold';

  const chip = (selected: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-bold transition ${selected ? 'bg-fg text-surface shadow-md' : 'bg-fg/5 text-fg/70 hover:bg-fg/10'}`;

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="space-y-4 rounded-2xl bg-surface/90 p-4 shadow-md ring-1 ring-black/5 backdrop-blur">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div>
          <label htmlFor="s-make" className={label}>Make</label>
          <input id="s-make" className={inputClass} value={filters.make} onChange={set('make')} placeholder="Toyota" />
        </div>
        <div>
          <label htmlFor="s-model" className={label}>Model</label>
          <input id="s-model" className={inputClass} value={filters.model} onChange={set('model')} placeholder="Corolla" />
        </div>
        <div>
          <label htmlFor="s-min" className={label}>Min price</label>
          <input id="s-min" type="number" min="0" className={inputClass} value={filters.minPrice} onChange={set('minPrice')} placeholder="0" />
        </div>
        <div>
          <label htmlFor="s-max" className={label}>Max price</label>
          <input id="s-max" type="number" min="0" className={inputClass} value={filters.maxPrice} onChange={set('maxPrice')} placeholder="50000" />
        </div>
        <div className="col-span-2 flex items-end md:col-span-1">
          <button
            type="button"
            disabled={!active}
            onClick={() => onChange(EMPTY_FILTERS)}
            className="w-full rounded-lg border border-fg/25 px-3 py-2.5 font-semibold hover:bg-fg/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button type="button" aria-pressed={filters.category === ''} className={chip(filters.category === '')} onClick={() => onChange({ ...filters, category: '' })}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} type="button" aria-pressed={filters.category === c} className={chip(filters.category === c)} onClick={() => onChange({ ...filters, category: c })}>
            {c}
          </button>
        ))}
      </div>
    </form>
  );
}
