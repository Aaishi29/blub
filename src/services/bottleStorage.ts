// IndexedDB Client-Side Storage for "Message in a Bottle"
// Strictly local on the user's device — no server, no cloud upload, no shared pool.

export interface BottleMessage {
  id: string;
  createdAt: number;
  dateStr: string;
  type: 'audio' | 'text';
  zone: 'bright';
  text?: string;
  audioBlob?: Blob;
  lastReceivedAt: number | null;
  receivedCount: number;
}

const DB_NAME = 'blub_bottle_db_v1';
const STORE_NAME = 'bottles';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('lastReceivedAt', 'lastReceivedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save a new bottle message locally
export async function saveBottleMessage(
  message: Omit<BottleMessage, 'id' | 'createdAt' | 'dateStr' | 'zone' | 'lastReceivedAt' | 'receivedCount'>
): Promise<BottleMessage> {
  const db = await openDB();
  const now = new Date();
  const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const record: BottleMessage = {
    id: `bottle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    dateStr,
    zone: 'bright',
    type: message.type,
    text: message.text,
    audioBlob: message.audioBlob,
    lastReceivedAt: null,
    receivedCount: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(record);

    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

// Get all saved bottles
export async function getAllBottles(): Promise<BottleMessage[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to get bottles from IndexedDB:', e);
    return [];
  }
}

// Clear all saved bottles
export async function clearAllBottles(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to clear bottles from IndexedDB:', e);
  }
}

// Seed demo bottles dated from earlier this week (3 pre-saved bottles)
export async function seedDemoBottles(): Promise<void> {
  try {
    const existing = await getAllBottles();
    if (existing.length > 0) return;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const d1 = new Date(now - 3 * dayMs);
    const d2 = new Date(now - 4 * dayMs);
    const d3 = new Date(now - 5 * dayMs);

    const demoRecords: BottleMessage[] = [
      {
        id: 'demo-bottle-1',
        createdAt: d1.getTime(),
        dateStr: d1.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'text',
        zone: 'bright',
        text: "Remember to breathe when the waters feel murky. You've swum through rough currents before and you will again.",
        lastReceivedAt: null,
        receivedCount: 0,
      },
      {
        id: 'demo-bottle-2',
        createdAt: d2.getTime(),
        dateStr: d2.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'text',
        zone: 'bright',
        text: "Be gentle with your heart today. Even the strongest ocean swimmers need a quiet cove to rest their fins.",
        lastReceivedAt: null,
        receivedCount: 0,
      },
      {
        id: 'demo-bottle-3',
        createdAt: d3.getTime(),
        dateStr: d3.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'text',
        zone: 'bright',
        text: "The sun will be waiting for you at the surface when you are ready. Take all the time you need down here.",
        lastReceivedAt: null,
        receivedCount: 0,
      },
    ];

    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const b of demoRecords) {
      store.add(b);
    }
  } catch (e) {
    console.warn('Failed to seed demo bottles:', e);
  }
}

// Pick the next bottle to deliver: prefer never-received first, then oldest lastReceivedAt
export async function getNextBottleToDeliver(): Promise<BottleMessage | null> {
  let bottles = await getAllBottles();
  if (bottles.length === 0) {
    await seedDemoBottles();
    bottles = await getAllBottles();
  }
  if (bottles.length === 0) return null;

  // Sort by received status: never-received first, then earliest lastReceivedAt
  bottles.sort((a, b) => {
    if (a.receivedCount === 0 && b.receivedCount > 0) return -1;
    if (b.receivedCount === 0 && a.receivedCount > 0) return 1;
    const aTime = a.lastReceivedAt || 0;
    const bTime = b.lastReceivedAt || 0;
    return aTime - bTime;
  });

  return bottles[0];
}

// Update lastReceivedAt and increment receivedCount
export async function markBottleReceived(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const record = getReq.result as BottleMessage | undefined;
      if (record) {
        record.lastReceivedAt = Date.now();
        record.receivedCount = (record.receivedCount || 0) + 1;
        store.put(record);
      }
    };
  } catch (e) {
    console.warn('Failed to mark bottle received:', e);
  }
}

// 8 Pre-seeded comforting messages from Blub when user hasn't recorded a bottle yet
export const BLUB_SEEDED_MESSAGES = [
  "You don't have to carry the whole ocean today. Just floating is more than enough.",
  "Even in the deepest trench, the water holds you gently. You are safe here.",
  "The tide always pulls back out, and it always comes home again. Take your time.",
  "Rest your fins for a moment. You have done so much hard swimming lately.",
  "You are allowed to have days where getting through the morning is your only dive.",
  "The water around you is calm and patient. There is no rush, and no score to beat.",
  "Be soft with yourself. The depths are quiet so you can catch your breath.",
  "A brighter tide will find you again. For now, just let the currents cradle you.",
];
