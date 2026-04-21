import ClientPage from "./client-page"
import { mockVersions } from "@/lib/mock-data"

export function generateStaticParams() {
  return mockVersions.map((v) => ({ id: v.id }))
}

export default function Page() {
  return <ClientPage />
}
