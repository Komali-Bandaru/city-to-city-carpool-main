import { Button } from "@/components/ui/button";
import { Car, MapPin, Calendar, Users, DollarSign, ClipboardList } from "lucide-react";
import SlideToConfirm from "@/components/ui/slide-to-confirm";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBookings, getPendingBookings, saveBooking, updateBookingStatus, Booking, isBookingActive, sweepCompleteBookings, markBookingRated } from "@/lib/bookings";
import { getUnreadCounts, appendSystemMessage } from "@/lib/chat";
import { addPassengerFeedback, getPassengerFeedbackStats, getFeedbackByBookingId } from "@/lib/passengerFeedback";
import { addFeedback } from "@/lib/rides";
import { addEarnings, getEarnings } from "@/lib/earnings";
import { isDriverFlagged, getFlagReasons } from "@/lib/fraud";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getRides, saveRide, Ride, getRidesByDriverContact } from "@/lib/rides";

const PassengerView = ({ availableRides, unreadMap }: any) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingContact, setBookingContact] = useState("");
  const { toast } = useToast();
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const [flagReasons, setFlagReasons] = useState<string[]>([]);
  const [pendingFlagBooking, setPendingFlagBooking] = useState<any | null>(null);
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  function handleCheck() {
    const f = from.trim().toLowerCase();
    const t = to.trim().toLowerCase();
    const matched = availableRides.filter((r: any) => r.pickup.toLowerCase().includes(f) && r.dropoff.toLowerCase().includes(t));
    setResults(matched);
  }

  function openBookingModal(ride: any) {
    setSelectedRide(ride);
    setBookingName((typeof window !== "undefined" && localStorage.getItem("passengerName")) || "");
    setBookingContact((typeof window !== "undefined" && localStorage.getItem("passengerContact")) || "");
    setBookingModalOpen(true);
  }

  function handleBookConfirm() {
    if (!selectedRide) return;
    if (!bookingName || !bookingContact) {
      toast({ title: "Missing info", description: "Please enter name and contact.", variant: "destructive" });
      return;
    }
    // if driver flagged, ask confirmation
    const flagged = isDriverFlagged(selectedRide.driverContact || selectedRide.contact);
    if (flagged) {
      setPendingFlagBooking({ ride: selectedRide, name: bookingName, contact: bookingContact });
      setFlagReasons(getFlagReasons(selectedRide.driverContact || selectedRide.contact));
      setShowFlagConfirm(true);
      return;
    }

    const booking = saveBooking({
      rideId: selectedRide.id,
      passengerName: bookingName,
      passengerContact: bookingContact,
      pickup: selectedRide.pickup,
      dropoff: selectedRide.dropoff,
    });
    // remember passenger contact so "My Bookings" can show
    localStorage.setItem("passengerContact", bookingContact);
    localStorage.setItem("passengerName", bookingName);
    setBookings((s) => [...s, booking]);
    setBookingModalOpen(false);
    toast({ title: "Booking sent", description: "Your booking request was sent to the driver." });
    // After booking, nothing else here; driver will see pending request and can cancel/accept
  }

  function proceedFlaggedBooking() {
    if (!pendingFlagBooking) return;
    const { ride, name, contact } = pendingFlagBooking;
    const booking = saveBooking({
      rideId: ride.id,
      passengerName: name,
      passengerContact: contact,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
    });
    localStorage.setItem("passengerContact", contact);
    localStorage.setItem("passengerName", name);
    setBookings((s) => [...s, booking]);
    setBookingModalOpen(false);
    setShowFlagConfirm(false);
    setPendingFlagBooking(null);
    toast({ title: "Booking sent", description: "Your booking request was sent to the driver despite warnings." });
  }

  function cancelFlaggedBooking() {
    setShowFlagConfirm(false);
    setPendingFlagBooking(null);
  }

  const passengerContact = typeof window !== "undefined" ? localStorage.getItem("passengerContact") : null;
  const myBookings = passengerContact ? bookings.filter((b) => b.passengerContact === passengerContact) : [];

  // poll bookings so we detect completed changes and prompt for feedback
  useEffect(() => {
    const t = setInterval(() => setBookings(getBookings()), 2000);
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "ride_bookings_v1") setBookings(getBookings());
    };
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(t); window.removeEventListener("storage", onStorage); };
  }, []);

  // when a booking becomes completed and not yet rated, prompt feedback
  useEffect(() => {
    const contact = passengerContact;
    if (!contact) return;
    const completedButNotRated = bookings.find((b) => b.passengerContact === contact && b.status === "completed" && !b.rated);
    if (completedButNotRated) {
      setFeedbackBooking(completedButNotRated);
    }
  }, [bookings]);

  return (
    <>
      <div className="bg-blue-500/80 backdrop-blur-sm rounded-2xl px-8 py-4 text-center">
        <h2 className="text-2xl font-bold text-white">Find Rides</h2>
      </div>

      <div className="bg-slate-700/70 backdrop-blur-sm rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="p-3 rounded-md" placeholder="From (city/area)" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="p-3 rounded-md" placeholder="To (city/area)" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button className="w-full" onClick={handleCheck}>Check</Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Available Matches</h3>
            {results.map((ride: any) => {
              const driverLabel = ride.driver || ride.driverName || "Driver";
              const driverContact = ride.driverContact || ride.contact || "";
              const flagged = isDriverFlagged(driverContact);
              const reasons = getFlagReasons(driverContact);
              return (
                <div key={ride.id} className="bg-blue-400/20 rounded-md p-4 text-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {driverLabel}
                      {flagged && (
                        <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded" title={reasons.join("; ")}>Flagged</span>
                      )}
                    </div>
                    <div className="text-sm">{ride.pickup} → {ride.dropoff}</div>
                    {ride.cabNumber ? <div className="text-sm">Cab: {ride.cabNumber}</div> : null}
                    {ride.avgRating ? (
                      <div className="text-sm">
                        Rating: {ride.avgRating} / 5
                        {ride.feedbacks && ride.feedbacks.length > 0 ? (() => {
                          const total = ride.feedbacks.length;
                          const positive = ride.feedbacks.filter((f: any) => f.rating >= 4).length;
                          const negative = ride.feedbacks.filter((f: any) => f.rating <= 2).length;
                          return (<span className="ml-2">• +{Math.round((positive/total)*100)}% / -{Math.round((negative/total)*100)}%</span>);
                        })() : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">₹{ride.fare}</div>
                    <Button onClick={() => openBookingModal(ride)}>Book the ride</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-white font-semibold">My Bookings</h3>
          {myBookings.length === 0 ? (
            <p className="text-sm text-white/80">No bookings yet.</p>
          ) : (
            myBookings.map((b) => (
              <div key={b.id} className="bg-slate-800/50 p-3 rounded-md text-white mt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{b.passengerName}</div>
                    <div className="text-sm">{b.pickup} → {b.dropoff}</div>
                    <div className="text-sm">Contact: {b.passengerContact}</div>
                    <div className="text-sm text-white/80">Booked: {new Date(b.createdAt).toLocaleString()}</div>
                    {b.confirmedAt ? (<div className="text-sm text-green-200">Confirmed: {new Date(b.confirmedAt).toLocaleString()}</div>) : null}
                    {(() => {
                      const rideForBooking = getRides().find((r) => r.id === b.rideId);
                      if (!rideForBooking) return null;
                      const flagged = isDriverFlagged(rideForBooking.driverContact || "");
                      return (
                          <div className="text-sm mt-1">
                          Driver: {rideForBooking.driverName || "Driver"} {flagged ? (<span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded">Flagged</span>) : null}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="text-sm text-right">
                    <div className="mb-2">{b.status.toUpperCase()}</div>
                    <div className="flex flex-col gap-2">
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <button
                          className="text-sm bg-red-600 px-3 py-1 rounded"
                          onClick={() => {
                            updateBookingStatus(b.id, "cancelled");
                            setBookings((s) => s.map((x) => (x.id === b.id ? { ...x, status: "cancelled" } : x)));
                            toast({ title: "Booking cancelled", description: "You cancelled this booking.", variant: "destructive" });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      {isBookingActive(b) ? (
                        <a href={`/chat/${b.id}`} className="text-sm underline">Open Chat {unreadMap[b.id] && unreadMap[b.id].passenger ? (<span className="ml-2 text-xs bg-red-600 text-white px-2 rounded">{unreadMap[b.id].passenger}</span>) : null}</a>
                      ) : (
                        <div className="text-sm text-muted-foreground">Chat available after confirmation and while ride active</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking dialog moved inside PassengerView so it has access to state */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent>
          <DialogTitle>Book Ride</DialogTitle>
          <DialogDescription>
            {selectedRide ? (
              <div className="space-y-2">
                <div className="font-semibold">{selectedRide.driver}</div>
                <div className="text-sm">{selectedRide.pickup} → {selectedRide.dropoff}</div>
                <div className="text-sm">Fare: ₹{selectedRide.fare}</div>
              </div>
            ) : null}
          </DialogDescription>
          <div className="grid grid-cols-1 gap-2 mt-4">
            <input className="p-2 rounded-md" placeholder="Your name" value={bookingName} onChange={(e) => setBookingName(e.target.value)} />
            <input className="p-2 rounded-md" placeholder="Phone or email" value={bookingContact} onChange={(e) => setBookingContact(e.target.value)} />
          </div>
          <DialogFooter>
            <div className="flex gap-2 w-full justify-end">
              <button className="btn" onClick={() => setBookingModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBookConfirm}>Confirm Booking</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flagged booking confirmation dialog */}
      <Dialog open={showFlagConfirm} onOpenChange={setShowFlagConfirm}>
        <DialogContent>
          <DialogTitle>Driver flagged</DialogTitle>
          <DialogDescription>
            <p>This driver has been flagged for the following reasons:</p>
            <ul className="list-disc ml-6 mt-2">
              {flagReasons.map((r, i) => (
                <li key={i} className="text-sm">{r}</li>
              ))}
            </ul>
            <p className="mt-4">Are you sure you want to continue with this booking?</p>
          </DialogDescription>
          <DialogFooter>
            <div className="flex gap-2 w-full justify-end">
              <button className="btn" onClick={cancelFlaggedBooking}>Cancel</button>
              <button className="btn btn-primary" onClick={proceedFlaggedBooking}>Continue</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback dialog shown to passenger after completion */}
      <Dialog open={!!feedbackBooking} onOpenChange={() => setFeedbackBooking(null)}>
        <DialogContent>
          <DialogTitle>Rate your ride</DialogTitle>
          <DialogDescription>
            <p>Please rate your experience with the driver and leave optional feedback.</p>
          </DialogDescription>
          <div className="mt-4 space-y-2">
            <div>
              <label className="block text-sm mb-1">Rating (1-5)</label>
              <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Feedback</label>
              <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="p-2 border rounded w-full" />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2 w-full justify-end">
              <button className="btn" onClick={() => setFeedbackBooking(null)}>Skip</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!feedbackBooking) return;
                  const ride = getRides().find((r) => r.id === feedbackBooking.rideId);
                  if (ride) {
                    addFeedback(ride.id, { from: feedbackBooking.passengerContact, rating, comment: feedbackText });
                    // credit earnings to driver
                    addEarnings(ride.driverContact || "", ride.fare || 0);
                    // notify driver via system chat message
                    appendSystemMessage(feedbackBooking.id, `Passenger ${feedbackBooking.passengerName} rated the ride ${rating}/5: ${feedbackText || "(no comment)"}`, "driver");
                  }
                  markBookingRated(feedbackBooking.id, true);
                  setBookings((s) => s.map((b) => (b.id === feedbackBooking.id ? { ...b, rated: true } : b)));
                  setFeedbackBooking(null);
                  setRating(5);
                  setFeedbackText("");
                  toast({ title: "Thanks!", description: "Your feedback was submitted." });
                }}
              >
                Submit
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const DriverView = ({ refreshRides, unreadMap }: { refreshRides: () => void; unreadMap: Record<string, { passenger: number; driver: number }>; }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const { toast } = useToast();
  const [driverName, setDriverName] = useState<string>(typeof window !== "undefined" ? (localStorage.getItem("driverName") || "") : "");
  const [driverContact, setDriverContact] = useState<string>(typeof window !== "undefined" ? (localStorage.getItem("driverContact") || "") : "");
  const [driverEarnings, setDriverEarnings] = useState<number>(0);
  const [vehicle, setVehicle] = useState("");
  const [cabNumber, setCabNumber] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [seats, setSeats] = useState<number>(4);
  const [fare, setFare] = useState<number>(100);

  useEffect(() => {
    // load bookings for this driver (pending for driver's rides)
    const contact = driverContact || localStorage.getItem("driverContact") || "";
    setBookings(getPendingBookings().filter((b) => {
      const rides = getRidesByDriverContact(contact);
      return rides.some((r) => r.id === b.rideId);
    }));

    setMyRides(getRidesByDriverContact(contact));
    setDriverEarnings(getEarnings(contact || ""));
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "driver_earnings_v1") {
        setDriverEarnings(getEarnings(contact || ""));
      }
      if (e.key === "ride_bookings_v1") {
        setBookings(getPendingBookings().filter((b) => {
          const rides = getRidesByDriverContact(contact);
          return rides.some((r) => r.id === b.rideId);
        }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [driverContact]);

  // Driver: rating by drivers is disabled; drivers can view passenger feedback only

  function handlePostRide() {
    if (!driverName || !driverContact || !pickup || !dropoff) {
      window.alert("Please fill driver name, contact, pickup and dropoff");
      return;
    }
    const newRide = saveRide({
      driverName,
      driverContact,
      vehicle,
      cabNumber,
      departure: new Date().toISOString(),
      pickup,
      dropoff,
      seats,
      fare,
    });
    localStorage.setItem("driverName", driverName);
    localStorage.setItem("driverContact", driverContact);
    setMyRides((s) => [...s, newRide]);
    refreshRides();
    window.alert("Ride posted");
  }

  function handleAccept(b: Booking) {
    const updated = updateBookingStatus(b.id, "confirmed");
    setBookings((s) => s.filter((x) => x.id !== b.id));
    if (updated) {
      toast({ title: "Booking confirmed", description: `${updated.passengerName} — ${updated.passengerContact}` });
      // credit nothing yet; earnings credited when booking moves to completed
    }
  }

  function handleDecline(b: Booking) {
    updateBookingStatus(b.id, "declined");
    setBookings((s) => s.filter((x) => x.id !== b.id));
    toast({ title: "Booking declined", description: "You declined the booking." , variant: "destructive"});
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/80 backdrop-blur-sm rounded-2xl px-8 py-4 text-center">
        <h2 className="text-2xl font-bold text-white">DRIVER DASHBOARD</h2>
      </div>

      <div className="bg-slate-700/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-slate-800/60 rounded-xl">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6" />
              <div>
                <p className="text-sm">My Rides</p>
                <p className="text-xl font-bold">{myRides.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-800/60 rounded-xl">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6" />
              <div>
                <p className="text-sm">Earnings (this month)</p>
                <p className="text-xl font-bold">₹{driverEarnings}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-800/60 rounded-xl">
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6" />
              <div>
                <p className="text-sm">Total Rides</p>
                <p className="text-xl font-bold">{myRides.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-white font-semibold">Post a Ride</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            <input className="p-2 rounded-md text-black" placeholder="Driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            <input className="p-2 rounded-md text-black" placeholder="Contact (phone/email)" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} />
            <input className="p-2 rounded-md text-black" placeholder="Vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            <input className="p-2 rounded-md text-black" placeholder="Cab number / reg" value={cabNumber} onChange={(e) => setCabNumber(e.target.value)} />
            <input className="p-2 rounded-md text-black" placeholder="Pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} />
            <input className="p-2 rounded-md text-black" placeholder="Dropoff" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
            <input className="p-2 rounded-md text-black" placeholder="Fare" type="number" value={fare} onChange={(e) => setFare(Number(e.target.value))} />
          </div>
          <div className="mt-3">
            <Button onClick={handlePostRide} className="bg-green-600">Post Ride</Button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-white font-semibold">My Rides & Bookings</h3>
          {myRides.length === 0 ? (
            <p className="text-sm text-white/80">You haven't posted any rides yet.</p>
          ) : (
            myRides.map((ride) => {
              const bookingsForRide = getBookings().filter((b) => b.rideId === ride.id);
              const pending = bookingsForRide.filter((b) => b.status === "pending");
              const confirmed = bookingsForRide.filter((b) => b.status === "confirmed");
              return (
                <div key={ride.id} className="bg-slate-800/50 p-4 rounded-md text-white mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{ride.pickup} → {ride.dropoff}</div>
                      <div className="text-sm">Driver: {ride.driverName} • Fare: ₹{ride.fare} • Seats: {ride.seats}</div>
                    </div>
                    <div className="text-sm">Posted: {new Date(ride.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold">Pending Requests</h4>
                    {pending.length === 0 ? (
                      <p className="text-sm text-white/80">No pending bookings for this ride.</p>
                    ) : (
                      pending.map((b) => (
                        <div key={b.id} className="bg-slate-700/40 p-3 rounded-md mt-2 flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{b.passengerName}</div>
                            <div className="text-sm">{b.pickup} → {b.dropoff}</div>
                              <div className="text-sm">Contact: {b.passengerContact}</div>
                              <div className="text-sm text-white/80">Booked: {new Date(b.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <SlideToConfirm
                              label="Slide to accept booking"
                              onConfirm={() => {
                                handleAccept(b);
                                // refresh local list
                                setBookings(getPendingBookings().filter((x) => {
                                  const rides = getRidesByDriverContact(driverContact || localStorage.getItem("driverContact") || "");
                                  return rides.some((r) => r.id === x.rideId);
                                }));
                              }}
                              onCancel={() => {
                                handleDecline(b);
                                setBookings(getPendingBookings().filter((x) => {
                                  const rides = getRidesByDriverContact(driverContact || localStorage.getItem("driverContact") || "");
                                  return rides.some((r) => r.id === x.rideId);
                                }));
                              }}
                              confirmLabel="Accept"
                              cancelLabel="Decline"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold">Confirmed Bookings</h4>
                    {confirmed.length === 0 ? (
                      <p className="text-sm text-white/80">No confirmed bookings yet.</p>
                    ) : (
                      confirmed.map((b) => (
                        <div key={b.id} className="bg-slate-700/30 p-3 rounded-md mt-2">
                          <div className="font-semibold">{b.passengerName}</div>
                          <div className="text-sm">Contact: {b.passengerContact}</div>
                            <div className="text-sm text-white/80">Booked: {new Date(b.createdAt).toLocaleString()}</div>
                            {b.confirmedAt ? (<div className="text-sm text-green-200">Confirmed: {new Date(b.confirmedAt).toLocaleString()}</div>) : null}
                            {(() => {
                              const pstats = getPassengerFeedbackStats(b.passengerContact);
                              if (pstats.total > 0) {
                                return (<div className="text-sm">Passenger rating: {pstats.avgRating} • +{pstats.positivePercent}% / -{pstats.negativePercent}%</div>);
                              }
                              return null;
                            })()}
                          <div className="text-sm">From: {b.pickup} — To: {b.dropoff}</div>
                          <div className="text-sm mt-1 text-green-300">Status: {b.status.toUpperCase()}</div>
                            <div className="mt-2">
                              {(() => {
                                const fb = getFeedbackByBookingId(b.id);
                                if (fb) {
                                  return (<div className="text-sm">Feedback: {fb.rating}/5 {fb.comment ? (<span className="ml-2 text-sm text-white/80">• "{fb.comment}"</span>) : null}</div>);
                                }
                                return (<div className="text-sm text-white/80">Awaiting passenger feedback</div>);
                              })()}
                            </div>
                          <div className="mt-2">
                            {isBookingActive(b) ? (
                              <a href={`/chat/${b.id}`} className="text-sm underline">Open Chat {unreadMap[b.id] && unreadMap[b.id].driver ? (<span className="ml-2 text-xs bg-red-600 text-white px-2 rounded">{unreadMap[b.id].driver}</span>) : null}</a>
                            ) : (
                              <div className="text-sm text-muted-foreground">Chat is not available (ride completed or not yet active)</div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Driver-side rating UI removed: drivers cannot rate passengers here.

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || (typeof window !== "undefined" && localStorage.getItem("role")) || "passenger";
  const [rides, setRides] = useState<Ride[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, { passenger: number; driver: number }>>({});
  const { toast } = useToast();

  useEffect(() => {
    setRides(getRides());
  }, []);

  function refreshRides() {
    setRides(getRides());
  }

  // poll localStorage for unread chat counts so UI updates across tabs
  useEffect(() => {
    const refresh = () => {
      // sweep and mark any overdue confirmed bookings as completed
      sweepCompleteBookings();
      const bookings = getBookings();
      const map: Record<string, { passenger: number; driver: number }> = {};
      bookings.forEach((b) => {
        map[b.id] = getUnreadCounts(b.id);
      });
      setUnreadMap(map);
    };

    // initial
    refresh();

    const t = setInterval(refresh, 2000);

    // also listen to storage events for cross-tab updates
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith("chat_unread_") || e.key === "ride_bookings_v1") refresh();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(t);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800">
      {/* Header */}
      <header className="bg-slate-700/90 backdrop-blur-sm border-b border-slate-600">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">RIDECONNECT</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-slate-600">
                SIGN IN
              </Button>
            </Link>
            {/* Unread total badge for current role */}
            {(() => {
              const currentRole = role as string;
              const total = Object.values(unreadMap).reduce((acc, v) => acc + (currentRole === "driver" ? (v.driver || 0) : (v.passenger || 0)), 0);
              if (total > 0) {
                return <div className="text-sm bg-red-600 text-white px-2 py-1 rounded">{total} new</div>;
              }
              return null;
            })()}
            <Button
              variant="ghost"
              className="text-white hover:text-white hover:bg-slate-600"
              onClick={() => {
                localStorage.removeItem("role");
                window.location.href = "/";
              }}
            >
              LOG OUT
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px,1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-700/70 backdrop-blur-sm rounded-2xl p-6 space-y-4">
              {role === "driver" ? (
                <>
                    <Button variant="default" className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-lg font-semibold">
                      POST A RIDE
                    </Button>
                    <Link to="/manage-rides" className="block">
                      <Button variant="default" className="w-full bg-slate-600 hover:bg-slate-500 text-white rounded-full py-6 text-lg font-semibold">
                        MANAGE RIDES
                      </Button>
                    </Link>
                    <Link to="/earnings" className="block">
                      <Button variant="default" className="w-full bg-slate-600 hover:bg-slate-500 text-white rounded-full py-6 text-lg font-semibold">
                        EARNINGS
                      </Button>
                    </Link>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-lg font-semibold"
                  >
                    JOIN A RIDE
                  </Button>
                  <Link to="/my-bookings" className="block">
                    <Button
                      variant="default"
                      className="w-full bg-slate-600 hover:bg-slate-500 text-white rounded-full py-6 text-lg font-semibold"
                    >
                      MY BOOKINGS
                    </Button>
                  </Link>
                  <Link to="/search-rides" className="block">
                    <Button
                      variant="default"
                      className="w-full bg-slate-600 hover:bg-slate-500 text-white rounded-full py-6 text-lg font-semibold"
                    >
                      SEARCH AVAILABILITY RIDES
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Main area */}
          <div className="space-y-6">
                {role === "driver" ? <DriverView refreshRides={refreshRides} unreadMap={unreadMap} /> : <PassengerView availableRides={rides} unreadMap={unreadMap} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
