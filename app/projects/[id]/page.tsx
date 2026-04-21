import ClientPage from "./client-page"
import { mockProjects } from "@/lib/mock-data"

export function generateStaticParams() {
  return mockProjects.map((p) => ({ id: p.id }))
}

export default function Page() {
  return <ClientPage />
}
