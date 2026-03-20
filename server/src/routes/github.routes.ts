import { Router } from "express";
import passport from "passport";
import { githubCallbackHandler } from "../controllers/github.controller";
import catchErrors from "../utils/catchErrors";

const githubRouter = Router();

githubRouter.get(
    "/",
    passport.authenticate("github", { session: false})
);

githubRouter.get(
    "/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login"}),
    catchErrors(githubCallbackHandler)
);

export default githubRouter;