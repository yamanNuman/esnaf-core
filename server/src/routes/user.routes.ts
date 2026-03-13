import { Router } from "express";
import authenticate from "../middleware/authenticate";
import catchErrors from "../utils/catchErrors";
import { getUserProfile } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get('/profile', catchErrors (authenticate), catchErrors(getUserProfile));

export default userRouter;