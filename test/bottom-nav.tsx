import { colors } from "./theme";

export type TabKey = "home" | "materials" | "quiz" | "forum";

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "home", label: "Beranda" },
  { key: "materials", label: "Materi" },
  { key: "quiz", label: "Kuis" },
  { key: "forum", label: "Forum" },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div
      className="shrink-0 flex items-stretch"
      style={{
        height: 80, // 64px + safe area
        backgroundColor: colors.white,
        borderTop: "1px solid #EEF1F5",
        paddingBottom: 16,
      }}
    >
      {tabs.map(({ key, label }) => {
        const isActive = active === key;
        const color = isActive ? colors.primary : colors.caption;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ color }}
          >
            {/* Icon Placeholder */}
            <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: color }} />
            <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
