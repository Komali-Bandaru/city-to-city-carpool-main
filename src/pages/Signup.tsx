import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, User } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { signup as apiSignup } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "passenger";
  const [activeTab, setActiveTab] = useState(defaultRole);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pName, setPName] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pPassword, setPPassword] = useState("");
  const [dName, setDName] = useState("");
  const [dEmail, setDEmail] = useState("");
  const [dPhone, setDPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [seating, setSeating] = useState<number | string>(4);
  const [dPassword, setDPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Car className="h-8 w-8 text-primary-foreground" />
            <span className="text-2xl font-bold text-primary-foreground">RideShare</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">Create Account</h1>
          <p className="text-primary-foreground/80">Join our community of riders</p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Choose your account type</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="passenger" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Passenger
                </TabsTrigger>
                <TabsTrigger value="driver" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Driver
                </TabsTrigger>
              </TabsList>

              <TabsContent value="passenger" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passenger-name">Full Name</Label>
                  <Input id="passenger-name" placeholder="John Doe" value={pName} onChange={(e) => setPName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passenger-email">Email</Label>
                  <Input id="passenger-email" type="email" placeholder="john@example.com" value={pEmail} onChange={(e) => setPEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passenger-phone">Phone Number</Label>
                  <Input id="passenger-phone" type="tel" placeholder="+91 98765 43210" value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passenger-password">Password</Label>
                  <Input id="passenger-password" type="password" placeholder="••••••••" value={pPassword} onChange={(e) => setPPassword(e.target.value)} />
                </div>
                <Button
                  className="w-full"
                  variant="hero"
                  size="lg"
                  onClick={() => {
                    if (!pName.trim()) {
                      toast({ title: "Missing name", description: "Please enter your full name.", variant: "destructive" });
                      return;
                    }
                    if (!pEmail.trim() && !pPhone.trim()) {
                      toast({ title: "Missing contact", description: "Enter email or phone to sign up.", variant: "destructive" });
                      return;
                    }
                    const res = apiSignup({ name: pName, email: pEmail, contact: pPhone, password: pPassword, role: "passenger" }) as any;
                    if (!res.ok) {
                      toast({ title: "Signup failed", description: res.error || "", variant: "destructive" });
                      return;
                    }
                    toast({ title: "Account created", description: "Please login to continue." });
                    const identifier = pEmail.trim() || pPhone.trim();
                    navigate(`/login?role=passenger&identifier=${encodeURIComponent(identifier)}`);
                  }}
                >
                  Create Passenger Account
                </Button>
              </TabsContent>

              <TabsContent value="driver" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driver-name">Full Name</Label>
                  <Input id="driver-name" placeholder="John Doe" value={dName} onChange={(e) => setDName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-email">Email</Label>
                  <Input id="driver-email" type="email" placeholder="john@example.com" value={dEmail} onChange={(e) => setDEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-phone">Phone Number</Label>
                  <Input id="driver-phone" type="tel" placeholder="+91 98765 43210" value={dPhone} onChange={(e) => setDPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-model">Vehicle Model</Label>
                    <Input id="vehicle-model" placeholder="Honda City" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-number">Vehicle Number</Label>
                    <Input id="vehicle-number" placeholder="KA01AB1234" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seating-capacity">Seating Capacity</Label>
                  <Input id="seating-capacity" type="number" placeholder="4" min="1" max="8" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-model">Vehicle Model</Label>
                    <Input id="vehicle-model" placeholder="Honda City" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-number">Vehicle Number</Label>
                    <Input id="vehicle-number" placeholder="KA01AB1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seating-capacity">Seating Capacity</Label>
                  <Input id="seating-capacity" type="number" placeholder="4" min="1" max="8" value={String(seating)} onChange={(e) => setSeating(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-password">Password</Label>
                  <Input id="driver-password" type="password" placeholder="••••••••" value={dPassword} onChange={(e) => setDPassword(e.target.value)} />
                </div>
                <Button
                  className="w-full"
                  variant="hero"
                  size="lg"
                  onClick={() => {
                    if (!dName.trim()) {
                      toast({ title: "Missing name", description: "Please enter your full name.", variant: "destructive" });
                      return;
                    }
                    if (!dEmail.trim() && !dPhone.trim()) {
                      toast({ title: "Missing contact", description: "Enter email or phone to sign up.", variant: "destructive" });
                      return;
                    }
                    const res = apiSignup({ name: dName, email: dEmail, contact: dPhone, password: dPassword, role: "driver" }) as any;
                    if (!res.ok) {
                      toast({ title: "Signup failed", description: res.error || "", variant: "destructive" });
                      return;
                    }
                    toast({ title: "Account created", description: "Please login to continue." });
                    const identifier = dEmail.trim() || dPhone.trim();
                    navigate(`/login?role=driver&identifier=${encodeURIComponent(identifier)}`);
                  }}
                >
                  Create Driver Account
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
