import PublicHeader, { PublicFooter } from "@/components/layout/PublicChrome";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cla-public">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
