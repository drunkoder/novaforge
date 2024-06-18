import express from "express";
import UserModel from "../models/users.js";
import ExchangeRateModel from "../models/exchange_rates.js";
import { generatePassword } from "../utils/index.js";
import { validateToken } from "../middlewares/auth.js";

const app = express();

// Get user by id
app.get("/api/users/:id", [validateToken], (request, response) => {
  const { id } = request.params;
  if (!id) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "No ID provided",
    });
  }

  UserModel.findById(id)
  .then((user) => {
    if (!user) {
      return response.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    return response.status(200).json(user);
  })
  .catch((error) => {
    return response.status(400).json({
      error: "Error finding user",
      message: error.message,
    });
  });
  
});

// Get all users
app.get("/api/users", [validateToken], async (request, response) => {
  const { search, page, limit } = request.query;
  let filter = {};

  // Pagination parameters
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 5;
  const skip = (pageNumber - 1) * pageSize;

  if (search) {
    filter = {
      $or: [
        { email: { $regex: search, $options: "i" } },
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
      ],
    };
  }

  try {
    const totalUsers = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .skip(skip)
      .limit(pageSize)
      .exec();

    const totalPages = Math.ceil(totalUsers / pageSize);

    const userVM = mapToViewModel(users);

    return response.status(200).json({
      users: userVM,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    return response.status(400).json({
      error: "Error finding users",
      message: error,
    });
  }
});


// Create user
app.post("/api/users", [validateToken], async (request, response) => {
  const body = request.body;
  if (!body || !body.password) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "No body provided",
    });
  }

  const emailTaken = await isEmailTaken(body.email);
  if (emailTaken) {
    return response.status(400).json({
      error: "Email already exists",
      message: "The email is already in use",
    });
  }
  
  const password = await generatePassword(body.password);
  const newBody = { ...body, password };

  newBody.created_by = request.user.id,
  newBody.updated_by = request.user.id,
  newBody.created_at = new Date();
  newBody.updated_at = new Date();

  UserModel.create(newBody)
    .then((user) => {
      return response.status(201).json({
        message: "User created",
        user: user,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Database error",
        message: error,
      });
    });
});

// Create user
app.post("/api/users/register", async (request, response) => {
  const body = request.body;
  if (!body || !body.password) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "Please fill in required fields",
    });
  }

  const emailTaken = await isEmailTaken(body.email);
  if (emailTaken) {
    return response.status(400).json({
      error: "Email already exists",
      message: "The email is already in use",
    });
  }
  
  if(body.password !== body.confirmPassword){
    return response.status(400).json({
      error: "Passwords don't match",
      message: "Passwords don't match",
    });
  }

  const password = await generatePassword(body.password);
  const newBody = { ...body, password };

  newBody.created_at = new Date();
  newBody.updated_at = new Date();
  newBody.roles = [];
  newBody.roles = 'User';

  UserModel.create(newBody)
    .then((user) => {
      return response.status(201).json({
        message: "User created",
        user: user,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Database error",
        message: error,
      });
    });
});


// Delete
app.delete("/api/users/:id", [validateToken], (request, response) => {
  const { id } = request.params;
  if (!id) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "No ID provided",
    });
  }

  UserModel.findByIdAndDelete(id)
    .then((user) => {
      if (!user) {
        return response.status(404).json({
          error: "User not found",
          message: "User with provided ID not found",
        });
      }
      return response.status(200).json({
        message: "User deleted successfully",
        user: user,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Error deleting user",
        message: error.message,
      });
    });
});

// Update
app.put("/api/users/:id", [validateToken], async (request, response) => {
  const { id } = request.params;
  const body = request.body;
  
  if (!id || !body) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "No ID or body provided",
    });
  }

  const emailTaken = await isEmailTaken(body.email, id);
  if (emailTaken) {
    return response.status(400).json({
      error: "Email already exists",
      message: "The email is already in use",
    });
  }

  const password = await generatePassword(body.password);
  const newBody = { ...body, password };
  
  newBody.updated_by = request.user.id,
  newBody.updated_at = new Date();

  UserModel.findByIdAndUpdate(id, newBody, { new: true })
    .then((user) => {
      if (!user) {
        return response.status(404).json({
          error: "User not found",
          message: "User with provided ID not found",
        });
      }
      return response.status(200).json({
        message: "User updated successfully",
        user: user,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Error updating user",
        message: error.message,
      });
    });
});


