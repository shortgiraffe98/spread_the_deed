import jwt from "jsonwebtoken";
import { ApolloError } from 'apollo-server-express';

const getCurrentUser = (req) => {
    const token = req.headers.authorization || '';
    if (!token) return { message: "Authentication token is missing", isAuthenticated: false, code: 'MISSING_TOKEN', user_info: null };
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      return { message: 'User is authenticated', isAuthenticated: true, code: 'VALID_TOKEN', user_info: decoded };
    } catch (error) {
      return { message: "User's token does not match any token", isAuthenticated: false, code: 'INCORRECT_TOKEN', user_info: null };
    }
}

const context = ({ req }) => {
    const user = getCurrentUser(req);
    return { user };
};

export default context;