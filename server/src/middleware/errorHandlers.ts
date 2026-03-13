import { ErrorRequestHandler, Response } from "express";
import AppError from "../utils/AppError";
import { INTERNAL_SERVER_ERROR } from "../constants/http";

const handleAppError = (res: Response, error: AppError) => {
    return res.status(error.statusCode).json({
        message: error.message,
        errorCode: error.errorCode
    });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.log(`PATH: ${req.path}`, error);

    if(error instanceof AppError) {
        return handleAppError(res, error);
    }
    return res.status(INTERNAL_SERVER_ERROR).send({message: "Internal server error"});
}

export default errorHandler;