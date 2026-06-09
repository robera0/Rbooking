import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserModel.findOne({ googleId: profile.id });
        let isNewUser = false;

        if (!user) {
          // also check by email in case they registered normally before
          user = await UserModel.findOne({ email: profile.emails[0].value });

          if (user) {
            // user exists with same email, just link their Google ID
            user = await UserModel.findByIdAndUpdate(
              user._id,
              { googleId: profile.id },
              { new: true },
            );
          } else {
            // truly new user
            isNewUser = true;
            user = await UserModel.create({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              isProfileComplete: false,
            });
          }
        }

        // attach isNewUser to user object

        user.isNewUser = isNewUser;
        console.log("EMAIL TYPE:", typeof user.email, "VALUE:", user.email);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
