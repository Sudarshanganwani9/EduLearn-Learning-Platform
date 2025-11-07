import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'student' | 'educator' | 'admin';

export interface Course {
  id: string;
  educator_id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  video_url: string | null;
  duration: number | null;
  level: string | null;
  category: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  purchased_at: string;
}

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return data.role as UserRole;
};

export const setUserRole = async (userId: string, role: UserRole) => {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role });
  
  return { error };
};

export const hasPurchased = async (studentId: string, courseId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('purchases')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle();
  
  return !!data;
};
