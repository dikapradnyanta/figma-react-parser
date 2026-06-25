import { ReactNode } from "react";
import { colors } from "./theme";

interface PhoneFrameProps {
  children: ReactNode;
}

// A fixed 375 x 812 device frame to present the mobile screens.
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: 375,
        height: 812,
        backgroundColor: colors.bg,
        borderRadius: 40,
        boxShadow: "0px 24px 60px rgba(13, 59, 102, 0.25)",
        border: "8px solid #111827",
      }}
    >
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: 44, color: colors.white, backgroundColor: colors.primary }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>9:41</span>
        <div className="flex items-center gap-1.5">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </div>
      {children}
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
      <rect x="0" y="7" width="3" height="4" rx="1" fill="white" />
      <rect x="4.5" y="5" width="3" height="6" rx="1" fill="white" />
      <rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="white" />
      <rect x="13.5" y="0" width="3" height="11" rx="1" fill="white" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path
        d="M8 10.5L9.8 8.4C8.8 7.6 7.2 7.6 6.2 8.4L8 10.5Z"
        fill="white"
      />
      <path
        d="M3.4 5.5C6 3.2 10 3.2 12.6 5.5L11.1 7.2C9.3 5.6 6.7 5.6 4.9 7.2L3.4 5.5Z"
        fill="white"
      />
      <path
        d="M0.8 2.8C4.9 -0.9 11.1 -0.9 15.2 2.8L13.7 4.5C10.4 1.6 5.6 1.6 2.3 4.5L0.8 2.8Z"
        fill="white"
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="white" opacity="0.5" />
      <rect x="2" y="2" width="17" height="8" rx="1.5" fill="white" />
      <rect x="23" y="4" width="1.5" height="4" rx="0.75" fill="white" />
    </svg>
  );
}
