import { notFound } from "next/navigation";
import LearnerQuizTaker from "@/components/student/LearnerQuizTaker";
import { requireSession } from "@/lib/auth";
import {
  getPublishedQuizForLearner,
  stripQuizAnswers,
} from "@/lib/student/quizzes";

export default async function QuizTakePage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const session = await requireSession();
  const { quizId } = await params;
  const quiz = await getPublishedQuizForLearner(quizId, session.userId);
  if (!quiz) notFound();

  const blockedNoRetake = !quiz.allow_retake && quiz.attempt_count > 0;
  const blockedMax =
    quiz.max_attempts != null && quiz.attempt_count >= quiz.max_attempts;
  const canAttempt = !blockedNoRetake && !blockedMax && quiz.questions.length > 0;

  let blockReason: string | undefined;
  if (!quiz.questions.length) blockReason = "This quiz has no questions yet.";
  else if (blockedNoRetake) blockReason = "Retakes are not allowed for this quiz.";
  else if (blockedMax)
    blockReason = `You have used all ${quiz.max_attempts} attempts.`;

  return (
    <LearnerQuizTaker
      quizId={quiz.id}
      title={quiz.title}
      description={quiz.description}
      passingScore={quiz.passing_score}
      timeLimitMinutes={quiz.time_limit_minutes}
      questions={stripQuizAnswers(quiz.questions)}
      attemptCount={quiz.attempt_count}
      bestScore={quiz.best_score}
      canAttempt={canAttempt}
      allowRetake={quiz.allow_retake}
      maxAttempts={quiz.max_attempts}
      blockReason={blockReason}
    />
  );
}
