import { colors, radii, cardShadow } from "./theme";
import { courses, Course } from "./data";

export function HomeScreen() {
  return (
    <div className="flex-1 overflow-y-auto relative" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-5 pb-8"
        style={{
          backgroundColor: colors.primary,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          minHeight: 120,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              Selamat Pagi,
            </p>
            <p style={{ fontSize: 20, fontWeight: 600, color: colors.white, marginTop: 2 }}>
              Hi, Budi Santoso! 👋
            </p>
          </div>
          <button className="relative" aria-label="Notifikasi">
            {/* Bell Icon Placeholder */}
            <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: colors.white }} />
            <span
              className="absolute"
              style={{
                top: -1,
                right: -1,
                width: 9,
                height: 9,
                borderRadius: 999,
                backgroundColor: colors.alert,
                border: "1.5px solid " + colors.primary,
              }}
            />
          </button>
        </div>
      </div>

      {/* Search bar (overlapping header) */}
      <div style={{ position: "absolute", top: 100, left: 20, right: 20 }}>
        <div
          className="flex items-center gap-2.5 px-4"
          style={{
            height: 48,
            backgroundColor: colors.white,
            borderRadius: radii.control,
            boxShadow: cardShadow,
          }}
        >
          {/* Search Icon Placeholder */}
          <div style={{ width: 18, height: 18, borderRadius: 9, border: "2px solid " + colors.caption }} />
          <span style={{ fontSize: 14, color: colors.caption }}>
            Cari mata kuliah atau materi...
          </span>
        </div>
      </div>

      {/* Section */}
      <div className="px-5 pt-10 pb-6">
        <h2 style={{ fontSize: 16, fontWeight: 500, color: colors.textPrimary }}>
          Mata Kuliah Aktif
        </h2>

        <div className="grid grid-cols-2 gap-3.5 mt-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div
      className="p-3.5 flex flex-col"
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.card,
        boxShadow: cardShadow,
        minHeight: 168,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: "rgba(74,144,226,0.12)",
        }}
      >
        {/* BookText Icon Placeholder */}
        <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: colors.accent }} />
      </div>

      <p
        className="mt-3"
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.textPrimary,
          lineHeight: 1.35,
        }}
      >
        {course.name}
      </p>
      <p
        className="mt-1"
        style={{ fontSize: 12, fontStyle: "italic", color: colors.caption }}
      >
        {course.lecturer}
      </p>

      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontSize: 11, color: colors.caption }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: colors.accent }}>
            {course.progress}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: "#EDF1F6",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${course.progress}%`,
              height: "100%",
              borderRadius: 999,
              backgroundColor: colors.accent,
            }}
          />
        </div>
      </div>
    </div>
  );
}
