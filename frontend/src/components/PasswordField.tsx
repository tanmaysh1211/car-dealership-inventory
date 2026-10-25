import { InputHTMLAttributes, useState } from 'react';
import { inputClass } from './Field';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { label: string }

/** Password input with a Show/Hide toggle. Hidden state is a masked text input, which keeps Edge's password bubble away. */
export default function PasswordField({ label, id, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? `f-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          {...(!visible ? { 'data-mask': 'true' } : {})}
          name="pw-field"
          autoComplete="off"
          data-lpignore="true"
          data-form-type="other"
          className={`${inputClass} pr-16`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 px-3.5 text-sm font-bold text-pine hover:underline"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}