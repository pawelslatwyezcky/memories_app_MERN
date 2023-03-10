import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exsistingUser = await User.findOne({ email });
    if (!exsistingUser)
      return res.status(404).json({ message: "User doesn't exist!" });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      exsistingUser.password
    );
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Password is incorrect!" });
    const token = jwt.sign(
      { email: exsistingUser.email, id: exsistingUser._id },
      process.env.SECRET_TOKEN,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: exsistingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong on Sign In!" });
  }
};

export const signup = async (req, res) => {
  const { email, password, firstName, lastName, confirmPassword } = req.body;

  try {
    const exsistingUser = await User.findOne({ email });
    if (exsistingUser)
      return res.status(400).json({ message: "User already exist!" });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match!" });
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.SECRET_TOKEN,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong on Sign Up!" });
    console.log(error);
  }
};
