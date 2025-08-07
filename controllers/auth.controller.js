import Auth from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import {
  validateUsername,
  validatePassword,
} from "../validators/auth.validator.js";

const register = async (req, res) => {
  try {
    let { username, password } = req.body;

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const existingUser = await Auth.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    username = username.toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Auth({
      username,
      password: hashedPassword,
    });
    await newUser.save();

    req.session.user = {
      id: newUser._id,
      username: newUser.username,
    };

    res.status(201).json({ message: req.session.user });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      return res.status(400).json({ error: usernameError || passwordError });
    }

    const user = await Auth.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
    };

    res
      .status(200)
      .json({ message: "Logged in successfully", user: req.session.user });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const verify = (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.status(200).json({ user: req.session.user });
  } catch (error) {
    console.error("Error during verification:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export { register, login, verify, logout };
