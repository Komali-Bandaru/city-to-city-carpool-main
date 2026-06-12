import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Mail, Lock } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login as apiLogin } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("password");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromQuery = (searchParams.get("role") as string) || (localStorage.getItem("role") as string) || "passenger";
  const { toast } = useToast();
  const initialIdentifier = (searchParams.get("identifier") as string) || "";
  const [email, setEmail] = useState(initialIdentifier.includes("@") ? initialIdentifier : "");
  const [password, setPassword] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState(!initialIdentifier.includes("@") ? initialIdentifier : "");
  const [otp, setOtp] = useState("");

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Car className="h-8 w-8 text-primary-foreground" />
            <span className="text-2xl font-bold text-primary-foreground">RideShare</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">Welcome Back</h1>
          <p className="text-primary-foreground/80">Login to continue your journey</p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Choose your preferred login method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Button
                  className="w-full"
                  variant="hero"
                  size="lg"
                  onClick={() => {
                    // perform mock login
                    const res = apiLogin(email, password);
                    if (!res.ok) {
                      toast({ title: "Login failed", description: res.error || "" , variant: "destructive"});
                      return;
                    }
                    const { token, user } = res as any;
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("role", user.role);
                    // persist display name and contact for dashboard personalization
                    if (user.role === "passenger") {
                      localStorage.setItem("passengerName", user.name);
                      if (user.contact) localStorage.setItem("passengerContact", user.contact.replace(/\D/g, ""));
                    } else if (user.role === "driver") {
                      localStorage.setItem("driverName", user.name);
                      if (user.contact) localStorage.setItem("driverContact", user.contact.replace(/\D/g, ""));
                    }
                    toast({ title: "Signed in", description: `Welcome ${user.name}` });
                    navigate(`/dashboard?role=${user.role}`, { replace: true });
                  }}
                >
                  Login with Password
                </Button>
              </TabsContent>

              <TabsContent value="otp" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-email">Email or Phone</Label>
                  <Input id="phone-email" placeholder="john@example.com or +91 98765 43210" value={phoneOrEmail} onChange={(e) => setPhoneOrEmail(e.target.value)} />
                </div>
                <Button className="w-full" variant="hero" size="lg">
                  Send OTP
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input id="otp" placeholder="Enter 6-digit OTP" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
                <Button
                  className="w-full"
                  variant="default"
                  size="lg"
                  onClick={() => {
                    // For mock OTP flow just log the user in if email exists
                    const res = apiLogin(phoneOrEmail);
                    if (!res.ok) {
                      toast({ title: "Login failed", description: res.error || "", variant: "destructive" });
                      return;
                    }
                    const { token, user } = res as any;
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("role", user.role);
                    // persist display name and contact for dashboard personalization (OTP flow)
                    if (user.role === "passenger") {
                      localStorage.setItem("passengerName", user.name);
                      if (user.contact) localStorage.setItem("passengerContact", user.contact.replace(/\D/g, ""));
                    } else if (user.role === "driver") {
                      localStorage.setItem("driverName", user.name);
                      if (user.contact) localStorage.setItem("driverContact", user.contact.replace(/\D/g, ""));
                    }
                    toast({ title: "Signed in", description: `Welcome ${user.name}` });
                    navigate(`/dashboard?role=${user.role}`, { replace: true });
                  }}
                >
                  Verify OTP
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
