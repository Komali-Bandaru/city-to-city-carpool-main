import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, MapPin, Calendar, Users, Star, ArrowRight, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const SearchRides = () => {
  const [searchResults] = useState([
    {
      id: 1,
      driver: "Rajesh Kumar",
      rating: 4.8,
      from: "Bengaluru",
      to: "Chennai",
      date: "Dec 25, 2024",
      time: "08:00 AM",
      price: 200,
      seatsAvailable: 2,
      vehicle: "Honda City",
      reviews: 24,
    },
    {
      id: 2,
      driver: "Priya Sharma",
      rating: 4.9,
      from: "Bengaluru",
      to: "Chennai",
      date: "Dec 25, 2024",
      time: "10:30 AM",
      price: 220,
      seatsAvailable: 3,
      vehicle: "Toyota Innova",
      reviews: 31,
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">RideShare</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="shadow-medium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search for Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search-from">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="search-from" placeholder="Bengaluru" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-to">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="search-to" placeholder="Chennai" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search-date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="search-date" type="date" className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="sort">Sort By</Label>
                  <Select defaultValue="price">
                    <SelectTrigger id="sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="rating">Rating: High to Low</SelectItem>
                      <SelectItem value="time">Departure Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="hero" size="lg" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Available Rides</h2>
            <p className="text-muted-foreground">{searchResults.length} rides found</p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {searchResults.map((ride) => (
            <Card key={ride.id} className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Ride Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {ride.driver.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{ride.driver}</p>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 fill-accent text-accent" />
                              <span className="font-medium">{ride.rating}</span>
                              <span className="text-muted-foreground">({ride.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{ride.vehicle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">{ride.from}</span>
                        </div>
                        <div className="h-px bg-border ml-6 mb-1"></div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="font-semibold text-foreground">{ride.to}</span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p className="flex items-center gap-1 mb-1">
                          <Calendar className="h-3 w-3" />
                          {ride.date}
                        </p>
                        <p>{ride.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? "s" : ""} available
                      </span>
                    </div>
                  </div>

                  {/* Price & Book */}
                  <div className="flex md:flex-col items-center md:items-end gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">₹{ride.price}</div>
                      <p className="text-xs text-muted-foreground">per seat</p>
                    </div>
                    <Button variant="accent" size="lg" className="flex items-center gap-2">
                      Book Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {searchResults.length === 0 && (
          <Card className="shadow-soft">
            <CardContent className="py-16 text-center">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No rides found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or dates
              </p>
              <Button variant="outline">Clear Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchRides;
