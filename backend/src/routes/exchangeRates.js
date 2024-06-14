import express from "express";
import ExchangeRateModel from "../models/exchange_rates.js";
import { validateToken } from "../middlewares/auth.js";

const app = express();

    // Gets all
    app.get("/api/exchange-rates", [validateToken], async (req, res) => {
        try {
        const { page = 1, limit = 10, search = '', sortBy } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
    
        let query = {};
        if (search) {
            query.country_name = { $regex: new RegExp(search, 'i') };
        }
    
        const totalDocuments = await ExchangeRateModel.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / parseInt(limit));
    
        let sortCriteria = {};
        const sortByCriteria = sortBy || 'country_name';

        if (sortByCriteria === 'country_name') {
            sortCriteria = { country_name: 1 };
        }
    
        const exchangeRates = await ExchangeRateModel.find(query)
            .sort(sortCriteria)
            .skip(skip)
            .limit(parseInt(limit));
    
        return res.status(200).json({
            exchangeRates,
            totalPages,
            currentPage: parseInt(page),
            totalDocuments
        });
        } catch (error) {
        return res.status(500).json({
            error: "Database error",
            message: error.message,
        });
        }
    });

    // Get a exchangeRate by ID with its Exchange Rates
    app.get("/api/exchange-rates/:id", [validateToken], async (req, res) => {
    try {
        const exchangeRate = await ExchangeRateModel.findById(req.params.id);
        if (!exchangeRate) {
            return res.status(404).json({ message: "Exchange rate not found" });
        }
        return res.status(200).json(exchangeRate);
    } catch (error) {
        return res.status(500).json({
            error: "Database error",
            message: error.message,
        });
    }
    });

    // Create
    app.post("/api/exchange-rates", [validateToken], async (req, res) => {
        try {
            const { country_name, code, coins } = req.body;
            
            // Check if the country_name already exists
            const existingExchangeRate = await ExchangeRateModel.findOne({ country_name });
            if (existingExchangeRate) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Country name already exists",
                });
            }
            
            const exchangeRate = new ExchangeRateModel({ country_name, code, coins });
            await exchangeRate.save();
            
            return res.status(201).json({
                message: "Exchange rate created",
                exchangeRate: exchangeRate,
            });
        } catch (error) {
            return res.status(400).json({
                error: "Database error",
                message: error.message,
            });
        }
    });

    // Update
    app.put("/api/exchange-rates/:id", [validateToken], async (req, res) => {
        try {
            const { country_name, code, coins } = req.body;
            
            // Check if the country_name already exists for others
            const existingExchangeRate = await ExchangeRateModel.findOne({ country_name, _id: { $ne: req.params.id } });
            if (existingExchangeRate) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Country name already exists",
                });
            }
            
            const updatedExchangeRate = await ExchangeRateModel.findByIdAndUpdate(
                req.params.id,
                { country_name, code, coins },
                { new: true }
            );
            if (!updatedExchangeRate) {
                return res.status(404).json({ message: "Exchange rate not found" });
            }
            return res.status(200).json({
                message: "Exchange rate updated",
                exchangeRate: updatedExchangeRate,
            });
        } catch (error) {
            return res.status(500).json({
                error: "Database error",
                message: error.message,
            });
        }
    });

  
  // Delete
  app.delete("/api/exchange-rates/:id", [validateToken], async (req, res) => {
      try {
          // TODO: consider this
          // Check if the exchange rate is used anywhere
          // If yes, prevent deletion
          // If no, delete the exchange rate
          const deletedExchangeRate = await ExchangeRateModel.findByIdAndDelete(req.params.id);
          if (!deletedExchangeRate) {
              return res.status(404).json({ message: "Exchange rate not found" });
          }
          return res.status(200).json({ message: "Exchange rate deleted" });
      } catch (error) {
          return res.status(500).json({
              error: "Database error",
              message: error.message,
          });
      }
  });
  

export default app;
