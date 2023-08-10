import userSchema from "./userSchema.js";

// User CRUD

//create user
export const createUser = (userData) => {
  return userSchema(userData).save();
};

export const getUserByEmail = (email) => {
  return userSchema.findOne({ email });
};

//get signle user by id
export const getUserById = (_id) => {
  return userSchema.findById(_id);
};

//get single user by filter, filter must be an object
export const getAnyUser = (filter) => {
  return userSchema.findOne(filter);
};

//update user. Here an id is a string and update data is an object
export const updateUserById = (_id, updateData) => {
  return userSchema.findByIdAndUpdate(_id, updateData, { new: true });
};

//delete user by id
export const deleteUserById = (_id) => {
  return userSchema.findByIdAndDelete(_id);
};
