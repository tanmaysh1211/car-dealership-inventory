import { useState } from 'react';
import { errorMessage, vehicleApi } from '../api';
import { useToast } from '../context/ToastContext';
import type { Vehicle } from '../types';
import Modal from './Modal';

interface Props { vehicle: Vehicle; onClose: () => void; onDeleted: () => void }

/** Deleting is destructive, so always ask first. */
export default function ConfirmDelete({ vehicle, onClose, onDeleted }: Props) {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await vehicleApi.remove(vehicle.id);
      notify('success', `${vehicle.make} ${vehicle.model} deleted.`);
      onDeleted();
      onClose();
    } catch (err) {
      notify('error', errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title="Delete this vehicle?" onClose={onClose}>
      <p className="mb-5">
        <strong>{vehicle.make} {vehicle.model}</strong> will be removed from the inventory. This cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-fg/30 px-4 py-2 font-semibold">Keep vehicle</button>
        <button onClick={confirm} disabled={busy} className="rounded-md bg-brake px-4 py-2 font-bold text-white disabled:opacity-60">
          {busy ? 'Deleting...' : 'Delete vehicle'}
        </button>
      </div>
    </Modal>
  );
}
