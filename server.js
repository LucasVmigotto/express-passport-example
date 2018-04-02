const path = require('path')
const express = require('express')
const passport = require('passport')
const flash = require('connect-flash')
const passportLocal = require('passport-local')
const passportJWT = require('passport-jwt')
const jwt = require('jsonwebtoken')
const { ensureLoggedIn } = require('connect-ensure-login')
const db = require('./db')

const jwtSecret = process.env.JWT_SECRET || 'secret'
const jwtIssuer = process.env.JWT_ISSUER || 'accounts.example.com'
const jwtAudience = process.env.JWT_AUDIENCE || 'yoursite.com'
const sessionSecret = process.env.SESSION_SECRET || 'secret'
const port = process.env.PORT || 3000

passport.use(new passportLocal.Strategy(
  function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) { return cb(err) }
      if (!user) { return cb(null, false, { message: 'User not found' }) }
      if (user.password !== password) { return cb(null, false, { message: 'Invalid password' }) }
      return cb(null, user)
    })
  }))

const opts = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
  issuer: jwtIssuer,
  audience: jwtAudience
}
passport.use(new passportJWT.Strategy(opts, function (jwtPayload, cb) {
  db.users.findByUsername(jwtPayload.sub, function (err, user) {
    if (err) { return cb(err) }
    if (!user) { return cb(null, false, { message: 'User not found' }) }
    return cb(null, user)
  })
}))

passport.serializeUser(function (user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err) }
    cb(null, user)
  })
})

const authLocal = passport.authenticate(
  'local',
  { failureRedirect: '/login', failureFlash: true }
)

function authJSONResponse (req, res, next) {
  return (err, user, info) => {
    if (err) return next(err)
    if (user) {
      req.user = user
      next()
    } else {
      res.json({ error: { message: info.message } }, 200)
    }
  }
}

function apiAuth (strategy) {
  return (req, res, next) =>
    passport.authenticate(
      strategy,
      { session: false },
      authJSONResponse(req, res, next)
    )(req, res, next)
}

const apiAuthLocal = apiAuth('local')
const apiAuthJWT = apiAuth('jwt')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(require('morgan')('combined'))
app.use(require('cookie-parser')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('express-session')({ secret: sessionSecret, resave: false, saveUninitialized: false }))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use(function (err, req, res, next) {
  console.log(err.stack)
  res.status(500).json({ error: err.message })
})

app.get('/', function (req, res) {
  res.render('home', { user: req.user })
})

app.get('/login', function (req, res) {
  res.render('login', { errorMessages: req.flash('error') })
})

app.post('/login', authLocal, function (req, res) {
  res.redirect('/')
})

app.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

app.get('/profile', ensureLoggedIn(), function (req, res) {
  res.render('profile', { user: req.user })
})

app.post('/api/login', apiAuthLocal, function (req, res) {
  const { user } = req
  res.json({
    token: jwt.sign({
      sub: user.username,
      exp: Math.floor(30 + Date.now() / 1000),
      iss: 'accounts.example.com',
      aud: 'yoursite.com'
    }, 'secret')
  })
})

app.get('/api/profile', apiAuthJWT, function (req, res) {
  res.json({ data: { profile: req.user } })
})

app.listen(port, (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log(`Listen :${port}`)
  }
})
