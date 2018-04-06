import * as Facebook from 'passport-facebook';
import { default as config } from '../config/auth';
import { default as User, UserModel } from '../model/users';

export default (passport: any) => {
  passport.use(new Facebook.Strategy(config.facebookAuth,
    (token, refreshToken, profile, done) => {
      process.nextTick(() => {
        User.findOne({ 'facebook.id': profile.id },
          (err: Error, user: UserModel) => {
            if (err) return done(null, false, { message: err.message });
            if (user) {
              return done(null, user);
            } else {
              let newUser = new User(user);
              newUser.save((err: Error) => {
                if (err) return done(null, false, { message: err.message })
                return done(null, newUser);
              })
            }
          }
        )
      })
    }
  ))
}
