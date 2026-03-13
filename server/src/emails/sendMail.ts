import { resend } from "./index";
import { EMAIL_SENDER } from "../constants/env";
import { verificationEmailTemplate } from "./templates/verificationEmail";
import { passwordResetEmailTemplate } from "./templates/passwordResetEmail";

type SendVerificationEmailParams = {
    to: string,
    verificationCode: string
};

export const sendVerificationEmail = async ({
    to,
    verificationCode,
}: SendVerificationEmailParams) => {
    const template = verificationEmailTemplate({verificationCode});

    const { data, error } = await resend.emails.send({
        from: EMAIL_SENDER,
        to,
        subject: template.subject,
        html: template.html
    });
    
    if(error) {
        console.error("Email sending error:", error);
        throw new Error("Failed to send verification email");
    }

    return data;
};

export const sendPasswordResetEmail =  async ({
    to,
    verificationCode
}: SendVerificationEmailParams) => {
    const template = passwordResetEmailTemplate({ verificationCode });

    const { data, error } = await resend.emails.send({
        from: EMAIL_SENDER,
        to,
        subject: template.subject,
        html: template.html
    });

    if(error) {
        console.error("Email sending error:", error);
        throw new Error("Failed to send password reset email");
    }

    return data;
};