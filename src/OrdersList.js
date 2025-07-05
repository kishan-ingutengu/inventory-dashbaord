// OrdersList.js
import React, { useEffect, useState } from "react";
import { getTodaysOrders } from './firebase';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  getTodaysOrders().then(data => {
    setOrders(data);
    setLoading(false);
  });
}, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>🧾 Today's Orders</h2>
{orders.length === 0 ? (
  <p>No orders placed today.</p>
) : (
  [...orders]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // oldest to newest
    .map((order, index) => (
      <div key={order.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
        <h3>🧾 Order #{index + 1}</h3>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Total:</strong> ₹{order.total}</p>
        <p><strong>Address:</strong> {order.address}</p>
        <p><strong>Delivery Time:</strong> {order.deliveryTime}</p>
        <ul>
          {order.items.map((item, i) => (
            <li key={i}>
              {item.name} × {item.quantity} = ₹{item.total}
            </li>
          ))}
        </ul>
      </div>
    ))
)}
    </div>
  );
};

export default OrdersList;
