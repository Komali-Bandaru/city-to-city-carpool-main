const STORAGE_KEY = "driver_earnings_v1";

function readStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(map: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getEarnings(driverContact?: string) {
  if (!driverContact) return 0;
  const map = readStorage();
  return map[driverContact] || 0;
}

export function addEarnings(driverContact: string, amount: number) {
  if (!driverContact) return;
  const map = readStorage();
  map[driverContact] = (map[driverContact] || 0) + amount;
  writeStorage(map);
}

export function resetEarnings() {
  writeStorage({});
}
