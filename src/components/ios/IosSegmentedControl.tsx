import { triggerHaptic } from '../../utils/haptics';

interface SegmentOption<T extends string> {
  id: T;
  label: string;
  badge?: number | string;
}

interface IosSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selected: T;
  onChange: (value: T) => void;
  accentColor?: string;
  className?: string;
}

export function IosSegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  accentColor = '#f43f5e',
  className = ''
}: IosSegmentedControlProps<T>) {
  return (
    <div
      className={`relative p-1 bg-zinc-900/90 rounded-xl border border-white/[0.08] flex items-center shadow-inner ${className}`}
    >
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            id={`segment-${opt.id}`}
            type="button"
            onClick={() => {
              if (!isSelected) {
                triggerHaptic('light');
                onChange(opt.id);
              }
            }}
            className={`relative flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 z-10 select-none ${
              isSelected
                ? 'bg-zinc-800 text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
                style={isSelected ? { color: accentColor } : undefined}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
