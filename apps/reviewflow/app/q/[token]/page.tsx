import { CustomerReviewScreen } from "@/components/customer-review-screen";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function CustomerReviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tokenName = resolvedParams?.token ? resolvedParams.token.toUpperCase() : "TABLE 01";

  return (
    <CustomerReviewScreen
      businessName="Brew & Bliss Cafe"
      category="Cafe & Bakery"
      branchName="Udaipur Main Branch"
      tableName={tokenName}
      googleReviewUrl="https://g.page/review/brewbliss"
    />
  );
}
