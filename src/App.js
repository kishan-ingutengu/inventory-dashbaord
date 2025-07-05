import React, { useEffect, useState } from "react";
import { getCatalog, updateItem } from "./firebase";
import OrdersList from "./OrdersList";

function App() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuantities, setLocalQuantities] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  getCatalog().then(items => {
    // ✅ Sort items by numeric ID
    const sorted = [...items].sort((a, b) => Number(a.id) - Number(b.id));
    setCatalog(sorted);

    const initial = {};
    sorted.forEach(item => {
      initial[item.id] = item.quantity || 0;
    });
    setLocalQuantities(initial);
    setLoading(false);
  });
}, []);


  const handleQuantityChange = (id, value) => {
    setLocalQuantities(prev => ({
      ...prev,
      [id]: parseInt(value || "0", 10)
    }));
  };

  const handleBulkSave = async () => {
    setSaving(true);
    for (const id in localQuantities) {
      const quantity = localQuantities[id];
      const item = catalog.find(i => i.id === id);
      if (item) {
        await updateItem(id, item.price, quantity);
      }
    }
    setCatalog(prev =>
      prev.map(i => ({
        ...i,
        quantity: localQuantities[i.id] ?? i.quantity
      }))
    );
    setSaving(false);
    alert("✅ All quantities updated!");
  };

  return (
    <>
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h2>📦 Inventory Dashboard</h2>
        {loading ? <p>Loading...</p> : (
          <>
            <table
              border="1"
              cellPadding="10"
              cellSpacing="0"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price (₹)</th>
                  <th>Inventory</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map(item => (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor:
                        localQuantities[item.id] === 0 ? "#ffe5e5" : "white",
                    }}
                  >
                    <td align="center">{item.id}</td>
                    <td align="center">{item.name}</td>
                    <td align="center">₹{item.price}</td>
                    <td align="center">
                      <input
                        type="number"
                        value={localQuantities[item.id] ?? ""}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button onClick={handleBulkSave} disabled={saving}>
                {saving ? "Saving..." : "💾 Save All"}
              </button>
            </div>
          </>
        )}
      </div>

      <div>
        <OrdersList />
      </div>
    </>
  );
}

export default App;
