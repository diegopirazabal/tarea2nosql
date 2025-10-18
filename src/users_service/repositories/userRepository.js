import { UserModel } from "../models/userModel.js";

export async function createUser(userData) {
  const user = new UserModel(userData);
  await user.validate();
  await user.save();
  return user.toJSON();
}

export async function findUserById(userId) {
  const user = await UserModel.findById(userId).lean({ getters: true });
  if (!user) {
    return null;
  }
  return formatUser(user);
}

export async function findUserByDocument(tipo_doc, nro_doc) {
  const user = await UserModel.findOne({ tipo_doc, nro_doc }).lean({ getters: true });
  if (!user) {
    return null;
  }
  return formatUser(user);
}

export async function findAllUsers() {
  const users = await UserModel.find().lean({ getters: true });
  return users.map((user) => formatUser(user));
}

function formatUser(user) {
  if (!user) {
    return null;
  }

  if (user._id && !user.id) {
    user.id = user._id.toString();
    delete user._id;
  }
  return user;
}
