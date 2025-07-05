// Replace with your Firebase config
import { initializeApp } from "firebase/app";
import { query, where, getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDkv_F6rcDG6kX4N-r6TZaGP9TwMkY5jHw",
  authDomain: "ingutengu-ecf5e.firebaseapp.com",
  projectId: "ingutengu-ecf5e",
  storageBucket: "ingutengu-ecf5e.firebasestorage.app",
  messagingSenderId: "724795207755",
  appId: "1:724795207755:web:e08b1726dfb18da5705dce"
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
