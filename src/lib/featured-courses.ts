import seedCourses from "../../scripts/data/courses.seed.json";

export type FeaturedCourse = {
  id: string;
  title: string;
  shortDescription: string;
  tag: string;
  duration: string;
  rating: string;
  price: string;
  color: string;
  category: string;
};

const COLORS: Record<string, string> = {
  cips: "#1F4FD8",
  acca: "#0E7A5F",
  pmp: "#7A4B12",
  ifrs: "#6B21A8",
  leadership: "#0E1420",
};

function tagFromCourse(course: (typeof seedCourses)[number]): string {
  const tags = course.tags as string[];
  if (tags.some((t) => t.startsWith("L"))) {
    const level = tags.find((t) => /^L\d/.test(t)) ?? tags[0];
    return `CIPS · ${level}`;
  }
  if (tags.includes("ACCA")) {
    const stage = tags.find((t) => t !== "ACCA" && t !== "Finance");
    return stage ? `ACCA · ${stage.replace("Applied ", "")}` : "ACCA";
  }
  if (tags.includes("PMP")) return "Professional";
  if (tags.includes("IFRS") || tags.includes("IAS")) return "Short course";
  if (tags.includes("Leadership")) return "Leadership";
  return tags[0] ?? "Course";
}

function colorFor(course: (typeof seedCourses)[number]): string {
  const tags = course.tags as string[];
  if (tags.includes("CIPS")) return COLORS.cips;
  if (tags.includes("ACCA")) return COLORS.acca;
  if (tags.includes("PMP")) return COLORS.pmp;
  if (tags.includes("IFRS") || tags.includes("IAS")) return COLORS.ifrs;
  return COLORS.leadership;
}

function durationFor(course: (typeof seedCourses)[number]): string {
  const d = course.difficulty;
  if (course.tags.includes("L2")) return "6 months";
  if (course.tags.includes("L3")) return "10 months";
  if (course.tags.includes("L4")) return "12 months";
  if (course.tags.includes("L5")) return "14 months";
  if (course.tags.includes("L6")) return "14 months";
  if (course.title.includes("Applied Knowledge")) return "6 months";
  if (course.title.includes("Applied Skills")) return "12 months";
  if (course.title.includes("Strategic Professional")) return "9 months";
  if (course.title.includes("PMP")) return "10 weeks";
  if (course.title.includes("IAS/IFRS")) return "6 weeks";
  if (course.title.includes("Leadership")) return "8 weeks";
  return d === "advanced" ? "12 months" : "8 weeks";
}

export const FEATURED_COURSES: FeaturedCourse[] = seedCourses.map((course) => ({
  id: course.slug,
  title: course.title,
  shortDescription: course.short_description,
  tag: tagFromCourse(course),
  duration: durationFor(course),
  rating: String(course.average_rating),
  price: `${course.currency} ${course.price.toLocaleString()}`,
  color: colorFor(course),
  category: course.category,
}));

/** Home page highlights — featured flag from seed data */
export const HOME_FEATURED_COURSES = FEATURED_COURSES.filter((_, i) =>
  seedCourses[i]?.is_featured
);

export function getFeaturedCourse(id: string): FeaturedCourse | undefined {
  return FEATURED_COURSES.find((c) => c.id === id);
}

export function filterFeaturedCourses(query?: string): FeaturedCourse[] {
  if (!query?.trim()) return FEATURED_COURSES;
  const q = query.trim().toLowerCase();
  return FEATURED_COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.shortDescription.toLowerCase().includes(q) ||
      c.tag.toLowerCase().includes(q) ||
      c.category.replace(/_/g, " ").toLowerCase().includes(q)
  );
}
