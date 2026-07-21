import { CIPS_LEVELS } from "@/lib/public-content";
import { LevelsSection, PageCta, PageHero, WhyGrid } from "./ProgrammePage";

export default function CipsPageContent() {
  return (
    <>
      <PageHero
        badge="CIPS Approved Study Centre"
        title="Become a procurement & supply chain professional"
        subtitle="CLA delivers CIPS qualifications from Level 2 through to Level 6 — globally recognised credentials that open doors to senior procurement careers worldwide."
        catalogQuery="CIPS"
      />
      <WhyGrid
        title="Why CIPS?"
        intro="The Chartered Institute of Procurement & Supply is the world's leading professional body for procurement."
        items={[
          { title: "Global recognition", desc: "CIPS is trusted by employers in 150+ countries." },
          { title: "Career growth", desc: "CIPS-qualified professionals progress faster into senior commercial roles." },
          { title: "MCIPS status", desc: "Level 5+ and experience leads to chartered MCIPS designation." },
        ]}
      />
      <WhyGrid
        title="Why study CIPS at CLA?"
        intro="As a CIPS Approved Study Centre, we bring structure, expertise, and support to every level."
        items={[
          { title: "Approved centre", desc: "Officially accredited by CIPS with rigorous academic standards." },
          { title: "MCIPS tutors", desc: "Practitioner tutors with hands-on procurement experience." },
          { title: "Cohort learning", desc: "Live sessions, LMS content, and peer support throughout." },
          { title: "Exam-focused", desc: "Syllabus coverage balanced with past-paper practice." },
        ]}
      />
      <LevelsSection
        title="CIPS qualification levels"
        intro="Whether you're starting out or aiming for senior leadership, there is a CIPS level for every stage."
        levels={CIPS_LEVELS}
        catalogQuery="CIPS"
      />
      <PageCta
        title="Ready to start your CIPS journey?"
        desc="Join procurement professionals across Africa who have advanced their careers with CLA's CIPS-accredited qualifications."
        catalogQuery="CIPS"
      />
    </>
  );
}
