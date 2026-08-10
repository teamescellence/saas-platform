import { CustomerReviewScreen } from "@/components/customer-review-screen";

export default function Home() {
  return (
    <CustomerReviewScreen
      businessName="Brew & Bliss Cafe"
      category="Cafe & Bakery"
      branchName="Udaipur Main Branch"
      tableName="Table 04"
      googleReviewUrl="https://g.page/review/brewbliss"
    />
  );
}
