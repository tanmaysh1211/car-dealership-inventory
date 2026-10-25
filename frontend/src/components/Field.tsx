import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> { label: string }

export const inputClass =
  'w-full rounded-lg border border-fg/20 bg-surface px-3.5 py-2.5 text-base placeholder:text-fg/40 shadow-sm focus:border-pine focus:ring-4 focus:ring-pine/15 focus:outline-none';

export default function Field({ label, id, ...rest }: Props) {
  const inputId = id ?? `f-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {/* autoComplete="off" + ignore hints keep browser/password-manager popups away; callers can override. */}
      <input id={inputId} className={inputClass} autoComplete="off" data-lpignore="true" data-form-type="other" {...rest} />
    </div>
  );
}
