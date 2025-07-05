import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import catalog from './catalog.json';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, Typography
} from '@mui/material';

const InventoryManager = () => {
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchQuantities = async () => {
    const snapshot = await db.collection('inventory').get();
    const data = {};
    snapshot.forEach(doc => {
      data[doc.id] = doc.data().quantity || 0;
    });
    setQuantities(data);
    setLoading(false);
  };

  const updateQuantity = async (id, newQty) => {
    await db.collection('inventory').doc(id.toString()).set({ quantity: newQty });
    setQuantities(prev => ({ ...prev, [id]: newQty }));
  };

  useEffect(() => {
    fetchQuantities();
  }, []);

  if (loading) return <Typography>Loading inventory...</Typography>;

  return (
    <TableContainer component={Paper}>
      <Typography variant="h5" style={{ padding: '16px' }}>📦 Inventory Dashboard</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>ID</b></TableCell>
            <TableCell><b>Name</b></TableCell>
            <TableCell><b>Price (₹)</b></TableCell>
            <TableCell><b>Quantity</b></TableCell>
            <TableCell><b>Update</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {catalog.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>₹{item.price}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  value={quantities[item.id] ?? 0}
                  onChange={e =>
                    setQuantities(prev => ({
                      ...prev,
                      [item.id]: parseInt(e.target.value || '0')
                    }))
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => updateQuantity(item.id, quantities[item.id])}
                >
                  Save
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryManager;
