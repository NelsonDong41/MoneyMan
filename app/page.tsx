import Hero from "@/components/hero";

export default async function Home() {
  return (
    <div className="flex flex-col p-5 w-full items-center sm:pt-32 mb-40">
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
      </main>
    </div>
  );
}
