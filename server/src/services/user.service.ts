import AppErrorCode from "../constants/appErrorCode";
import { NOT_FOUND } from "../constants/http";
import { prisma } from "../prisma/seed"
import appAssert from "../utils/appAssert";


export const getUserProfileService = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: {id: userId},
        omit: {
            password: true
        }
    });

    appAssert(user, NOT_FOUND, "User not found.", AppErrorCode.UserNotFound);

    return user;
};