// buy nova coin
app.post("/api/users/:id/add-coins", [validateToken], async (request, response) => {
  const { id } = request.params;
  const { exchangeRateId, amount } = request.body;

  if (!id || !exchangeRateId || !amount) {
    return response.status(400).json({
      error: "bad request",
      message: "Missing required parameters",
    });
  }

  try {
    // Find the user
    const user = await UserModel.findById(id);
    if (!user) {
      return response.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    // Find exchange rate by ID
    const exchangeRate = await ExchangeRateModel.findById(exchangeRateId);
    if (!exchangeRate) {
      return response.status(404).json({
        error: "Exchange rate not found",
        message: "Exchange rate with the provided ID not available",
      });
    }

    // Calculate amount of coins based on exchange rate
    const coinsToAdd = amount / exchangeRate.coins;

    // Update nova_coin_balance
    user.nova_coin_balance += coinsToAdd;
    await user.save();

    var userVM = mapUserToViewModel(user);

    return response.status(200).json({
      message: "Coins added successfully",
      coinsAdded: coinsToAdd,
      updatedUser: userVM,
    });
  } catch (error) {
    return response.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// withdraw 
app.post("/api/users/:id/withdraw-coins", [validateToken], async (request, response) => {
  const { id } = request.params;
  const { amount } = request.body;

  if (!id || !amount) {
    return response.status(400).json({
      error: "bad request",
      message: "Missing required parameters",
    });
  }

  try {
    // Find the user
    const user = await UserModel.findById(id);
    if (!user) {
      return response.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    // Check if user has enough balance to withdraw
    if (user.nova_coin_balance < amount) {
      return response.status(400).json({
        error: "Insufficient balance",
        message: "You do not have enough coins to withdraw",
      });
    }

    // Update nova_coin_balance
    user.nova_coin_balance -= amount;
    await user.save();

    var userVM = mapUserToViewModel(user);

    return response.status(200).json({
      message: "Coins withdrawn successfully",
      coinsWithdrawn: amount,
      updatedUser: userVM,
    });
  } catch (error) {
    return response.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// TODO: My Inventory APIs
app.get('/api/users/:id/inventory', [validateToken], async (request, response) => {
  const { id } = request.params;
  const { status, search, page = 1, limit = 3 } = request.query;

  if (!id) {
    return response.status(400).json({
      error: 'bad request',
      message: 'No ID provided',
    });
  }

  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const user = await UserModel.findById(id)
      .populate('purchased_products.product_id')
      .populate('purchased_products.mining_area_id');

    if (!user) {
      return response.status(404).json({
        error: 'User not found',
        message: 'User with the provided ID does not exist',
      });
    }

    let inventory = user.purchased_products;


    // filter the status, AVAILABLE, SOLD, FOR_SALE
    if (status) {
      inventory = inventory.filter(product => product.status === status);
    }

    // if there's search keyword, search for area name or product name or status
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      inventory = inventory.filter(product =>
        searchRegex.test(product.product_id.name) || 
        searchRegex.test(product.mining_area_id.name) ||
        searchRegex.test(product.status)
      );
    }

    const totalPages = Math.ceil(inventory.length / pageSize);
    const paginatedInventory = inventory.slice(skip, skip + pageSize);

    response.status(200).json({ 
      totalItems: inventory.length,
      totalPages,
      currentPage: pageNumber,
      inventory: paginatedInventory
    });
  } catch (error) {
    return response.status(400).json({
      error: 'Error finding user inventory',
      message: error.message,
    });
  }
});


// private methods here
function mapToViewModel(users) {
  return users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    friendly_name: `${user.first_name} ${user.last_name}`,
    role: user.role
  }));
}

function mapUserToViewModel(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    friendly_name: `${user.first_name} ${user.last_name}`,
    role: user.role,
    nova_coin_balance: user.nova_coin_balance
  };
}


async function isEmailTaken(email, userId = null) {
  try {
    const query = { email: email };
    if (userId) {
      query._id = { $ne: userId };
    }
    const existingUser = await UserModel.findOne(query);
    return !!existingUser;
  } catch (error) {
    console.error("Error checking email:", error.message);
    return true;
  }
}



export default app;
