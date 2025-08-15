import { Header } from '@/components/header'

export default async function Home() {
  return (
    <div>
      <div className="pt-6">
        <Header />
      </div>

      <main className="mx-auto w-full max-w-[1200px] space-y-4">
        <p className="t">Select an organization</p>
      </main>
    </div>
  )
}
