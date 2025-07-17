import React, { useEffect, useState } from "react";
import { getCatalog, updateInventory } from "./firebase";
import "./App.css";

function App() {
  const [catalog, setCatalog] = useState([]);
  const [localQuantities, setLocalQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [catalogType, setCatalogType] = useState("breakfast"); // manual toggle

  useEffect(() => {
    setLoading(true);
    getCatalog(catalogType).then((items) => {
      const sorted = [...items].sort((a, b) => Number(a.id) - Number(b.id));
      setCatalog(sorted);

      const initialQuantities = {};
      sorted.forEach((item) => {
        initialQuantities[item.id] = item.inventory || 0;
      });
      setLocalQuantities(initialQuantities);
      setLoading(false);
    });
  }, [catalogType]);

  const handleChange = (e, id) => {
    const value = e.target.value;
    setLocalQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id) => {
    const newInventory = Number(localQuantities[id]);
    if (!isNaN(newInventory)) {
      await updateInventory(catalogType, id, newInventory);
      alert("Inventory updated!");
    }
  };

  return (
    <div className="App">
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
        <table>
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
                    value={localQuantities[item.id]}
                    onChange={(e) => handleChange(e, item.id)}
                    style={{ width: "60px", marginRight: "8px" }}
                  />
                  <button onClick={() => handleSave(item.id)}>Save</button>
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
