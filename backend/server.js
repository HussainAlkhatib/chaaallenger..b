const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Environment Variable Check =====
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable not set');
}
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable not set');
}
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID environment variable not set');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable not set');
}

// ===== MongoDB Connection Logic =====
const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function connectToDb() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}
const db = client.db("GoogleUsers");
const usersCollection = db.collection("users");

// ===== Session and Passport Configuration =====
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usersCollection.findOne({ _id: id });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await usersCollection.findOne({ googleId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            createdAt: new Date()
        };
        const result = await usersCollection.insertOne(newUser);
        // The document inserted has an _id, let's pass that back
        const insertedUser = await usersCollection.findOne({_id: result.insertedId});
        return done(null, insertedUser);
    } catch (err) {
        return done(err, null);
    }
  }
));

// ===== Authentication Routes =====
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to the main page.
    res.redirect('/');
  });

app.get('/auth/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            loggedIn: true,
            user: {
                displayName: req.user.displayName,
                email: req.user.email,
                image: req.user.image
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});


// ===== Static File Serving and API Routes =====
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/data', (req, res) => {
    res.json({ message: 'Welcome from the backend!' });
});

// All other GET requests not handled before will return the frontend's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});


// ===== Start Server =====
connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});