import React from "react";
import { Link } from "react-router-dom";
import { getRidesByDriverContact } from "@/lib/rides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ManageRides = () => {
  const contact = typeof window !== "undefined" ? localStorage.getItem("driverContact") : null;
  const rides = contact ? getRidesByDriverContact(contact) : [];

  return (
    <div className="min-h-screen bg-background p-8">
      <nav className="mb-6">
        <Link to="/dashboard">Back to Dashboard</Link>
      </nav>
      <Card>
        <CardHeader>
          <CardTitle>Manage Rides</CardTitle>
        </CardHeader>
        <CardContent>
          {rides.length === 0 ? (
            <div>No rides posted yet.</div>
          ) : (
            <div className="space-y-4">
              {rides.map((r) => (
                <div key={r.id} className="p-3 border rounded">
                  <div><strong>Route:</strong> {r.pickup} → {r.dropoff}</div>
                  <div><strong>Fare:</strong> ₹{r.fare} • <strong>Seats:</strong> {r.seats}</div>
                  <div className="text-sm text-muted-foreground">Posted: {new Date(r.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRides;
