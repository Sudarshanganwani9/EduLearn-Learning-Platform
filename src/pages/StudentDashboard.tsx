import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Course, hasPurchased } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    loadCourses(session.user.id);
  };

  const loadCourses = async (userId: string) => {
    setIsLoading(true);

    // Load all published courses
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (courses) {
      setAllCourses(courses);
    }

    // Load purchased courses
    const { data: purchases } = await supabase
      .from('purchases')
      .select('course_id, courses(*)')
      .eq('student_id', userId);

    if (purchases) {
      const purchased = purchases.map(p => p.courses).filter(Boolean) as Course[];
      setPurchasedCourses(purchased);
      setPurchasedCourseIds(new Set(purchases.map(p => p.course_id)));
    }

    setIsLoading(false);
  };

  const handlePurchaseCourse = async (course: Course) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('purchases')
        .insert({
          student_id: user.id,
          course_id: course.id,
          amount: course.price,
        });

      if (error) throw error;

      toast.success("Course purchased successfully!");
      loadCourses(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase course");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Manage your learning journey</p>
        </div>

        <Tabs defaultValue="my-courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="my-courses">
            {isLoading ? (
              <p className="text-center py-12 text-muted-foreground">Loading...</p>
            ) : purchasedCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't purchased any courses yet</p>
                <Button variant="gradient" onClick={() => navigate("/")}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onViewCourse={(id) => navigate(`/course/${id}`)}
                    isPurchased
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse">
            {isLoading ? (
              <p className="text-center py-12 text-muted-foreground">Loading...</p>
            ) : allCourses.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No courses available</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onViewCourse={(id) => navigate(`/course/${id}`)}
                    isPurchased={purchasedCourseIds.has(course.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
