import { useState } from "react";
import { ChevronLeft, Clock, FileQuestion, ArrowRight } from "lucide-react";
import { colors, radii, cardShadow } from "../theme";
import { quizzes, Quiz, examQuestion } from "../data";

export function QuizScreen() {
  const [mode, setMode] = useState<"list" | "exam">("list");

  if (mode === "exam") {
    return <ExamState onBack={() => setMode("list")} />;
  }
  return <QuizList onStart={() => setMode("exam")} />;
}

function QuizList({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.bg }}>
      <div
        className="px-5 pt-4 pb-5"
        style={{
          backgroundColor: colors.primary,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600, color: colors.white }}>
          Kuis Aktif
        </h1>
      </div>

      <div className="px-5 pt-5 pb-6 flex flex-col gap-3.5">
        {quizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} onStart={onStart} />
        ))}
      </div>
    </div>
  );
}

function QuizCard({ quiz, onStart }: { quiz: Quiz; onStart: () => void }) {
  const isDone = quiz.status === "Selesai";
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.card,
        boxShadow: cardShadow,
      }}
    >
      <div className="flex items-start justify-between">
        <p style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>
          {quiz.title}
        </p>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: radii.pill,
            color: isDone ? colors.caption : "#15803D",
            backgroundColor: isDone ? "#F1F3F5" : "rgba(34,197,94,0.14)",
          }}
        >
          {quiz.status}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <Clock size={14} color={colors.caption} />
        <span style={{ fontSize: 12, color: colors.caption }}>{quiz.meta}</span>
      </div>

      <button
        onClick={isDone ? undefined : onStart}
        className="w-full mt-4 transition-opacity active:opacity-80"
        style={{
          height: 44,
          borderRadius: radii.control,
          backgroundColor: isDone ? "#EDF1F6" : colors.primary,
          color: isDone ? colors.caption : colors.white,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {isDone ? "Lihat Nilai" : "Mulai Kuis"}
      </button>
    </div>
  );
}

function ExamState({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<string>("B");

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Locked timer bar */}
      <div
        className="shrink-0 flex items-center px-4"
        style={{ height: 52, backgroundColor: colors.accent }}
      >
        <button onClick={onBack} aria-label="Kembali" className="shrink-0">
          <ChevronLeft size={22} color={colors.white} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Clock size={18} color={colors.white} />
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
            <FileQuestion size={18} color={colors.primary} />
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
          <ArrowRight size={18} color={colors.white} />
        </button>
      </div>
    </div>
  );
}
