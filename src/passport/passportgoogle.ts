import * as Google from 'passport-google-oauth'
import { default as User, UserModel } from '../model/users'
import { default as config } from '../config/auth'

export default (passport: any) => {
  passport.use(new Google.OAuth2Strategy(config.googleAuth,
    (token, refreshToken, profile, done) => {
      process.nextTick(() => {
        User.findOne({ 'google.id': profile.id },
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
    }
  ))
}
