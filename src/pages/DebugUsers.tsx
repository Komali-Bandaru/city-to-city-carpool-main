import React from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "@/lib/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DebugUsers = () => {
  const users = typeof window !== "undefined" ? getAllUsers() : [];
  return (
    <div className="min-h-screen bg-background p-8">
      <nav className="mb-6">
        <Link to="/">Back Home</Link>
      </nav>
      <Card>
        <CardHeader>
          <CardTitle>Debug: Mock Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div>No users created yet.</div>
          ) : (
            <div className="space-y-4">
              {users.map((u: any, i: number) => (
                <div key={i} className="p-3 border rounded">
                  <div><strong>Name:</strong> {u.name}</div>
                  <div><strong>Email:</strong> {u.email || "-"}</div>
                  <div><strong>Contact:</strong> {u.contact || "-"}</div>
                  <div><strong>Role:</strong> {u.role}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugUsers;
