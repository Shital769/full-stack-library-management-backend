import express from "express";
import { comparePassword, hashPassword } from "../helpers/BcryptHelper.js";
import { ERROR, SUCCESS } from "../Constant.js";
const router = express.Router();

import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserById,
} from "../models/User/userModel.js";
router.get("/", (req, res, next) => {
  try {
    res.json({
      status: SUCCESS,
      message: "Todo get user",
    });
  } catch (error) {
    next(error);
  }
});

//create user
router.post("/", async (req, res, next) => {
  try {
    const { email } = req.body;

    const userExists = await getUserByEmail(email);

    if (userExists) {
      return res.json({
        status: "error",
        message: "User already exists. Please login.",
      });
    }

    //hash password
    const hashPass = hashPassword(req.body.password);

    if (hashPass) {
      req.body.password = hashPass;
      const result = await createUser(req.body);

      if (result?._id) {
        return res.json({
          status: SUCCESS,
          message: "User has been created successfully. You may login now.",
        });
      }

      return res.json({
        status: ERROR,
        message: "User not created, Please try again!",
      });
    }
  } catch (error) {
    next(error);
  }
});

//login user
router.post("/login", async (req, res, next) => {
  try {
    const { email } = body;
    const user = await getUserByEmail(email);

    if (user?._id) {
      //checks if password is valid
      const isPasswordMatch = comparePassword(req.body.password, user.password);

      if (isPasswordMatch) {
        user.password = undefined;
        return res.json({
          status: SUCCESS,
          message: "Login Successful",
          user,
        });
      }
      res.json({
        status: ERROR,
        message: "Invalid password",
      });
    } else {
      res.json({
        status: ERROR,
        message: "User not found1",
      });
    }
  } catch (error) {
    next(error);
  }
});

//update password
router.patch("/password-update", async (req, res, next) => {
  try {
    const user = await getUserById(req.headers.authorization);
    const { currentPassword } = req.body;

    const passMatched = comparePassword(currentPassword, user?.password);
    if (passMatched) {
      const hashedPass = hashPassword(req.body.password);

      if (hashPassword) {
        const update = await updateUserById(
          { _id: user._id },
          { password: hashedPass }
        );

        return update?.password
          ? res.json({
              status: "success",
              message: "Password updated successfully!",
            })
          : res.json({
              status: "error",
              message: "Unable to update password!",
            });
      }
    }

    return res.json({
      status: "error",
      message: "Please enter the correct current password!",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
