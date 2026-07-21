-- Add slug for stable URLs + seed course catalog from Base44 / marketing content
-- Run after 001_core_schema.sql

alter table public.courses add column if not exists slug text unique;

-- Upsert seed courses (idempotent — safe to re-run)
insert into public.courses (
  slug, title, subtitle, short_description, full_description,
  category, difficulty, instructor_name, instructor_title,
  price, currency, language, tags, is_published, is_featured,
  average_rating, enrollment_count, rating_count
) values
  ('cips-level-2-certificate', 'CIPS Level 2 Certificate in Procurement and Supply', 'Entry point into CIPS procurement qualifications', 'Introduces the principles and context of procurement and supply — ideal for those starting out.', 'The CIPS Level 2 Certificate is the entry point into professional procurement.', 'professional_courses', 'beginner', 'Bernard', 'CIPS Certified Trainer', 20000, 'RWF', 'English', '["CIPS","L2","Procurement"]'::jsonb, true, false, 4.6, 0, 0),
  ('cips-level-3-advanced-certificate', 'CIPS Level 3 Advanced Certificate in Procurement and Supply', 'Operational knowledge for procurement roles', 'Contract administration, sourcing and supplier relationships.', 'Develops operational knowledge for those working in procurement roles.', 'professional_courses', 'beginner', 'Bernard', 'CIPS Certified Trainer', 20000, 'RWF', 'English', '["CIPS","L3","Procurement"]'::jsonb, true, true, 4.7, 0, 0),
  ('cips-level-4-diploma', 'CIPS Level 4 Diploma in Procurement and Supply', 'Foundation diploma in professional procurement', 'The level most working professionals join. Eight modules, twelve months.', 'The operational-level CIPS diploma — widely required for procurement roles.', 'professional_courses', 'intermediate', 'Bernard', 'CIPS Certified Trainer', 20000, 'RWF', 'English', '["CIPS","L4","Procurement"]'::jsonb, true, true, 4.9, 0, 0),
  ('cips-level-5-advanced-diploma', 'CIPS Level 5 Advanced Diploma in Procurement and Supply', 'Strategic procurement for mid-career professionals', 'Procurement strategy, commercial negotiation, and leadership — required for MCIPS eligibility.', 'The strategic procurement qualification for mid-career professionals.', 'professional_courses', 'advanced', 'Bernard', 'CIPS Certified Trainer', 20000, 'RWF', 'English', '["CIPS","L5","Procurement"]'::jsonb, true, false, 4.8, 0, 0),
  ('cips-level-6-professional-diploma', 'CIPS Level 6 Professional Diploma in Procurement and Supply', 'Professional-level CIPS procurement qualification', 'Strategic supply chain leadership — the final step to MCIPS.', 'The highest CIPS qualification — postgraduate level.', 'professional_courses', 'advanced', 'Bernard / Eric', 'CIPS Certified Trainers', 20000, 'RWF', 'English', '["CIPS","L6","Procurement"]'::jsonb, true, true, 4.9, 0, 0),
  ('acca-applied-knowledge', 'ACCA Applied Knowledge', 'Foundations of business, accounting and finance', 'Business, management accounting and financial accounting foundations.', 'The entry level to ACCA covering BT, MA, and FA papers.', 'finance', 'beginner', 'CLA Faculty', 'ACCA Qualified Tutor', 20000, 'RWF', 'English', '["ACCA","Applied Knowledge","Finance"]'::jsonb, true, true, 4.8, 0, 0),
  ('acca-applied-skills', 'ACCA Applied Skills', 'Technical skills across corporate reporting, audit and finance', 'Corporate reporting, taxation, audit, and financial management for professional roles.', 'Develops technical skills across major finance disciplines.', 'finance', 'intermediate', 'CLA Faculty', 'ACCA Qualified Tutor', 20000, 'RWF', 'English', '["ACCA","Applied Skills","Finance"]'::jsonb, true, false, 4.8, 0, 0),
  ('acca-strategic-professional', 'ACCA Strategic Professional', 'Strategic finance leadership and ACCA designation', 'Advanced reporting, risk and leadership for senior finance roles.', 'The final ACCA stage — SBL, SBR, and Options papers.', 'finance', 'advanced', 'CLA Faculty', 'ACCA Qualified Tutor', 20000, 'RWF', 'English', '["ACCA","Strategic Professional","Finance"]'::jsonb, true, true, 4.8, 0, 0),
  ('pmp-prep', 'Project Management Professional (PMP) Prep', 'Exam-focused PMP certification preparation', 'Exam-focused preparation with full mock sittings and study groups.', 'Structured PMP exam preparation with mock sittings and study groups.', 'management', 'intermediate', 'CLA Faculty', 'PMP Certified Instructor', 20000, 'RWF', 'English', '["PMP","Project Management"]'::jsonb, true, true, 4.7, 0, 0),
  ('ias-ifrs-reporting', 'IAS/IFRS Financial Reporting Standards', 'Apply international reporting standards in practice', 'Apply current standards to real statements, with worked examples.', 'Practical short course covering IAS and IFRS standards.', 'short_term_courses', 'intermediate', 'CLA Faculty', 'Finance Trainer', 20000, 'RWF', 'English', '["IFRS","IAS","Finance","Short course"]'::jsonb, true, true, 4.8, 0, 0),
  ('strategic-management-leadership', 'Strategic Management & Leadership', 'Lead teams and carry decisions through the organisation', 'Set direction, build a team and carry a decision through the organisation.', 'Applied leadership short course for managers stepping into senior roles.', 'management', 'intermediate', 'CLA Faculty', 'Leadership Trainer', 20000, 'RWF', 'English', '["Leadership","Management","Short course"]'::jsonb, true, true, 4.6, 0, 0)
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  instructor_name = excluded.instructor_name,
  instructor_title = excluded.instructor_title,
  price = excluded.price,
  tags = excluded.tags,
  is_published = excluded.is_published,
  is_featured = excluded.is_featured,
  average_rating = excluded.average_rating,
  updated_at = now();
