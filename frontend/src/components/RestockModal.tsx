import { FormEvent, useState } from 'react';
import { errorMessage, vehicleApi } from '../api';
import { useToast } from '../context/ToastContext';
import type { Vehicle } from '../types';
import Field from './Field';
import Modal from './Modal';

interface Props { vehicle: Vehicle; onClose: () => void; onSaved: () => void }

export default function RestockModal({ vehicle, onClose, onSaved }: Props) {
  const { notify } = useToast();
  const [amount, setAmount] = useState('1');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isInteger(n) || n < 1) return setError('Enter a whole number of at least 1.');
    setSaving(true);
    try {
      const updated = await vehicleApi.restock(vehicle.id, n);
      notify('success', `${updated.make} ${updated.model} now has ${updated.quantity} in stock.`);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={`Restock ${vehicle.make} ${vehicle.model}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm text-fg/70">Currently {vehicle.quantity} in stock.</p>
        <Field label="Units to add" type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        {error && <p role="alert" className="text-sm font-semibold text-brake">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-fg/30 px-4 py-2 font-semibold">Cancel</button>
          <button disabled={saving} className="rounded-md bg-pine px-4 py-2 font-bold text-white hover:bg-pine-dark disabled:opacity-60">
            {saving ? 'Adding...' : 'Add stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
