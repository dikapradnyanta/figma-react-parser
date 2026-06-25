import { colors, radii, cardShadow } from "./theme";
import { quizzes, Quiz } from "./data";

export function QuizScreen() {
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
          <QuizCard key={q.id} quiz={q} />
        ))}
      </div>
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Quiz }) {
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
        {/* Clock Icon Placeholder */}
        <div style={{ width: 14, height: 14, borderRadius: 7, border: '1.5px solid ' + colors.caption }} />
        <span style={{ fontSize: 12, color: colors.caption }}>{quiz.meta}</span>
      </div>

      <button
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
