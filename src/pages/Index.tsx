import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-learning.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
    loadCourses();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    
    if (session?.user) {
      loadPurchasedCourses(session.user.id);
    }
  };

  const loadPurchasedCourses = async (userId: string) => {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('course_id')
      .eq('student_id', userId);

    if (purchases) {
      setPurchasedCourseIds(new Set(purchases.map(p => p.course_id)));
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCourses(data);
    }
    setIsLoading(false);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Learn Without{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Access world-class courses from expert educators. Start your learning journey today.
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="gradient" onClick={() => navigate("/auth")}>
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => {
                  document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Browse Courses
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-20 rounded-full" />
              <img 
                src={heroImage} 
                alt="E-learning platform" 
                className="rounded-2xl shadow-2xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <GraduationCap className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-4xl font-bold">{courses.length}+</h3>
              <p className="text-muted-foreground">Courses Available</p>
            </div>
            <div className="space-y-2">
              <Users className="h-12 w-12 mx-auto text-accent" />
              <h3 className="text-4xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Active Students</p>
            </div>
            <div className="space-y-2">
              <Award className="h-12 w-12 mx-auto text-success" />
              <h3 className="text-4xl font-bold">50+</h3>
              <p className="text-muted-foreground">Expert Educators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Explore Our Courses</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse through our curated collection of high-quality courses taught by industry experts
            </p>
          </div>

          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onViewCourse={(id) => navigate(`/course/${id}`)}
                  isPurchased={purchasedCourseIds.has(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
