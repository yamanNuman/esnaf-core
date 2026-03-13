import { Request, Response, NextFunction } from "express";
import catchErrors from "../utils/catchErrors";
import { prisma } from "../prisma/seed";
import appAssert from "../utils/appAssert";
import { FORBIDDEN } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

const authorize = (...roles: ("ADMIN" | "USER")[]) => {
    return catchErrors(async (req: Request, res: Response, next: NextFunction) => {
        console.log("authorize called, role:",roles, "userId", req.userId);
        const user = await prisma.user.findUnique({
            where : { id: req.userId },
            select: { role: true }
        });
        
        appAssert(
            user,
            FORBIDDEN,
            "User not found",
            AppErrorCode.UserNotFound
        );

        appAssert(
            roles.includes(user.role as "ADMIN" | "USER"),
            FORBIDDEN,
            "You are not authorized to perform this action",
            AppErrorCode.UnauthorizedAccess
        );
        next();
    });
}
export default authorize;