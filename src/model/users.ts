/**
 * Import mongoose
 */
import * as mongoose from 'mongoose';

export type UserModel = mongoose.Document & {
  id: number,
  displayname: string,
  username: string,
  password: string,
  token: string
}
/**
 * Create a UserSchema using mongoose schema
 */
let UserSchema: mongoose.Schema = new mongoose.Schema({
  id: Number,
  displayname: String,
  username: String,
  password: String,
  token: String
});
/**
 * Export mongoose model UserSchema
 */
export default mongoose.model('User', UserSchema);
