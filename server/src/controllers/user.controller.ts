import { Request, Response } from "express";
import { OK } from "../constants/http";
import { getUserProfileService } from "../services/user.service";

export const getUserProfile = async (req: Request, res: Response) => {
    const user = await getUserProfileService(req.userId);

    return res.status(OK).json({
        message: "Profile fetched sucessfully.",
        user
    });
};