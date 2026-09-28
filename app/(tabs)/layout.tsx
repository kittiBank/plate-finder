import { BottomNav } from "@/components/ui/BottomNav";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
