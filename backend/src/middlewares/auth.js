import jwt from "jsonwebtoken";

export const validateToken = (request, response, next) => {
  let token = request.get("Authorization");

  if (!token) {
    return response.status(403).json({
      error: "Forbidden",
      message: "Forbidden request",
    });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const tokenPayload = jwt.verify(token, process.env.JWT_SEED);

    request.user = tokenPayload;
    next();
  } catch (error) {
    return response.status(403).json({
      error: "Unauthorized",
      message: "Invalid token",
    });
  }
};