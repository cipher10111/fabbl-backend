import express from "express";
import compression from "compression";
import cors from "cors";
import csurf from "csurf";
import logger from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "../controllers/passport/index.js";
import fileUpload from "express-fileupload";
const configureExpress = (app) => {
  const DB_URL = process.env.DB_URL || "mongodb://localhost/fabblDB";
  const clientP = mongoose
    .connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((m) => m.connection.getClient());

  mongoose.connection.on(
    "error",
    console.error.bind(console, "____mongoDB connection error____")
  );

  app.use(compression());
  app.use(fileUpload({ useTempFiles: true }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cors());
  app.use(express.json());
  app.use(express.static("public"));
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(logger("dev"));

  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise: clientP,
        dbName: "fabblDB",
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === "production",
      },
    })
  );
  passport.initialize();
  passport.session();

  // CSRF security for Production
  if (process.env.NODE_ENV === "production") {
    app.use(csurf());
    app.use((req, res, next) => {
      res.set("x-frame-options", "DENY");
      res.cookie("mytoken", req.csrfToken());
      next();
    });
  }
};

export default configureExpress;
