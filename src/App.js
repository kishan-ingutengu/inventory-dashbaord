import React, { useEffect, useState } from "react";
import { getCatalogByType, updateInventory, getTodaysOrders } from "./firebase";

function App() {
  const [catalog, setCatalog] = useState([]);
  const [localQuantities, setLocalQuantities] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogType, setCatalogType] = useState("breakfast");

  useEffect(() => {
    loadCatalog();
  }, [catalogType]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    const items = await getCatalogByType(catalogType);
    const sorted = [...items].sort((a, b) => Number(a.id) - Number(b.id));
    setCatalog(sorted);

    const initialQuantities = {};
sorted.forEach((item) => {
  initialQuantities[item.id] = item.quantity || 0; // ← Fix here
});
    setLocalQuantities(initialQuantities);
    setLoading(false);
  };

  const loadOrders = async () => {
    const data = await getTodaysOrders();
    setOrders(data);
  };

  const handleChange = (e, id) => {
    const value = e.target.value;
    setLocalQuantities((prev) => ({ ...prev, [id]: value }));
  };

const handleSaveAll = async () => {
  const cleaned = {};
  for (const [id, value] of Object.entries(localQuantities)) {
    const qty = Number(value);
    if (!isNaN(qty)) {
      cleaned[id] = qty;
    }
  }

  await updateInventory(catalogType, cleaned); // ✅ Correct batch update
  alert("✅ All inventory updated!");
  await loadCatalog(); // ✅ Reload catalog to reflect updates
};

  return (
    <div className="App" style={{ padding: "2rem" }}>
      <h2>📦 Inventory Dashboard</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          <b>🗂 Select Catalog:</b>{" "}
          <select
            value={catalogType}
            onChange={(e) => setCatalogType(e.target.value)}
          >
            <option value="breakfast">Breakfast</option>
            <option value="chats">Chats</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading catalog...</p>
      ) : (
        <>
          <table border="1" cellPadding="6" style={{ marginBottom: "1rem" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price (₹)</th>
                <th>Inventory</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <input
                      type="number"
                      value={Math.max(0, localQuantities[item.id] ?? 0)}
                      onChange={(e) => handleChange(e, item.id)}
                      style={{ width: "60px" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleSaveAll}>💾 Save Inventory</button>
        </>
      )}

      // ... imports and other code remain unchanged

<h3 style={{ marginTop: "2rem" }}>
  📦 Today's Orders ({orders.length})
</h3>
{orders.length === 0 ? (
  <p>No orders placed today.</p>
) : (
  <table border="1" cellPadding="6">
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Items</th>
        <th>Amount (₹)</th>
        <th>Delivery Time</th>
        <th>Address</th>
        <th>Status</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      {orders.map((order) => (
        <tr key={order.id}>
          <td>{order.id}</td>
          <td>{order.name || "—"}</td>
          <td>{order.from}</td>
          <td>
            {order.items &&
              order.items.map((item, i) => (
                <div key={i}>
                  {item.name} × {item.quantity}
                </div>
              ))}
          </td>
          <td>₹{order.total}</td>
          <td>{order.deliveryTime || "—"}</td>
          <td>{order.address || "—"}</td>
          <td>{order.status || "—"}</td>
          <td>
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}
    </div>
  );
}

export default App;
