import { compare, hash, genSalt } from 'bcrypt'

const encrypt = async (password) => {
  const saltRounds = 10;
  const salt = await genSalt(saltRounds);
  return await hash(password, salt);
};

const verified = async (password, hash) => {
  return await compare(password, hash)
}

export { encrypt, verified }