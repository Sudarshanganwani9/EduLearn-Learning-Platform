import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign } from "lucide-react";
import { Course } from "@/lib/supabase";

interface CourseCardProps {
  course: Course;
  onViewCourse?: (courseId: string) => void;
  showActions?: boolean;
  isPurchased?: boolean;
}

export const CourseCard = ({ course, onViewCourse, showActions = true, isPurchased = false }: CourseCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-border/50">
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/20">{course.title[0]}</span>
          </div>
        )}
        {course.level && (
          <Badge className="absolute top-2 right-2 capitalize" variant="secondary">
            {course.level}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{course.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold text-primary">${course.price}</span>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-6 pt-0">
          {isPurchased ? (
            <Button 
              className="w-full" 
              variant="success"
              onClick={() => onViewCourse?.(course.id)}
            >
              Watch Course
            </Button>
          ) : (
            <Button 
              className="w-full" 
              variant="gradient"
              onClick={() => onViewCourse?.(course.id)}
            >
              View Details
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
