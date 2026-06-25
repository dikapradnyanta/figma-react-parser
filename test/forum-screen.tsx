import { useState } from "react";
import { colors, radii, cardShadow } from "./theme";
import { threads, Thread } from "./data";

const filters = ["Semua", "MPTI", "RPL", "Basis Data"];

export function ForumScreen() {
  const [active, setActive] = useState("Semua");

  const visible =
    active === "Semua" ? threads : threads.filter((t) => t.tag === active);

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-4 shrink-0"
        style={{
          backgroundColor: colors.primary,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <div className="flex items-center justify-between">
          <h1 style={{ fontSize: 20, fontWeight: 600, color: colors.white }}>
            Forum Diskusi
          </h1>
          <button aria-label="Tulis diskusi">
            {/* SquarePen Icon Placeholder */}
            <div style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: colors.white }} />
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-5 pt-4 pb-1 shrink-0 flex gap-2 overflow-x-auto">
        {filters.map((f) => {
          const isActive = active === f;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="shrink-0 transition-colors"
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: "7px 16px",
                borderRadius: radii.pill,
                backgroundColor: isActive ? colors.primary : colors.white,
                color: isActive ? colors.white : colors.caption,
                boxShadow: isActive ? "none" : cardShadow,
                border: isActive ? "none" : "1px solid #EEF1F5",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 flex flex-col gap-3.5">
        {visible.map((t) => (
          <ThreadCard key={t.id} thread={t} />
        ))}
      </div>

      {/* FAB */}
      <button
        aria-label="Buat diskusi baru"
        className="absolute flex items-center justify-center active:opacity-90"
        style={{
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 999,
          backgroundColor: colors.primary,
          boxShadow: "0px 8px 20px rgba(13,59,102,0.35)",
          zIndex: 10,
        }}
      >
        {/* Plus Icon Placeholder */}
        <div style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.white }} />
      </button>
    </div>
  );
}

function ThreadCard({ thread }: { thread: Thread }) {
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.card,
        boxShadow: cardShadow,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            backgroundColor: thread.avatarColor,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.white }}>
            {thread.initials}
          </span>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
            {thread.author}
          </p>
          <p style={{ fontSize: 12, fontStyle: "italic", color: colors.caption }}>
            {thread.time}
          </p>
        </div>
      </div>

      <p
        className="mt-3"
        style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.4 }}
      >
        {thread.title}
      </p>
      <p
        className="mt-1.5"
        style={{
          fontSize: 13,
          color: colors.caption,
          lineHeight: 1.5,
          maxHeight: 39, // approx 2 lines
          overflow: "hidden",
        }}
      >
        {thread.preview}
      </p>

      <div className="flex items-center gap-5 mt-3.5">
        <div className="flex items-center gap-1.5">
          {/* MessageCircle Icon Placeholder */}
          <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent }} />
          <span style={{ fontSize: 12, color: colors.caption }}>
            {thread.replies} balasan
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* ThumbsUp Icon Placeholder */}
          <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: colors.accent }} />
          <span style={{ fontSize: 12, color: colors.caption }}>{thread.likes}</span>
        </div>
      </div>
    </div>
  );
}
