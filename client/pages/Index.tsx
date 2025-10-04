import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp,
  Scan,
  GitBranch,
  Sparkles,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";

export default function Index() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Badge className="mx-auto" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Expense Management
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Simplify Expense Management
              <span className="block text-primary mt-2">with AI-Powered Approvals</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Smart reimbursements, multi-level approvals, and OCR receipts — all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Hero Illustration */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="rounded-xl border bg-card shadow-2xl p-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Submit Expense Card */}
                  <div className="space-y-3 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-semibold">Submit Expense</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">$125.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>Meals</span>
                      </div>
                      <Badge className="w-full justify-center" variant="secondary">
                        <Scan className="h-3 w-3 mr-1" />
                        OCR Auto-filled
                      </Badge>
                    </div>
                  </div>

                  {/* Approval Flow Card */}
                  <div className="space-y-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-semibold">Multi-Level</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Manager</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Finance</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-4 w-4 rounded-full border-2 border-primary animate-pulse" />
                        <span className="font-medium">CFO Review</span>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Card */}
                  <div className="space-y-3 p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-semibold">Analytics</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">This Month:</span>
                        <span className="font-semibold">$12,450</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Trend:</span>
                        <Badge variant="default" className="bg-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +12%
                        </Badge>
                      </div>
                      <div className="h-12 bg-gradient-to-r from-purple-200 to-purple-400 dark:from-purple-800 dark:to-purple-600 rounded-md flex items-end justify-around p-1">
                        <div className="w-1/5 bg-white dark:bg-gray-800 rounded h-1/3" />
                        <div className="w-1/5 bg-white dark:bg-gray-800 rounded h-1/2" />
                        <div className="w-1/5 bg-white dark:bg-gray-800 rounded h-2/3" />
                        <div className="w-1/5 bg-white dark:bg-gray-800 rounded h-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">Everything you need to manage expenses</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your expense management workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Scan className="h-8 w-8" />}
              title="AI Receipt Scanning"
              description="OCR technology automatically extracts data from receipts - no manual entry needed"
              color="blue"
            />
            <FeatureCard
              icon={<GitBranch className="h-8 w-8" />}
              title="Multi-Level Approvals"
              description="Customizable approval workflows: Manager → Finance → Director → CFO"
              color="green"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Conditional Rules"
              description="Smart approval logic with percentage thresholds and specific approver overrides"
              color="purple"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Real-Time Dashboard"
              description="Comprehensive analytics and reports with interactive charts and insights"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">Simple 3-step process</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From submission to reimbursement in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              icon={<FileText className="h-12 w-12" />}
              title="Submit Expense"
              description="Upload receipt, add details, or use OCR to auto-fill. Support for multiple currencies."
            />
            <StepCard
              number="2"
              icon={<Users className="h-12 w-12" />}
              title="Get Approvals"
              description="Automatic routing through approval chain. Real-time notifications and status tracking."
            />
            <StepCard
              number="3"
              icon={<TrendingUp className="h-12 w-12" />}
              title="Reimburse Quickly"
              description="Fast processing with conditional rules. Automated workflows reduce approval time by 70%."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">Choose your plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing for teams of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              description="Perfect for small teams"
              features={[
                "Up to 10 users",
                "Basic approval workflows",
                "Email support",
                "1GB storage"
              ]}
            />
            <PricingCard
              name="Pro"
              price="$29"
              description="For growing businesses"
              features={[
                "Up to 50 users",
                "Advanced workflows",
                "Priority support",
                "10GB storage",
                "OCR scanning",
                "Custom reports"
              ]}
              popular
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large organizations"
              features={[
                "Unlimited users",
                "Custom workflows",
                "24/7 support",
                "Unlimited storage",
                "Advanced analytics",
                "SSO & compliance"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold">Loved by teams Winzo Coders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Expence Flow reduced our expense processing time by 70%. The OCR feature is a game-changer!"
              author="Sarah Johnson"
              role="CFO, TechCorp"
            />
            <TestimonialCard
              quote="The multi-level approval workflow is exactly what we needed. Setup was incredibly easy."
              author="Michael Chen"
              role="Finance Manager, StartupXYZ"
            />
            <TestimonialCard
              quote="Best expense management tool we've used. The conditional rules save us hours every week."
              author="Emily Rodriguez"
              role="Operations Director, GlobalCo"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of companies streamlining their expense management
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Expence Flow</h3>
              <p className="text-sm text-muted-foreground">
                Smart expense management for modern teams
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Expence Flow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
    orange: "bg-orange-500/10 text-orange-600",
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className={`h-16 w-16 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, icon, title, description }: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
        {icon}
      </div>
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 text-8xl font-bold text-muted/10">
        {number}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, description, features, popular }: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <Card className={`relative ${popular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Link to="/signup" className="block">
          <Button className="w-full" variant={popular ? "default" : "outline"}>
            Get Started
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, author, role }: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <p className="text-muted-foreground italic mb-4">"{quote}"</p>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}
