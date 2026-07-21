import { ACCA_LEVELS } from "@/lib/public-content";
import { LevelsSection, PageCta, PageHero, WhyGrid } from "./ProgrammePage";

export default function AccaPageContent() {
  return (
    <>
      <PageHero
        badge="ACCA Partner Centre"
        title="Become a globally recognised finance professional"
        subtitle="CLA delivers ACCA qualifications from Applied Knowledge through to Strategic Professional — equipping you for accounting, finance, and business leadership worldwide."
        accent="moss"
        catalogQuery="ACCA"
      />
      <WhyGrid
        title="Why ACCA?"
        intro="One of the world's most respected finance qualifications — opening careers across every industry."
        items={[
          { title: "Global recognition", desc: "Recognised by employers in 180+ countries." },
          { title: "Career mobility", desc: "Roles in audit, advisory, corporate finance, and CFO leadership." },
          { title: "Leadership pathway", desc: "Strategic Professional level builds senior finance leaders." },
        ]}
      />
      <WhyGrid
        title="Why study ACCA at CLA?"
        intro="Structured delivery designed to maximise exam success and career readiness."
        items={[
          { title: "Exam preparation", desc: "Targeted practice, mock exams, and tutor feedback." },
          { title: "Qualified tutors", desc: "Fully ACCA-qualified with teaching and practice experience." },
          { title: "Flexible online", desc: "Live classes and LMS content around your job." },
          { title: "Career-focused", desc: "Apply knowledge immediately in the workplace." },
        ]}
      />
      <LevelsSection
        title="ACCA qualification levels"
        intro="Three progressive levels — from foundational knowledge to strategic leadership."
        levels={ACCA_LEVELS}
        catalogQuery="ACCA"
      />
      <PageCta
        title="Ready to start your ACCA journey?"
        desc="Join finance professionals across Africa studying ACCA with structured support from CLA's expert tutors."
        catalogQuery="ACCA"
      />
    </>
  );
}
