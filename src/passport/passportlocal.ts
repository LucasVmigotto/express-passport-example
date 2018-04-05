import * as Local from 'passport-local';
import * as JwtPassport from 'passport-jwt';
import { default as User, UserModel } from '../model/users';
import * as Passport from 'passport';

const jwtSecret = process.env.JWT_SECRET || 'secret';
const jwtIssuer = process.env.JWT_ISSUER || 'account.example.com';
const jwtAudience = process.env.JWT_AUDIENCE || 'http://localhost:3000';

export default (passport: any) => {

  passport.use(new Local.Strategy((username, password, done) => {
    User.findOne({ username: username, password: password },
      (err: Error, user: UserModel) => {
        if (err) return done(null, false, { message: err.message })
        if (!user) return done(null, false, { message: 'User not found' })
        return done(null, user)
      }
    )
  }));

  const options = {
    jwtFromRequest: JwtPassport.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
    issuer: jwtIssuer,
    audience: jwtAudience
  }

  passport.use(new JwtPassport.Strategy(options, (jwtPayload, done) => {
    User.findOne({ jwtPayload: jwtPayload.sub },
      (err: Error, user: UserModel) => {
        if (err) return done(null, false, { message: err.message })
        if (!user) return done(null, false, { message: 'User not found' })
        return done(null, user)
      }
    );
  }));
}
