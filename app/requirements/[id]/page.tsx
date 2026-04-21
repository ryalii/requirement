import ClientPage from "./client-page"
import { mockRequirements, mockARDetails } from "@/lib/mock-data"

export function generateStaticParams() {
  const ids = new Set<string>()
  mockRequirements.forEach((r) => ids.add(r.id))
  mockARDetails.forEach((a) => ids.add(a.id))
  return Array.from(ids).map((id) => ({ id }))
}

export default function Page() {
  return <ClientPage />
}
