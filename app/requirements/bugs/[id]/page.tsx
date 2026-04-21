import ClientPage from "./client-page"
import { mockBugs } from "@/lib/mock-data"

export function generateStaticParams() {
  return mockBugs.map((b) => ({ id: b.id }))
}

export default function Page() {
  return <ClientPage />
}
