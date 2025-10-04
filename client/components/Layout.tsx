import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const links = [
    { to: "/", label: "Home" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-xl">
              <span className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600" />
              <span>Expence Flow</span>
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => cn("px-3 py-1.5 rounded-md text-sm hover:bg-accent", isActive && "bg-accent text-accent-foreground")}>{l.label}</NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground">{user.name} · {user.role}</span>
                <Button variant="outline" onClick={() => { logout(); if (loc.pathname.startsWith("/dashboard")) nav("/"); }}>Logout</Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost">Log in</Button></Link>
                <Link to="/signup"><Button>Get Started</Button></Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="mt-12 border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Expence Flow · Smart Expense Management</p>
          <p className="hidden sm:block">Secure · Role-based · Multi-level approvals</p>
        </div>
      </footer>
    </div>
  );
}
