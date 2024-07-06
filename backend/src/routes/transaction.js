import express from 'express';
import TransactionModel from '../models/TransactionModel.js';
import { validateToken } from '../middlewares/auth.js';
import UserModel from '../models/users.js'; 
import ProductModel from '../models/products.js'; 
import MiningAreaModel from '../models/mining_areas.js';

const app = express();



app.get('/api/transactions', [validateToken], async (req, res) => {
    try {
      const transactions = await TransactionModel.find()
        .populate('buyer_id seller_id product_id mining_area_id');
  
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
      });
    }
  });
  

app.get('/api/transactions/:id', [validateToken], async (req, res) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    return res.status(200).json(transaction);
  } catch (error) {
    return res.status(500).json({
      error: 'Database error',
      message: error.message,
    });
  }
});


app.post('/api/transactions', [validateToken], async (req, res) => {
  try {
    const { buyer_id, seller_id, product_id, mining_area_id, quantity, coins_used, transaction_type, is_community } = req.body;
    const transaction = new TransactionModel({ buyer_id, seller_id, product_id, mining_area_id, quantity, coins_used, transaction_type, is_community });
    await transaction.save();
    
    return res.status(201).json({
      message: 'Transaction created',
      transaction: transaction,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Database error',
      message: error.message,
    });
  }
});


app.put('/api/transactions/:id', [validateToken], async (req, res) => {
  try {
    const { buyer_id, seller_id, product_id, mining_area_id, quantity, coins_used, transaction_type, is_community } = req.body;
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(req.params.id, { buyer_id, seller_id, product_id, mining_area_id, quantity, coins_used, transaction_type, is_community }, { new: true });
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    return res.status(200).json({
      message: 'Transaction updated',
      transaction: updatedTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Database error',
      message: error.message,
    });
  }
});


app.delete('/api/transactions/:id', [validateToken], async (req, res) => {
  try {
    const deletedTransaction = await TransactionModel.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    return res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    return res.status(500).json({
      error: 'Database error',
      message: error.message,
    });
  }
});

export default app;
