import clsx from "clsx";

interface SegmentedTabsProps {
  tabs: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
}

export function SegmentedTabs({ tabs, active, onChange }: SegmentedTabsProps) {
  return (
    <div className="my-3 flex rounded-full bg-slate-200 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
            active === tab.value ? "bg-white text-primary-dark shadow" : "text-slate-500"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
