import { Router } from "express";
import catchErrors from "../utils/catchErrors";
import { resetPasswordHandler, verifyEmailHandler,loginHandler, logoutHandler, refreshTokenHandler, registerHandler, forgotPasswordHandler } from "../controllers/auth.controller";
import authenticate from "../middleware/authenticate";

const authRouter = Router();

authRouter.post('/register', catchErrors(registerHandler));
authRouter.post('/login', catchErrors(loginHandler));
authRouter.get('/refresh', catchErrors(refreshTokenHandler));
authRouter.get('/logout', catchErrors(authenticate), catchErrors(logoutHandler));
authRouter.get('/verify-email/:code', catchErrors(verifyEmailHandler));
authRouter.post('/forgot-password', catchErrors(forgotPasswordHandler));
authRouter.post('/reset-password', catchErrors(resetPasswordHandler));

export default authRouter;