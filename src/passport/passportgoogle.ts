import * as Google from 'passport-google-oauth'
import { default as User, UserModel } from '../model/users'
import { default as config } from '../config/auth'

export default (passport: any) => {
  passport.use(new Google.OAuth2Strategy({
    clientID: config.googleAuth.clientID,
    clientSecret: config.googleAuth.clientSecret,
    callbackURL: config.googleAuth.callbackURL
  }, (token, refreshToken, profile, done) => {
    console.log(profile);
    process.nextTick(() => {
      User.findOne({ username: profile.username },
        (err: Error, user: UserModel) => {
          if (err) return done(null, { message: err.message });
          if (user) {
            return done(null, user);
          } else {
            let newUser = new User(user);
            newUser.save((err: Error) => {
              if (err) return done(null, { message: err.message });
              return done(null, newUser)
            })
          }
        })
    })
  }))
}
