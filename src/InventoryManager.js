// src/InventoryManager.js
import React, { useEffect, useState } from 'react';
import {
  getCatalogByType,
  updateInventory,
} from './firebase'; // Ensure this points to your Firestore helpers

function InventoryManager({ catalogType }) {
  const [catalog, setCatalog] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const items = await getCatalogByType(catalogType); // e.g., 'breakfast' or 'chats'
        setCatalog(items);

        const qty = {};
        items.forEach((item) => {
          qty[item.id] = item.quantity ?? 0;
        });
        setQuantities(qty);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [catalogType]);

  const handleQuantityChange = (id, value) => {
    setQuantities({
      ...quantities,
      [id]: parseInt(value, 10) || 0,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    try {
      const updates = Object.entries(quantities); // [ [id, quantity], ... ]
      for (const [id, quantity] of updates) {
        await updateInventory(catalogType, id, quantity);
      }
      setStatus('✅ Inventory saved!');
    } catch (err) {
      console.error('Error saving inventory:', err);
      setStatus('❌ Failed to save inventory');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{catalogType.charAt(0).toUpperCase() + catalogType.slice(1)} Inventory</h2>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity (0 = hide)</th>
          </tr>
        </thead>
        <tbody>
          {catalog.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <input
                  type="number"
                  value={quantities[item.id] ?? 0}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  min="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : '💾 Save Inventory'}
      </button>
      <p>{status}</p>
    </div>
  );
}

export default InventoryManager;