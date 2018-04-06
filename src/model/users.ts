/**
 * Import mongoose
 */
import * as mongoose from 'mongoose';

export type UserModel = mongoose.Document & {
  local: {
    name: String,
    email: String,
    password: String
  },
  facebook: {
    id: String,
    email: String,
    token: String,
    name: String
  },
  google: {
    id: String,
    email: String,
    token: String,
    name: String
  }
}
/**
 * Create a UserSchema using mongoose schema
 */
let UserSchema: mongoose.Schema = new mongoose.Schema({
  local: {
    name: String,
    email: String,
    password: String,
  },
  facebook: {
    id: String,
    email: String,
    token: String,
    name: String
  },
  google: {
    id: String,
    email: String,
    token: String,
    name: String
  }
});
/**
 * Export mongoose model UserSchema
 */
export default mongoose.model('User', UserSchema);
