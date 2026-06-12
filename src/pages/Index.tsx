import { Button } from "@/components/ui/button";
import { Car, Users, Shield, MapPin, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">RideShare</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Share Your Ride, Share the Journey
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
              Connect with travelers heading your way. Save money, reduce emissions, and make new friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup?role=passenger">
                <Button variant="accent" size="xl" className="w-full sm:w-auto">
                  Find a Ride
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup?role=driver">
                <Button variant="outline" size="xl" className="w-full sm:w-auto bg-background/10 border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
                  Offer a Ride
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Routes
            </h2>
            <p className="text-muted-foreground text-lg">
              Frequently traveled destinations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { from: "Bengaluru", to: "Chennai", price: "₹200" },
              { from: "Tirupati", to: "Bengaluru", price: "₹200" },
              { from: "Hyderabad", to: "Vijayawada", price: "₹250" },
              { from: "Chennai", to: "Coimbatore", price: "₹300" },
            ].map((route, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">{route.price}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">{route.from}</p>
                  <div className="h-px bg-border"></div>
                  <p className="text-lg font-semibold text-foreground">{route.to}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose RideShare?
            </h2>
            <p className="text-muted-foreground text-lg">
              The smart way to travel
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Trusted Community",
                description: "Verified drivers and passengers with ratings and reviews",
              },
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Secure payments and 24/7 customer support",
              },
              {
                icon: Star,
                title: "Best Prices",
                description: "Save up to 70% compared to traditional travel",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-xl bg-gradient-card border border-border hover:shadow-soft transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join thousands of riders sharing their journey
            </p>
            <Link to="/signup">
              <Button variant="accent" size="xl">
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">RideShare</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 RideShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
