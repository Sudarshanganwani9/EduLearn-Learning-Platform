import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getUserRole, UserRole } from "@/lib/supabase";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserRole(session.user.id).then(setUserRole);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserRole(session.user.id).then(setUserRole);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EduLearn
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(userRole === 'educator' ? '/educator' : '/student')}
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button variant="gradient" size="sm" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
