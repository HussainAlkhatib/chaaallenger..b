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
    console.log('Serializing user:', user);
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user with id:', id);
    try {
        const user = await usersCollection.findOne({ _id: id });
        if (!user) {
            console.log('Deserialize: User not found in DB.');
            return done(new Error('User not found'), null);
        }
        console.log('Deserialized user found:', user);
        done(null, user);
    } catch (err) {
        console.error('Error in deserializeUser:', err);
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
    console.log('Google Strategy: Profile received:', profile);
    try {
        const existingUser = await usersCollection.findOne({ googleId: profile.id });
        if (existingUser) {
            console.log('Google Strategy: Existing user found:', existingUser);
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
        const insertedUser = await usersCollection.findOne({_id: result.insertedId});
        console.log('Google Strategy: New user created:', insertedUser);
        return done(null, insertedUser);
    } catch (err) {
        console.error('Google Strategy: Error:', err);
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
    console.log('User authenticated successfully. Session content after auth:', req.session);
    res.redirect('/');
  });

app.get('/auth/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            console.error('Logout error:', err);
            return next(err); 
        }
        console.log('User logged out. Session content after logout:', req.session);
        res.redirect('/');
    });
});

app.get('/auth/status', (req, res) => {
    console.log('Checking /auth/status. Session content:', req.session);
    if (req.isAuthenticated()) {
        console.log('User IS authenticated. User object:', req.user);
        res.json({
            loggedIn: true,
            user: {
                displayName: req.user.displayName,
                email: req.user.email,
                image: req.user.image
            }
        });
    } else {
        console.log('User is NOT authenticated.');
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