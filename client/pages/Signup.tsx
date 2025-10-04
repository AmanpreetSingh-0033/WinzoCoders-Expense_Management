import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Building2, UserCircle, Mail, Lock, Globe, Briefcase } from "lucide-react";

interface Country { name: { common: string }; currencies?: Record<string, any> }

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [role, setRole] = useState<"MANAGER" | "EMPLOYEE">("EMPLOYEE");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [isJoiningCompany, setIsJoiningCompany] = useState(false);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((j) => {
        // Ensure we have an array before setting countries
        if (Array.isArray(j)) {
          setCountries(j);
        } else {
          console.error("Countries API did not return an array:", j);
          setCountries([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load countries:", err);
        setCountries([]);
      });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      // Call signup API (creates company + admin)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, companyName, country }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Signup failed");
      }
      
      const data = await res.json();
      
      // Auto-login using the signup function from useAuth
      await signup(data);
      
      // Show success message
      toast.success("Welcome! Your company has been created successfully.", {
        duration: 3000,
      });
      
      // Redirect to admin dashboard
      nav("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Failed to create company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center min-h-[70vh] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-2">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Your Company</CardTitle>
          <CardDescription>
            Register your company and create your admin account
            <br />
            <span className="text-xs text-muted-foreground">You'll be automatically logged in after signup</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Admin Badge */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-primary">
                <Briefcase className="h-5 w-5" />
                <span className="font-semibold">Admin Account Creation</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your account will be created as Admin with full access to all features.
              </p>
            </div>

            {/* Name and Email */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className={`text-xs ${password && confirmPassword && password !== confirmPassword ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {password && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : 'Re-enter your password'}
                </p>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Inc"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Country
              </Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(countries) && countries.length > 0 ? (
                    countries
                      .sort((a, b) => a.name.common.localeCompare(b.name.common))
                      .map((c) => (
                        <SelectItem key={c.name.common} value={c.name.common}>
                          {c.name.common}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading countries...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Currency will be auto-detected from your country
              </p>
            </div>

            {/* Submit Button */}
            <Button className="w-full" disabled={loading} size="lg">
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Creating your company...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Company & Become Admin
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
