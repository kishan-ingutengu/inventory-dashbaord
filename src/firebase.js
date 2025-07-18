import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  setDoc
} from "firebase/firestore";

// Firebase config from .env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Determine catalog type by time
function getCatalogTypeByTime() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  if (totalMinutes >= 450 && totalMinutes < 690) {
    return "breakfast"; // 7:30 AM – 11:30 AM
  } else if (totalMinutes >= 1050 && totalMinutes < 1230) {
    return "chats"; // 5:30 PM – 8:30 PM
  } else {
    return "breakfast"; // Default to breakfast
  }
}

// Get catalog based on current time
export async function getCatalog() {
  const type = getCatalogTypeByTime();
  return await getCatalogByType(type);
}

// Get catalog by specified type (manual toggle)
export async function getCatalogByType(type) {
  const snapshot = await getDocs(collection(db, `catalog/${type}/items`));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ✅ Update inventory by catalog type and item ID
export const updateInventory = async (catalogType, updatedQuantities) => {
  const batch = writeBatch(db);
  const baseRef = collection(db, `catalog/${catalogType}/items`);

  for (const [id, quantity] of Object.entries(updatedQuantities)) {
    const docRef = doc(baseRef, id);
    batch.set(docRef, { quantity: Number(quantity) }, { merge: true });
  }

  await batch.commit();
  console.log(`✅ Batch updated ${Object.keys(updatedQuantities).length} items`);
};

// Optionally update item (price and inventory) — not currently used by UI
export async function updateItem(type, id, updates) {
  const ref = doc(db, `catalog/${type}/items`, id);
  await updateDoc(ref, updates);
}

// Delete item by ID
export async function deleteItem(type, id) {
  const ref = doc(db, `catalog/${type}/items`, id);
  await deleteDoc(ref);
}

// Get all orders
export async function getOrders() {
  const snapshot = await getDocs(collection(db, "orders"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get today’s orders only
export async function getTodaysOrders() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    collection(db, "orders"),
    where("createdAt", ">=", startOfDay.toISOString()),
    where("createdAt", "<", endOfDay.toISOString())
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
