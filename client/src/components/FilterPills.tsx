import clsx from "clsx";

interface FilterPillsProps {
  options: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
}

export function FilterPills({ options, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
            active === option.value ? "bg-primary text-white" : "bg-white text-slate-600 shadow"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
