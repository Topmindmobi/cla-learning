export type UserRole = "user" | "admin" | "super_admin" | "finance" | "instructor";

export type Course = {
  id: string;
  title: string;
  subtitle: string | null;
  short_description: string | null;
  full_description: string | null;
  category: string;
  difficulty: string;
  thumbnail_url: string | null;
  instructor_name: string | null;
  price: number;
  currency: string;
  is_published: boolean;
  is_featured: boolean;
  enrollment_count: number;
  average_rating: number;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  roles: UserRole[];
  avatar_url: string | null;
};
