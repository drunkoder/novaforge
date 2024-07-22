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
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { country_name: { $regex: searchRegex } },
                { code: { $regex: searchRegex } }
      ];
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
    
            // Check if the country_name already exists (case-insensitive)
            const existingExchangeRate = await ExchangeRateModel.findOne({ country_name }).collation({ locale: 'en', strength: 2 });
            if (existingExchangeRate) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Country name already exists",
                });
            }
    
            // Check if the code already exists (case-insensitive)
            const existingCode = await ExchangeRateModel.findOne({ code }).collation({ locale: 'en', strength: 2 });
            if (existingCode) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Code already exists",
                });
            }
    
            if (coins < 1) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Value of coins must be greater than zero.",
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
            
            // Normalize input data for validation
            const normalizedCountryName = country_name.trim().toLowerCase();
            const normalizedCode = code.trim().toUpperCase();
            
            // Retrieve the current exchange rate data
            const currentExchangeRate = await ExchangeRateModel.findById(req.params.id);
            if (!currentExchangeRate) {
                return res.status(404).json({ message: "Exchange rate not found" });
            }
    
            // Check if the country_name already exists for another record (case-insensitive)
            const existingCountry = await ExchangeRateModel.findOne({
                country_name: new RegExp(`^${normalizedCountryName}$`, 'i'),
                _id: { $ne: req.params.id }
            });
            
            if (existingCountry) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Country name already exists",
                });
            }
    
            // Check if the code already exists for another record (case-insensitive)
            const existingCode = await ExchangeRateModel.findOne({
                code: new RegExp(`^${normalizedCode}$`, 'i'),
                _id: { $ne: req.params.id }
            });
    
            if (existingCode) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Code already exists",
                });
            }
    
            if (coins < 1) {
                return res.status(400).json({
                    error: "Validation error",
                    message: "Value of coins must be greater than zero.",
                });
            }
    
            // Compare current data with new data
            const normalizedCurrentCountryName = currentExchangeRate.country_name.toLowerCase();
            const normalizedCurrentCode = currentExchangeRate.code.toUpperCase();
            const currentCoins = parseFloat(currentExchangeRate.coins).toFixed(2);
    
            if (normalizedCountryName === normalizedCurrentCountryName &&
                normalizedCode === normalizedCurrentCode &&
                parseFloat(coins).toFixed(2) === currentCoins) {
                return res.status(400).json({
                    error: "No changes",
                    message: "No changes made",
                });
            }
    
            // Update the exchange rate with the validated and normalized data
            const updatedExchangeRate = await ExchangeRateModel.findByIdAndUpdate(
                req.params.id,
                {
                    country_name: country_name.charAt(0).toUpperCase() + country_name.slice(1).toLowerCase(),
                    code: normalizedCode,
                    coins: parseFloat(coins).toFixed(2),
                },
                { new: true }
            );
    
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
