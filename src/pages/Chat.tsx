import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookings, isBookingActive } from "@/lib/bookings";
import { getRides } from "@/lib/rides";
import { getUserFromToken } from "@/lib/mockApi";
import { incrementUnreadForRole, clearUnreadForRole } from "@/lib/chat";

type Msg = { sender: string; senderRole: "passenger" | "driver" | "system"; text: string; ts: string };

function storageKey(bookingId: string) {
  return `chat_${bookingId}`;
}

function loadMessages(bookingId: string): Msg[] {
  try {
    const raw = localStorage.getItem(storageKey(bookingId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(bookingId: string, msgs: Msg[]) {
  localStorage.setItem(storageKey(bookingId), JSON.stringify(msgs));
}

const Chat = () => {
  const { bookingId } = useParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    setMsgs(loadMessages(bookingId));
    // mark messages as read for current user when opening the chat
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const currentUser = getUserFromToken(token);
    const meRole = currentUser?.role as "passenger" | "driver" | undefined;
    if (bookingId && meRole) {
      clearUnreadForRole(bookingId, meRole);
    }
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  if (!bookingId) return <div>Invalid chat</div>;

  const booking = getBookings().find((b) => b.id === bookingId);
  const active = booking ? isBookingActive(booking) : false;
  const ride = booking ? getRides().find((r) => r.id === booking.rideId) : undefined;

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const currentUser = getUserFromToken(token);

  const meName = currentUser?.name || "You";
  const meRole: "passenger" | "driver" | undefined = currentUser?.role;

  const passengerLabel = booking?.passengerName || "Passenger";
  const driverLabel = ride?.driverName || "Driver";

  function post() {
    if (!text.trim()) return;
    const role = (meRole === "driver" || meRole === "passenger") ? meRole : (booking ? (booking.passengerContact === (currentUser?.contact || "") ? "passenger" : "driver") : "passenger");
    const m: Msg = { sender: meName, senderRole: role as any, text: text.trim(), ts: new Date().toISOString() };
    const next = [...msgs, m];
    setMsgs(next);
    saveMessages(bookingId, next);
    setText("");
    // increment unread for the other participant
    const other: "passenger" | "driver" = role === "passenger" ? "driver" : "passenger";
    incrementUnreadForRole(bookingId, other);
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background p-8">
        <nav className="mb-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </nav>
        <div className="max-w-2xl mx-auto bg-white rounded p-4 shadow">Booking not found.</div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="min-h-screen bg-background p-8">
        <nav className="mb-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </nav>
        <div className="max-w-2xl mx-auto bg-white rounded p-4 shadow">
          <h3 className="font-semibold">Chat unavailable</h3>
          <p className="mt-2">Chat is only available while the ride is active (within 1 hour after confirmation).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <nav className="mb-4">
        <Link to="/dashboard">Back to Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto bg-white rounded p-4 shadow">
        <h3 className="font-semibold">Chat for booking {bookingId}</h3>
        {booking ? (
          <div className="text-sm text-muted-foreground">Ride: {booking.pickup} → {booking.dropoff} • {driverLabel} ({ride?.driverContact})</div>
        ) : (
          <div className="text-sm text-muted-foreground">Booking not found.</div>
        )}

        <div className="mt-4 space-y-3 max-h-72 overflow-auto">
          {msgs.map((m, i) => (
            <div key={i} className={`p-2 rounded border ${m.senderRole === "driver" ? "bg-driver/5" : m.senderRole === "passenger" ? "bg-passenger/5" : "bg-gray-50"}`}>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{m.sender} • {m.senderRole}</div>
                <div className="text-xs text-muted-foreground">{new Date(m.ts).toLocaleString()}</div>
              </div>
              <div className="mt-1">{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <input className="flex-1 p-2 border rounded" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${meRole === "driver" ? passengerLabel : driverLabel}...`} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={post}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
