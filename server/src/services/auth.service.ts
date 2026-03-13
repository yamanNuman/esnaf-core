import AppErrorCode from "../constants/appErrorCode";
import { BAD_REQUEST, CONFLICT, NOT_FOUND, UNAUTHORIZED } from "../constants/http";
import { sendPasswordResetEmail, sendVerificationEmail } from "../emails/sendMail";
import { prisma } from "../prisma/seed";
import { LoginInput, RegisterInput, ResetPasswordInput } from "../schemas/auth.schema";
import appAssert from "../utils/appAssert";
import { compareValue, hashValue } from "../utils/bcrypt";
import { oneDayFromNow, oneHourFromNow, thirtyDaysFromNow } from "../utils/date";
import { AccessTokenSignOptions, RefreshTokenPayload, RefreshTokenSignOptions, signToken, verifyToken } from "../utils/jwt";


export const registerService = async (data: RegisterInput) => {
    //Check email
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email}
    });

    appAssert(
        !existingUser, 
        CONFLICT, 
        "Email already in use", 
        AppErrorCode.EmailAlreadyInUser
    );

    //Hash Password
    const hashedPassword = await hashValue(data.password, 10);

    //Create User
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword
        }
    });

    //Create VerificationCode
    const verificationCode = await prisma.verificationCode.create({
        data: {
            userId: user.id,
            type: "EmailVerification",
            code: crypto.randomUUID(),
            expiresAt: oneDayFromNow()
        }
    });

    //Send email
    await sendVerificationEmail({
        to: user.email,
        verificationCode: verificationCode.code
    });

    //Return user
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, verificationCode };

};

export const loginService = async (data: LoginInput) => {
    //Find User
    const user = await prisma.user.findUnique({
        where: { email: data.email}
    });

    appAssert(
        user,
        UNAUTHORIZED,
        "Invalid email or password",
        AppErrorCode.InvalidCredentials
    );

    //Check Password
    const isPasswordValid = await compareValue(data.password, user.password);

    appAssert(
        isPasswordValid,
        UNAUTHORIZED,
        "Invalid email or password",
        AppErrorCode.InvalidCredentials
    );

    //Create Session
    const session = await prisma.session.create({
        data: {
            userId: user.id,
            userAgent: data.userAgent,
            expiresAt: thirtyDaysFromNow()
        }
    });

    //Generate AccessToken
    const accessToken = signToken(
        { userId: user.id, sessionId: session.id },
        AccessTokenSignOptions
    );

    //Generate RefreshToken
    const refreshToken = signToken(
        { sessionId: session.id },
        RefreshTokenSignOptions
    );

    //Return User Response
    const { password: _, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
    };
};

export const refreshTokenService = async (refreshToken: string) => {
    //Decode Refresh Token
    const { payload, error } = verifyToken<RefreshTokenPayload>(refreshToken, {
        secret: RefreshTokenSignOptions.secret
    });

    appAssert(
        payload,
        UNAUTHORIZED,
        error === "jwt expired" ? "Refresh token expired" : "Invalid  refresh token",
        AppErrorCode.InvalidAccessToken
    );

    //Check Session
    const session = await prisma.session.findUnique({
        where : { id: payload.sessionId }
    });
    
    appAssert(
        session,
        UNAUTHORIZED,
        "Session expired",
        AppErrorCode.SessionExpired
    );

    //Session Update - 30 day
    const updateSession =  await prisma.session.update({
        where : { id: session.id},
        data : {
            expiresAt: thirtyDaysFromNow()
        }
    });

    //New AccessToken
    const newAccessToken = signToken(
        { userId: session.userId, sessionId: session.id },
        AccessTokenSignOptions
    );

    return { newAccessToken };
};

export const logoutService = async (sessionId: string) => {
    //Clear Session
    const session = await prisma.session.delete({
        where: { id: sessionId}
    });

    appAssert(
        session,
        NOT_FOUND,
        "Session not found",
        AppErrorCode.SessionNotFound
    );

    return session;
}

export const verifyEmailService = async (code: string) => {

    const verificationCode = await prisma.verificationCode.findUnique({
        where : {
            code,
            type: "EmailVerification",
            expiresAt: { gt: new Date()}
        }
    });

    appAssert(
        verificationCode,
        NOT_FOUND,
        "Invalid or expired verification code",
        AppErrorCode.InvalidVerificationCode
    );

    const user = await prisma.user.update({
        where: { id: verificationCode.userId },
        data: { verified: true},
        omit: { password: true}
    });

    appAssert(
        user,
        NOT_FOUND,
        "User not found",
        AppErrorCode.UserNotFound
    );

    await prisma.verificationCode.delete({
        where: { id: verificationCode.id}
    });

    return { user };
};

export const forgotPasswordService = async (email: string) => {
    //Find User
    const user = await prisma.user.findUnique({
        where: { email}
    });

    appAssert(
        user,
        NOT_FOUND,
        "User not found",
        AppErrorCode.UserNotFound
    );

    //Check Verify Email
    appAssert(
        user.verified,
        BAD_REQUEST,
        "Email not verified",
        AppErrorCode.InvalidVerificationCode
    );

    //Check PasswordReset
    await prisma.verificationCode.deleteMany({
        where: {
            userId: user.id,
            type: "PasswordReset"
        }
    });

    //New PasswordReset Code
    const verificationCode = await prisma.verificationCode.create({
        data: {
            userId: user.id,
            type: "PasswordReset",
            code: crypto.randomUUID(),
            expiresAt: oneHourFromNow()
        }
    });

    //Send email
    await sendPasswordResetEmail({
        to: user.email,
        verificationCode: verificationCode.code
    });

    return { message: "Password reset email sent."};
};

export const resetPasswordService =  async (data: ResetPasswordInput) => {
    const verificationCode = await prisma.verificationCode.findUnique({
        where: {
            code: data.code,
            type: "PasswordReset",
            expiresAt: { gt: new Date()}
        }
    });

    appAssert(
        verificationCode,
        NOT_FOUND,
        "Invalid or expired reset code",
        AppErrorCode.InvalidVerificationCode
    );

    const hashedPassword = await hashValue(data.password);

    const user = await prisma.user.update({
        where: { id: verificationCode.userId },
        data: { password: hashedPassword }
    });

    appAssert(
        user,
        NOT_FOUND,
        "User not found",
        AppErrorCode.UserNotFound
    );

    await prisma.verificationCode.delete({
        where: { id: verificationCode.id }
    });

    await prisma.session.deleteMany({
        where: { userId: user.id }
    });

    return { user };
};