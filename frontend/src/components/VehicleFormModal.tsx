import { FormEvent, useState } from 'react';
import { errorMessage, vehicleApi } from '../api';
import { useToast } from '../context/ToastContext';
import type { Vehicle } from '../types';
import Field from './Field';
import Modal from './Modal';

interface Props { vehicle: Vehicle | null; onClose: () => void; onSaved: () => void }

/** Add (vehicle === null) or edit a vehicle. Admin only; the backend enforces this too. */
export default function VehicleFormModal({ vehicle, onClose, onSaved }: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState({
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    category: vehicle?.category ?? '',
    price: vehicle ? String(vehicle.price) : '',
    quantity: vehicle ? String(vehicle.quantity) : '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    if (!form.make.trim() || !form.model.trim() || !form.category.trim()) return setError('Make, model and category are required.');
    if (!(price > 0)) return setError('Price must be greater than 0.');
    if (!Number.isInteger(quantity) || quantity < 0) return setError('Quantity must be a whole number, 0 or more.');

    setSaving(true);
    setError('');
    const body = { make: form.make.trim(), model: form.model.trim(), category: form.category.trim(), price, quantity };
    try {
      if (vehicle) await vehicleApi.update(vehicle.id, body);
      else await vehicleApi.create(body);
      notify('success', vehicle ? 'Vehicle updated.' : 'Vehicle added.');
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <Modal title={vehicle ? 'Edit vehicle' : 'Add vehicle'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Make" value={form.make} onChange={set('make')} required />
        <Field label="Model" value={form.model} onChange={set('model')} required />
        <Field label="Category" value={form.category} onChange={set('category')} placeholder="Sedan, SUV, Electric..." required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (USD)" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
          <Field label="Quantity" type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} required />
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-brake">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-fg/30 px-4 py-2 font-semibold">Cancel</button>
          <button disabled={saving} className="rounded-md bg-pine px-4 py-2 font-bold text-white hover:bg-pine-dark disabled:opacity-60">
            {saving ? 'Saving...' : 'Save vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
