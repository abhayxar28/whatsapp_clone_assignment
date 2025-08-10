import ChatSection from "@/components/dashboard/ChatSection";
import Dashboard from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Dashboard/>
      <ChatSection />
    </div>
  );
}
