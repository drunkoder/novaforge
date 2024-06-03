import express from "express";
import UserModel from "../models/users.js";
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
app.post("/api/users/registration", async (request, response) => {
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

  const emailTaken = await isEmailTaken(body.email);
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
