import { CustomerReviewScreen } from "@/components/customer-review-screen";
import { api, endpoints } from "@/lib/api";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function CustomerReviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const token = resolvedParams?.token || "";

  let initialSessionData = null;
  let serverError = null;

  try {
    initialSessionData = await api.get<any>(endpoints.publicReviewSession(token));
  } catch (err: any) {
    serverError = err.message || "Failed to load review session. Invalid or expired link.";
  }

  return (
    <CustomerReviewScreen
      token={token}
      initialSessionData={initialSessionData}
      serverError={serverError}
    />
  );
}
