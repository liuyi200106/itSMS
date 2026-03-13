// ModalForm Component - Unified Style
import React from 'react';

interface ModalFormProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitText?: string;
  children: React.ReactNode;
  error?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'green' | 'gray' | 'blue' | 'purple';
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string | number | '';
  onChange: (value: string | number | '') => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const themeColors = {
  green: 'from-green-500 to-emerald-600',
  gray: 'from-gray-500 to-slate-600',
  blue: 'from-blue-500 to-cyan-600',
  purple: 'from-purple-500 to-fuchsia-600',
};

const sizeWidth = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  multiline = false,
  rows = 4,
}) => (
  <div>
    <label className="text-sm text-gray-600 block mb-2">
      {label}{required ? ' *' : ''}
    </label>
    {multiline ? (
      <textarea
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none"
      />
    ) : (
      <input
        type={type}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
      />
    )}
  </div>
);

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = '-- Select --',
  required = false,
}) => (
  <div>
    <label className="text-sm text-gray-600 block mb-2">
      {label}{required ? ' *' : ''}
    </label>
    <select
      value={value}
      onChange={(e) => {
        const selected = options.find((option) => String(option.value) === e.target.value);
        onChange(selected ? selected.value : e.target.value);
      }}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={`${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded"
    />
    {label}
  </label>
);

export const ModalForm: React.FC<ModalFormProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  onSubmit,
  submitting,
  submitText = 'Save',
  children,
  error,
  size = 'md',
  theme = 'green',
}) => {
  const accent = themeColors[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      />

      <div className={`relative w-full ${sizeWidth[size]} transform transition-all duration-300 ease-out`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${accent}`} />

          <div className="px-8 pt-8 pb-4">
            <div className="flex items-start gap-4">
              {icon && (
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${accent} flex items-center justify-center text-white shadow-lg`}>
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-8 mb-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="px-8 pb-6">{children}</div>

          <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${accent} disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all`}
            >
              {submitting ? 'Saving...' : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
