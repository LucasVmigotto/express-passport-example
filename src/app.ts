import * as path from 'path';
import * as express from 'express';
import * as passport from 'passport';
import * as mongoose from 'mongoose';
import { default as routes } from './route/route';
import { default as passportLocal } from './passport/passportlocal';
import { default as passportGoogle } from './passport/passportgoogle';
import { default as passportFacebook } from './passport/passportfacebook';
import * as bodyParser from 'body-parser';
import * as expressSession from 'express-session';
import { default as DbInfo } from './config/dbinfo';
import * as morgan from 'morgan';
import { default as User, UserModel } from './model/users';
const port = process.env.PORT || 3000;
const flash = require('connect-flash');

let app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

(<any> mongoose).connect(DbInfo.url).then(
  () => { console.log('Connected with the database.') }
).catch((err: Error) => {
  console.log('\n\n** A error occurred while connecting to the '+
    'database. Make sure the mongo service is started [ YOU\'RE NOT CONNECTED ] **\n\n');
});

passport.serializeUser((user: UserModel, done) => {
  return done(null, user._id);
});

passport.deserializeUser((id: Number, done) => {
  User.findById(id, (err: Error, user: UserModel) => {
    if (err) return done(null, { message: err.message });
    return done(null, user);
  });
});

app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(expressSession({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passportLocal(passport);
passportFacebook(passport);
passportGoogle(passport);

routes(passport, app);

app.set('port', port);

export default app;
