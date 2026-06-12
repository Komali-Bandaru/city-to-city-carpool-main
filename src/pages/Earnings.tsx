import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Earnings = () => {
  // Placeholder earnings view — in a real app this would calculate from confirmed bookings
  return (
    <div className="min-h-screen bg-background p-8">
      <nav className="mb-6">
        <Link to="/dashboard">Back to Dashboard</Link>
      </nav>
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded">
              <div className="text-lg font-bold">₹4,200</div>
              <div className="text-sm text-muted-foreground">Earnings (this month) — sample value</div>
            </div>
            <div className="text-sm text-muted-foreground">In a real app, earnings are computed from confirmed bookings.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;
