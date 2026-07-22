import { notFound } from "next/navigation";
import LearnerLmsPlayer from "@/components/student/LearnerLmsPlayer";
import { requireSession } from "@/lib/auth";
import { getPublishedLmsTree, progressPercent } from "@/lib/student/lms";
import { listDiscussionPosts } from "@/lib/student/portal";
import type { DiscussionPost } from "@/components/student/DiscussionPanel";

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await requireSession();
  const { courseId } = await params;
  const tree = await getPublishedLmsTree(courseId, session.userId);
  if (!tree) notFound();

  const discussionActs = tree.activities.filter((a) => a.activity_type === "discussion");
  const discussionsByActivity: Record<string, DiscussionPost[]> = {};
  await Promise.all(
    discussionActs.map(async (a) => {
      const rows = await listDiscussionPosts(a.id);
      discussionsByActivity[a.id] = rows.map((r) => ({
        id: r.id as string,
        author_name: (r.author_name as string | null) ?? null,
        author_email: (r.author_email as string | null) ?? null,
        body: r.body as string,
        created_at: r.created_at as string,
      }));
    }),
  );

  return (
    <LearnerLmsPlayer
      course={tree.course}
      modules={tree.modules}
      chapters={tree.chapters}
      lessons={tree.lessons}
      activities={tree.activities}
      completedActivityIds={[...tree.completedActivityIds]}
      percent={progressPercent(tree)}
      discussionsByActivity={discussionsByActivity}
    />
  );
}
