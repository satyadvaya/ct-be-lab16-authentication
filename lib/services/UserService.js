const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = class UserService {
  // await UserService.create({ email, password, roleTitle: 'ADMIN' })
  static async create({ email, password, roleTitle }) {
    // Ensure the user doesn't already exist
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      throw new Error('User already exists for the provided email');
    }

    // hash the password
    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    // insert the user into the database with the hashed password
    const user = await User.insert({
      email,
      passwordHash,
      roleTitle,
    });
    console.log('USER-LOSER', user);
    // return the user
    return user;
  }

  // destructure email and password from req.body
  static async authenticate({ email, password }) {
    // check if a user already exists with the provided email
    const existingUser = await User.findByEmail(email);

    // if not, throw an error
    if (!existingUser) {
      throw new Error('Invalid email/password');
    }

    // take the plaintext password, hash it, and compare it
    // against the password hash we've saved in the database
    const passwordsMatch = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    // if the passwords don't match, throw an error
    if (!passwordsMatch) {
      throw new Error('Invalid email/password');
    }

    return existingUser;
  }
};
