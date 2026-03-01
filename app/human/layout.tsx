export default function HumanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-[#12122a] grid-bg">
      {children}
    </div>
  );
}
