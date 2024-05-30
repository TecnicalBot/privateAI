import Chat from "@/components/Chat";
import Header from "@/components/Header";


export default async function Home() {
  return (
    <main className="flex flex-col h-screen bg-[#151414] px-4">
      <Header />
      <Chat />
    </main>
  );
}
