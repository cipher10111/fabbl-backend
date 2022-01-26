import passportLocal from "passport-local";
import User from "../../models/userModel.js";
import makeUserOnline from "../../utils/makeUserOnline.js";

const LocalStrategy = passportLocal.Strategy;

export const localRegisterStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, email, password, next) => {
    const { displayName, avatar } = req.body;
    User.findOne({ email }, (err, user) => {
      if (err) return next(err);
      console.log(user);
      if (user)
        return next(null, false, {
          success: false,
          message: "Already registered",
        });

      new User({
        displayName: { value: displayName },
        email,
        // avatar: { value: avatar },
        password,
      }).save((err, user) => {
        if (err) return next(err);
        next(null, user.id);
      });
    });
  }
);

export const localLoginStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, email, password, next) => {
    console.log(email, password);
    User.findOne({ email }, (err, user) => {
      if (err) return next(err);
      if (!user)
        return next(null, false, {
          message: "Email or password is incorrect",
        });

      user.comparePassword(password, async (err, isMatched) => {
        if (err) return next(err);
        if (!isMatched)
          return next(null, false, {
            message: "Email or password is incorrect",
          });
        try {
          const userId = await makeUserOnline(user.id);
          console.log(userId);
          next(null, userId);
        } catch (err) {
          console.log(err);
          return next(err);
        }
      });
    });
  }
);