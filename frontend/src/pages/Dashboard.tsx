import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage, vehicleApi } from '../api';
import ConfirmDelete from '../components/ConfirmDelete';
import CarArt from '../components/CarArt';
import Navbar from '../components/Navbar';
import RestockModal from '../components/RestockModal';
import SearchFilters from '../components/SearchFilters';
import VehicleCard from '../components/VehicleCard';
import VehicleFormModal from '../components/VehicleFormModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EMPTY_FILTERS, Filters, Vehicle } from '../types';

/** Returns `value` after it has stopped changing for `ms` (avoids one request per keystroke). */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { notify } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const debounced = useDebounced(filters, 300);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const [editing, setEditing] = useState<Vehicle | 'new' | null>(null);
  const [restocking, setRestocking] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const latest = useRef(0); // ignore responses from outdated requests

  const load = useCallback(async () => {
    const requestId = ++latest.current;
    setLoading(true);
    setLoadError('');
    try {
      const filtered = Object.values(debounced).some((v) => v.trim() !== '');
      const result = filtered ? await vehicleApi.search(debounced) : await vehicleApi.list();
      if (requestId !== latest.current) return;
      setVehicles(result);
      // Category options only ever grow, so filtering by one never hides the others.
      setCategories((prev) => Array.from(new Set([...prev, ...result.map((v) => v.category)])).sort());
    } catch (err) {
      if (requestId === latest.current) setLoadError(errorMessage(err));
    } finally {
      if (requestId === latest.current) setLoading(false);
    }
  }, [debounced]);

  useEffect(() => { load(); }, [load]);

  async function purchase(v: Vehicle) {
    setBusyId(v.id);
    try {
      const updated = await vehicleApi.purchase(v.id);
      setVehicles((list) => list.map((x) => (x.id === updated.id ? updated : x))); // show new stock immediately
      notify('success', `You bought a ${v.make} ${v.model}.`);
    } catch (err) {
      notify('error', errorMessage(err));
      load(); // stock may have changed under us, so refresh
    } finally {
      setBusyId(null);
    }
  }

  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#05110d] via-[#0a3d2f] to-[#14a07a] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
          <CarArt variant="coupe" className="pointer-events-none absolute -bottom-2 right-4 hidden w-80 text-white/15 md:block" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 className="text-4xl font-extrabold">Inventory</h1>
              <p className="mt-1 text-white/75">{loading ? 'Loading vehicles...' : 'Pick a car, buy it in one click.'}</p>
              <div className="mt-5 flex gap-3">
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                  <p className="text-2xl font-extrabold leading-none">{vehicles.length}</p>
                  <p className="text-xs text-white/70">vehicles shown</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                  <p className="text-2xl font-extrabold leading-none">{vehicles.reduce((n, v) => n + v.quantity, 0)}</p>
                  <p className="text-xs text-white/70">units in stock</p>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => setEditing('new')} className="rounded-lg cursor-pointer bg-plate px-5 py-3 font-bold text-ink shadow-lg hover:brightness-95">
                Add vehicle
              </button>
            )}
          </div>
        </section>

        <SearchFilters filters={filters} categories={categories} onChange={setFilters} />

        {loadError ? (
          <div role="alert" className="rounded-xl border-2 border-brake bg-surface p-6">
            <p className="font-bold text-brake">{loadError}</p>
            <button onClick={load} className="mt-3 rounded-md bg-fg px-4 py-2 font-semibold text-surface">Try again</button>
          </div>
        ) : loading && vehicles.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-fg/10" />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-xl bg-surface p-10 text-center">
            <p className="text-xl font-bold">{hasFilters ? 'No vehicles match those filters.' : 'The lot is empty.'}</p>
            <p className="mt-1 text-fg/70">
              {hasFilters ? 'Widen the price range or clear a filter.' : isAdmin ? 'Add the first vehicle to get started.' : 'Check back soon.'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {vehicles.map((v, i) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                index={i}
                isAdmin={isAdmin}
                busy={busyId === v.id}
                onPurchase={purchase}
                onEdit={setEditing}
                onRestock={setRestocking}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </main>

      {editing && <VehicleFormModal vehicle={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={load} />}
      {restocking && <RestockModal vehicle={restocking} onClose={() => setRestocking(null)} onSaved={load} />}
      {deleting && <ConfirmDelete vehicle={deleting} onClose={() => setDeleting(null)} onDeleted={load} />}
    </>
  );
}
