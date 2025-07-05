// Replace with your Firebase config
import { initializeApp } from "firebase/app";
import { query, where, getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getCatalog() {
  const snapshot = await getDocs(collection(db, "catalog"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateItem(id, price, quantity) {
  const ref = doc(db, "catalog", String(id));
  await updateDoc(ref, { price, quantity });
}


export async function deleteItem(id) {
  const ref = doc(db, "catalog", String(id));
  await deleteDoc(ref);
}

export async function getOrders() {
  const snapshot = await getDocs(collection(db, "orders"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

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
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
