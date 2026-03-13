type Props = {
    verificationCode: string;
};

export const passwordResetEmailTemplate = ({ verificationCode }: Props) => ({
    subject: "Reset Password",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${process.env.APP_ORIGIN}/reset-password?code=${verificationCode}" 
               style="
                background-color: #4CAF50;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
               ">
               Reset Password
            </a>
            <p>This link is valid for 1 hour.</p>
            <p>If you did not make this request, you can ignore this email.</p>
        </div>
    `
});