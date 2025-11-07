import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Course, hasPurchased } from "@/lib/supabase";
import { toast } from "sonner";
import { Clock, DollarSign, BookOpen, Play } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourse();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    
    if (session?.user && id) {
      const purchased = await hasPurchased(session.user.id, id);
      setIsPurchased(purchased);
    }
  };

  const loadCourse = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setCourse(data);
    }
    setIsLoading(false);
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!course) return;

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
      setIsPurchased(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase course");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {course.level && (
                <Badge variant="secondary" className="capitalize">
                  {course.level}
                </Badge>
              )}
              {course.category && (
                <Badge variant="outline">{course.category}</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-muted-foreground">{course.description}</p>
          </div>

          {/* Video Player */}
          <div className="mb-8">
            {isPurchased && course.video_url ? (
              <div className="aspect-video bg-card rounded-xl overflow-hidden shadow-card">
                <video
                  controls
                  className="w-full h-full"
                  src={course.video_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Play className="h-20 w-20 mx-auto text-primary/50" />
                  <p className="text-muted-foreground">
                    {isPurchased ? "Video not available" : "Purchase to access course content"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{course.duration || "N/A"} minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <DollarSign className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold text-2xl">${course.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <BookOpen className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-semibold capitalize">{course.level || "All levels"}</p>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          {!isPurchased && user && (
            <div className="flex justify-center">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={handlePurchase}
                className="px-12"
              >
                Purchase Course for ${course.price}
              </Button>
            </div>
          )}

          {isPurchased && (
            <div className="text-center">
              <Badge variant="default" className="bg-success">
                ✓ Purchased
              </Badge>
            </div>
          )}

          {!user && (
            <div className="text-center">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => navigate("/auth")}
                className="px-12"
              >
                Sign In to Purchase
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
