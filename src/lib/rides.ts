export interface RideFeedback {
  from?: string; // passenger contact or name
  rating: number; // 1-5
  comment?: string;
}

export interface Ride {
  id: number;
  driverName: string;
  driverContact: string;
  vehicle?: string;
  cabNumber?: string; // vehicle/reg number
  departure?: string;
  pickup: string;
  dropoff: string;
  seats: number;
  fare: number;
  createdAt: string;
  // aggregated rating and feedback list for behavioral heuristics
  avgRating?: number;
  feedbacks?: RideFeedback[];
}

const STORAGE_KEY = "ride_list_v1";

function readStorage(): Ride[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Ride[];
  } catch (e) {
    return [];
  }
}

function writeStorage(rides: Ride[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
}

function nextId(): number {
  const rides = readStorage();
  if (rides.length === 0) return 1;
  return Math.max(...rides.map((r) => r.id)) + 1;
}

export function getRides(): Ride[] {
  return readStorage();
}

export function getRidesByDriverContact(contact: string) {
  const all = readStorage();
  return all.filter((r) => r.driverContact === contact);
}

export function saveRide(data: Omit<Ride, "id" | "createdAt">) {
  const rides = readStorage();
  const newRide: Ride = {
    ...data,
    id: nextId(),
    createdAt: new Date().toISOString(),
    avgRating: data.avgRating || undefined,
    feedbacks: data.feedbacks || [],
  } as Ride;
  rides.push(newRide);
  writeStorage(rides);
  return newRide;
}

export function clearRides() {
  writeStorage([]);
}

export function addFeedback(rideId: number, feedback: RideFeedback) {
  const rides = readStorage();
  const idx = rides.findIndex((r) => r.id === rideId);
  if (idx === -1) return null;
  const r = rides[idx];
  r.feedbacks = r.feedbacks || [];
  r.feedbacks.push(feedback);
  // recompute average
  const sum = r.feedbacks.reduce((s, f) => s + (f.rating || 0), 0);
  r.avgRating = Math.round((sum / r.feedbacks.length) * 10) / 10; // one decimal
  rides[idx] = r;
  writeStorage(rides);
  return r;
}
