import ClientPage from "./client-page"
import { mockIterations } from "@/lib/mock-data"

export function generateStaticParams() {
  return mockIterations.map((i) => ({ id: i.id }))
}

export default function Page() {
  return <ClientPage />
}
