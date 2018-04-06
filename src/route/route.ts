import { ensureLoggedIn } from 'connect-ensure-login';
import * as jwt from 'jsonwebtoken';
import * as controller from '../controller/usercontroller';
import { default as User, UserModel } from '../model/users';
import { Request, Response, NextFunction } from 'express'
export default (passport: any, app: any) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next()
    }
  });

  function authJSONResponse(req: Request, res: Response, next: NextFunction) {
    return (err: Error, user: UserModel, info: any) => {
      if (err) return next(err);
      if (user) {
        req.user = user;
        next()
      } else {
        res.json({ error: { message: info.message } });
      }
    }
  }

  function apiAuth(strategy: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate(strategy, { session: false },
        authJSONResponse(req, res, next))(req, res, next)
    }
  }

  const apiAuthLocal = apiAuth('local');
  const apiAuthJwt = apiAuth('jwt');
  const authLocal = passport.authenticate('local',
    { failureRedirect: '/login', failureFlash: '/' }
  );

  app.get('/', (req: Request, res: Response) => {
    res.render('home', { user: req.user });
  });

  app.get('/login', (req: Request, res: Response) => {
    res.render('login', { errorMessages: req.flash('error')});
  });

  app.post('/login', authLocal, (req: Request, res: Response) => {
    res.redirect('/');
  });

  app.get('/logout', (req: Request, res: Response) => {
    req.logout();
    res.redirect('/login');
  });

  app.get('/profile', ensureLoggedIn(), (req: Request, res: Response) => {
    res.render('profile', { user: req.user });
  });

  app.post('/api/login', apiAuthLocal, (req: Request, res: Response) => {
    const { user } = req
    res.json({
      token: jwt.sign({
        sub: user.username,
        exp: Math.floor(30 + Date.now() / 100),
        iss: 'account.example.com',
        aud: 'http://localhost:3000'
      }, 'secret')
    })
  })

  app.get('/api/facebook-login', passport.authenticate('facebook',
    { scope: [ 'public_profile' ] }
  ));

  app.get('/api/facebook/callback', passport.authenticate('facebook',
    { successRedirect: '/profile', failureFlash: '/login'}
  ));

  app.get('/api/google-login', passport.authenticate('google',
    { scope: [ 'https://www.googleapis.com/auth/plus.login'] }
  ));

  app.get('/api/google/callback', passport.authenticate('google',
    { failureRedirect: '/login' }
  ), (req: Request, res: Response) => {
    res.render('profile', { user: req.user });
  });

  app.get('/api/profile', apiAuthJwt, (req: Request, res: Response) => {
    res.json({ data: { profile: req.user }});
  });

  app.get('/signup', (req: Request, res: Response) => {
    res.render('signup', { message: '' });
  });

  app.post('/signup', (req: Request, res: Response) => {
    let user = req.body
    if (controller.createUser(user)) {
      res.render('login', { errorMessages: [ 'Success saving, login to get started' ] });
    } else {
      res.render('login', { errorMessages: [ 'Error saving' ] });
    }
  });
}
