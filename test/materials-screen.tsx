import { colors, radii, cardShadow } from "./theme";
import { materials, Material } from "./data";

export function MaterialsScreen() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-5"
        style={{
          backgroundColor: colors.primary,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <div className="flex items-center gap-3">
          <button aria-label="Kembali">
            {/* ChevronLeft Icon Placeholder */}
            <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: colors.white }} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: colors.white }}>
            Materi Kuliah
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 6, marginLeft: 36 }}>
          Manajemen Proyek Teknologi Informasi
        </p>
      </div>

      <div className="px-5 pt-5 pb-6 flex flex-col gap-3.5">
        {materials.map((m) => (
          <MaterialCard key={m.id} material={m} />
        ))}
      </div>
    </div>
  );
}

function MaterialCard({ material }: { material: Material }) {
  const isVideo = material.type === "video";
  const iconBg = isVideo ? "rgba(74,144,226,0.12)" : "rgba(13,59,102,0.10)";
  const iconColor = isVideo ? colors.accent : colors.primary;

  return (
    <div
      className="flex items-center gap-3.5 p-3.5"
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.card,
        boxShadow: cardShadow,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: iconBg }}
      >
        {isVideo ? (
          /* PlayCircle Icon Placeholder */
          <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: iconColor }} />
        ) : (
          /* FileText Icon Placeholder */
          <div style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: iconColor }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.textPrimary,
            lineHeight: 1.3,
          }}
        >
          {material.title}
        </p>
        <p style={{ fontSize: 12, fontStyle: "italic", color: colors.caption, marginTop: 3 }}>
          {material.lecturer} · {material.meta}
        </p>
      </div>

      <button
        className="flex items-center justify-center shrink-0"
        aria-label="Unduh"
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          backgroundColor: "rgba(74,144,226,0.10)",
        }}
      >
        {/* Download Icon Placeholder */}
        <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: colors.accent }} />
      </button>
    </div>
  );
}
