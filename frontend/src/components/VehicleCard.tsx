import type { Vehicle } from '../types';
import CarArt, { variantFor } from './CarArt';

interface Props {
  vehicle: Vehicle;
  index?: number;
  isAdmin: boolean;
  busy: boolean;
  onPurchase: (v: Vehicle) => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
  onRestock: (v: Vehicle) => void;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Each category gets its own colour so the grid is easy to scan. Full class names so Tailwind can see them.
const TONES: Record<string, string> = {
  sedan: 'from-[#0f3d5e] to-[#3b8fd0]',
  suv: 'from-[#0d4a36] to-[#35b07a]',
  electric: 'from-[#0b3b4a] to-[#1cc5b0]',
  coupe: 'from-[#5b1d2b] to-[#e0605a]',
  convertible: 'from-[#6b3a0c] to-[#f0b04a]',
};
const tone = (category: string) => TONES[category.toLowerCase()] ?? 'from-[#1f2a30] to-[#6b7d86]';

/** The stock count is styled like a number plate. */
function StockPlate({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return <span className="rounded-md border-2 border-white bg-brake px-2.5 py-0.5 text-sm font-extrabold text-white shadow-md">Out of stock</span>;
  }
  const low = quantity <= 2;
  return (
    <span className={`rounded-md border-2 border-ink px-2.5 py-0.5 text-sm font-extrabold tracking-wide shadow-md ${low ? 'bg-signal text-white' : 'bg-plate text-ink'}`}>
      {low ? `Only ${quantity} left` : `${quantity} in stock`}
    </span>
  );
}

export default function VehicleCard({ vehicle, index = 0, isAdmin, busy, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const soldOut = vehicle.quantity === 0;
  const small = 'rounded-lg cursor-pointer border-fg/20 px-3 py-1.5 text-sm font-semibold hover:bg-fg/5';

  return (
    <article style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }} className="card-in group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_12px_32px_-14px_rgba(18,24,27,0.45)] ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-14px_rgba(18,24,27,0.5)]">
      <div className={`relative h-40 bg-gradient-to-br ${tone(vehicle.category)} ${soldOut ? 'saturate-0' : ''}`}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <span className="absolute left-4 top-3 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">{vehicle.category}</span>
        <div className="absolute right-3 top-3"><StockPlate quantity={vehicle.quantity} /></div>
        <CarArt variant={variantFor(vehicle.category)} className="absolute bottom-3 left-1/2 w-48 -translate-x-1/2 text-white transition-transform duration-300 group-hover:-translate-x-[44%] drop-shadow-[0_10px_8px_rgba(0,0,0,0.35)]" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-2xl font-extrabold leading-tight">{vehicle.make}</h3>
          <p className="text-lg text-fg/70">{vehicle.model}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight">{money.format(vehicle.price)}</p>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={() => onPurchase(vehicle)}
            disabled={soldOut || busy}
            className="w-full rounded-lg cursor-pointer bg-pine px-4 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:bg-fg/20 disabled:text-fg/50"
          >
            {busy ? 'Processing...' : soldOut ? 'Unavailable' : 'Purchase'}
          </button>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button className={small} onClick={() => onEdit(vehicle)}>Edit</button>
              <button className={small} onClick={() => onRestock(vehicle)}>Restock</button>
              <button className={`${small} border-brake/40 text-brake`} onClick={() => onDelete(vehicle)}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
