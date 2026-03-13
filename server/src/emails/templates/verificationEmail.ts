import { APP_ORIGIN } from "../../constants/env";

type Props = {
    verificationCode: string;
};

export const verificationEmailTemplate = ({ verificationCode }: Props) => ({
    subject: "Verify Your Email Address.",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Click the button below to verify your email address:</p>
            <a href="${APP_ORIGIN}/verify-email/${verificationCode}" 
               style="
                background-color: #4CAF50;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
               ">
               Verify Email
            </a>
            <p>This link is valid for 24 hours.</p>
            <p>If you did not make this request, you can ignore this email.</p>
        </div>
    `
});