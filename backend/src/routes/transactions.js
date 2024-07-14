import express from 'express';
import TransactionModel from '../models/transactions.js';
import { validateToken } from '../middlewares/auth.js';

import UserModel from '../models/users.js'; 
//import ProductModel from '../models/products.js'; 



import MiningAreaModel from '../models/mining_areas.js';
import ProductModel from '../models/products.js';

const app = express();


app.get('/api/transactions', [validateToken], async (req, res) => {
  try {
    const transactions = await TransactionModel.find().populate('buyer_id', 'name email').populate('seller_id','name').populate('product_id', 'name description').populate('mining_area_id','name type image');
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({
      error: 'Database error',
      message: error.message,
    });
  }
});
app.get('/api/transactions/purchasedproducts', [validateToken], async (req, res) => {
  try {
    const { product_ids } = req.query;

    if (!product_ids) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    const productIdArray = Array.isArray(product_ids) ? product_ids : [product_ids];
    const transactions = await TransactionModel.find({ product_id: { $in: productIdArray } }).populate('product_id', 'name description');
  
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for these products' });
    }
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({
      error: 'Database error',
      message: error.message,
    });
  }
});

app.get('/api/transactions/buyer/:buyerId', [validateToken], async (req, res) => {
  try {
    const transactions = await TransactionModel.find({ buyer_id: req.params.buyerId }).populate('mining_area_id', 'name').populate('product_id', 'name description');
  
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this buyer' });
    }
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
    const transaction = await TransactionModel.findById(req.params.id).populate('buyer_id', 'name email').populate('product_id', 'name description').populate('mining_area_id','name type image');
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
