import { CustomerReviewScreen } from "@/components/customer-review-screen";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function CustomerReviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const token = resolvedParams?.token || "";

  return (
    <CustomerReviewScreen token={token} />
  );
}
