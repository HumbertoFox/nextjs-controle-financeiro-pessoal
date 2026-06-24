import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: false, auth: { user: SMTP_USER, pass: SMTP_PASS, } });

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    try {
        const result = await transporter.sendMail({
            from: `"nextjs-starter-kit" <${SMTP_USER}>`,
            to,
            subject: 'Password reset',
            html: `
                <p>You requested a password reset.</p>
                <p>Click the link below to create a new password:</p>
                <a href='${resetLink}'>${resetLink}</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });
        return { ok: true, result };

    } catch (error) {
        return { ok: false, error };
    };
}

export const sendEmailVerification = async (to: string, link: string, linkSession?: string) => {
    try {
        const result = await transporter.sendMail({
            from: `"nextjs-starter-kit" <${SMTP_USER}>`,
            to,
            subject: 'Check your email.',
            html: `
                <h2>Email confirmation</h2>
                <p>Click the link below to confirm your email:</p>
                <a href='${link}'>${link}</a>
                <p>Click the link below to confirm your email (System Open):</p>
                <a href='${linkSession}'>${linkSession}</a>
                <p>If you did not request this, you can ignore this email.</p>
            `,
        });
        return { ok: true, result };
    } catch (error) {
        return { ok: false, error };
    };
}

export const sendFamilyInviteEmail = async (to: string, familyName: string, inviteLink: string) => {
    try {
        const result = await transporter.sendMail({
            from: `"nextjs-starter-kit" <${SMTP_USER}>`,
            to,
            subject: `Convite para a família ${familyName}`,
            html: `
                <h2>Convite para família</h2>
                <p>Você foi convidado para entrar na família <strong>${familyName}</strong>.</p>
                <p>Clique no link abaixo para aceitar o convite:</p>
                <a href='${inviteLink}'>${inviteLink}</a>
                <p>Este link expira em 24 horas.</p>
                <p>Se você não esperava este convite, ignore este email.</p>
            `,
        });
        return { ok: true, result };
    } catch (error) {
        return { ok: false, error };
    };
}

export const sendCreatedEmailAccountVerification = async (to: string, link: string, linkSession?: string) => {
    try {
        const result = await transporter.sendMail({
            from: `"nextjs-starter-kit" <${SMTP_USER}>`,
            to,
            subject: 'Check your email.',
            html: `
                <h2>Sua conta foi criada com sucesso!</h2>
                <p>Clique no link abaixo para confirmar seu e-mail; se o e-mail não for confirmado em até 30 dias, você não conseguirá acessar sua conta.</p>
                <a href='${link}'>${link}</a>
                <p>Clique no link abaixo para confirmar seu e-mail (o sistema abrirá no mesmo navegador):</p>
                <a href='${linkSession}'>${linkSession}</a>
                <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
            `,
        });
        return { ok: true, result };
    } catch (error) {
        return { ok: false, error };
    }
}