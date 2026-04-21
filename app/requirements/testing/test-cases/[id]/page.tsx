import ClientPage from "./client-page"
import { mockTestCaseDetails } from "@/lib/mock-data"

export function generateStaticParams() {
  return mockTestCaseDetails.map((t) => ({ id: t.id }))
}

export default function Page() {
  return <ClientPage />
}
