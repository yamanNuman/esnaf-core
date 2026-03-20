import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } from "../constants/env";

passport.use(
    new GitHubStrategy(
        {
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: GITHUB_CALLBACK_URL,
            scope: ["user:email"],
        },
        async (_accessToken: string, _refreshToken:string, profile: any, done: any) => {
            try {
                return done(null, profile);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

export default passport;