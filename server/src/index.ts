import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import {prisma} from "./prisma/seed";
import { APP_ORIGIN, PORT } from "./constants/env";
import errorHandler from "./middleware/errorHandlers";
import catchErrors from "./utils/catchErrors";
import { INTERNAL_SERVER_ERROR, OK } from "./constants/http";
import appAssert from "./utils/appAssert";
import AppError from "./utils/AppError";
import AppErrorCode from "./constants/appErrorCode";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import productRouter from "./routes/product.routes";
import debtRouter from "./routes/debt.route";
import taxRouter from "./routes/tax.routes";
import accountingRouter from "./routes/accounting.routes";
import aiRouter from "./routes/ai.routes";
import passport from "./config/passport";
import githubRouter from "./routes/github.routes";

const app = express();

//Middlewares
app.use(express.json());                          //JSON body parsing
app.use(helmet());                                //Security Headers
app.use(express.urlencoded({extended:true}));     //Form-data parsing     
app.use(cors({                                    //Cross-origin req.
    origin: APP_ORIGIN,
    credentials: true
}));            
app.use(cookieParser());                          //Cookie parsing
app.use(morgan("dev"));                           //HTTP Request Logging
app.use(passport.initialize());
//Routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/products', productRouter);
app.use('/debts', debtRouter);
app.use('/taxes', taxRouter);
app.use('/accounting', accountingRouter);
app.use('/api', aiRouter);
app.use('/auth/github', githubRouter);

//Test Route
app.get('/test', catchErrors(async(req, res) => {
    const accessToken = null;
    appAssert(accessToken, INTERNAL_SERVER_ERROR, "Invalid Access Token", AppErrorCode.InvalidAccessToken);
    res.status(OK).send({msg: "Running..."});
}));

//Error Middleware
app.use(errorHandler);

async function startServer() {
    try {
        await prisma.$connect();
        await prisma.$executeRaw`SELECT 1`;
        console.log('PostgreSQL connection successfull.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} ...`);
     });
    } catch (err) {
        console.log('DB Connection Error', err);
        process.exit(1);
    }
}
startServer();