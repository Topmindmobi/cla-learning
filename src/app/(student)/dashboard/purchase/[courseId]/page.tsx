import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { PurchaseRequestForm } from "@/components/student/LearnerPortalForms";

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireSession();
  const { courseId } = await params;
  if (!isAdminClientConfigured()) notFound();

  const supabase = createAdminClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, price, currency, description")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) notFound();

  return (
    <div className="wrap">
      <Link href="/dashboard/catalog" className="cla-btn ghost" style={{ paddingLeft: 0 }}>
        ← Catalog
      </Link>
      <h1 style={{ fontSize: 28, margin: "12px 0 8px" }}>Purchase · {course.title as string}</h1>
      <p style={{ color: "var(--muted)", maxWidth: "52ch" }}>
        {(course.description as string | null)?.slice(0, 200) ||
          "Request access. Finance will approve your payment before enrolment is activated."}
      </p>
      <div className="cla-card" style={{ padding: 20, marginTop: 18, maxWidth: 560 }}>
        <p style={{ marginTop: 0 }}>
          Listed price:{" "}
          <strong>
            {(course.currency as string) || "RWF"} {Number(course.price ?? 0).toLocaleString()}
          </strong>
        </p>
        <PurchaseRequestForm
          courses={[
            {
              id: course.id as string,
              title: course.title as string,
              price: Number(course.price ?? 0),
              currency: (course.currency as string) || "RWF",
            },
          ]}
        />
        <p style={{ marginBottom: 0, marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
          Or manage all requests in{" "}
          <Link href="/dashboard/billing" className="cla-link">
            Billing
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
