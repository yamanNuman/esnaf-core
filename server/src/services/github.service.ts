import { prisma } from "../prisma/seed";
import { hashValue } from "../utils/bcrypt";
import { AccessTokenSignOptions, RefreshTokenSignOptions, signToken } from "../utils/jwt"; 
import { oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import { APP_ORIGIN } from "../constants/env";
import { ref } from "node:process";

export const githubOAuthService = async (githubProfile: {
    id: string;
    displayName: string;
    emails?: { value: string } [];
}) => {
    const email = githubProfile.emails?.[0]?.value;
    const name = githubProfile.displayName || `github_${githubProfile.id}`;

    let user = email ? await prisma.user.findUnique({ where: { email }}) : null;

    if(!user) {
        const randomPassword = await hashValue(Math.random().toString(36));
        user = await prisma.user.create({
            data: {
                name,
                email: email || `github_${githubProfile.id}@noemail.com`,
                password: randomPassword,
                verified: true,
                role: "USER"
            }
        });
    }

    const session = await prisma.session.create({
        data: {
            userId: user.id,
            expiresAt: oneYearFromNow(),
        }
    });

    const accessToken = signToken({ userId: user.id, sessionId: session.id}, AccessTokenSignOptions);
    const refreshToken = signToken({ sessionId: session.id}, RefreshTokenSignOptions);

    return {user, accessToken, refreshToken};
}