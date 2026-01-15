import Header from "@/components/Header";

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh text-gray-400">
      {/* Header */}
      <Header />

      <div className="container py-10">{children}</div>
    </div>
  );
}

export default RootLayout;
