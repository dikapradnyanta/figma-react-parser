import { useState } from "react";
import { colors, radii, cardShadow } from "./theme";
import { examQuestion } from "./data";

export function ExamScreen() {
  const [selected, setSelected] = useState<string>("B");

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Locked timer bar */}
      <div
        className="shrink-0 flex items-center px-4"
        style={{ height: 52, backgroundColor: colors.accent }}
      >
        <button aria-label="Kembali" className="shrink-0">
          {/* ChevronLeft Icon Placeholder */}
          <div style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: colors.white }} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          {/* Clock Icon Placeholder */}
          <div style={{ width: 18, height: 18, borderRadius: 9, border: '2px solid ' + colors.white }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: colors.white }}>
            Sisa Waktu: 24:35
          </span>
        </div>
        <div style={{ width: 22 }} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6 flex flex-col">
        <span style={{ fontSize: 12, color: colors.caption }}>
          Soal {examQuestion.number} dari {examQuestion.total}
        </span>

        {/* Question card */}
        <div
          className="p-4 mt-2.5 flex items-start gap-3"
          style={{
            backgroundColor: colors.white,
            borderRadius: radii.card,
            boxShadow: cardShadow,
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "rgba(13,59,102,0.10)",
            }}
          >
            {/* FileQuestion Icon Placeholder */}
            <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: colors.primary }} />
          </div>
          <p style={{ fontSize: 14, color: colors.body, lineHeight: 1.5 }}>
            {examQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 mt-4">
          {examQuestion.options.map((opt) => {
            const isSelected = selected === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                className="flex items-center gap-3 p-3.5 text-left transition-colors"
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.white,
                  borderRadius: radii.control,
                  boxShadow: cardShadow,
                  border: isSelected ? "none" : "1px solid #EEF1F5",
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#EDF1F6",
                    color: isSelected ? colors.white : colors.caption,
                  }}
                >
                  {opt.key}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: isSelected ? colors.white : colors.body,
                  }}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        <button
          className="w-full mt-auto flex items-center justify-center gap-2 active:opacity-80"
          style={{
            height: 50,
            marginTop: 24,
            borderRadius: radii.control,
            backgroundColor: colors.primary,
            color: colors.white,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Soal Selanjutnya
          {/* ArrowRight Icon Placeholder */}
          <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: colors.white }} />
        </button>
      </div>
    </div>
  );
}
