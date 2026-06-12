import React from "react";
import { Link } from "react-router-dom";
import { getBookings } from "@/lib/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MyBookings = () => {
  const contact = typeof window !== "undefined" ? localStorage.getItem("passengerContact") : null;
  const all = getBookings();
  const my = contact ? all.filter((b) => b.passengerContact === contact) : [];

  return (
    <div className="min-h-screen bg-background p-8">
      <nav className="mb-6">
        <Link to="/dashboard">Back to Dashboard</Link>
      </nav>
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {my.length === 0 ? (
            <div>No bookings found for your contact.</div>
          ) : (
            <div className="space-y-4">
              {my.map((b) => (
                <div key={b.id} className="p-3 border rounded">
                  <div><strong>Ride:</strong> {b.pickup} → {b.dropoff}</div>
                  <div><strong>Passenger:</strong> {b.passengerName} ({b.passengerContact})</div>
                  <div><strong>Status:</strong> {b.status}</div>
                  <div className="text-sm text-muted-foreground">Posted: {new Date(b.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyBookings;
