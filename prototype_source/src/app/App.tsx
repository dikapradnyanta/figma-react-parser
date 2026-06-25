import { useState } from "react";
import { PhoneFrame } from "./components/phone-frame";
import { BottomNav, TabKey } from "./components/bottom-nav";
import { HomeScreen } from "./components/screens/home-screen";
import { MaterialsScreen } from "./components/screens/materials-screen";
import { QuizScreen } from "./components/screens/quiz-screen";
import { ForumScreen } from "./components/screens/forum-screen";

export default function App() {
  const [tab, setTab] = useState<TabKey>("home");

  return (
    <div
      className="size-full flex items-center justify-center p-6"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#E2E8F0",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(13,59,102,0.10), transparent 60%)",
        minHeight: "100vh",
      }}
    >
      <PhoneFrame>
        {tab === "home" && <HomeScreen />}
        {tab === "materials" && <MaterialsScreen />}
        {tab === "quiz" && <QuizScreen />}
        {tab === "forum" && <ForumScreen />}
        <BottomNav active={tab} onChange={setTab} />
      </PhoneFrame>
    </div>
  );
}
