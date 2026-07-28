import { type ChangeEvent } from "react";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="mb-3">
      <label
        htmlFor={name}
        className="form-label fw-semibold small text-uppercase text-secondary mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="form-control shadow-sm"
        style={{
          fontSize: "0.95rem",
          padding: "0.6rem 0.85rem",
          borderRadius: "0.5rem",
        }}
        required
      />
    </div>
  );
}
