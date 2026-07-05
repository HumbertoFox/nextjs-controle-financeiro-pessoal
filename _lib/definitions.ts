import { AccountTypeZod, TransactionTypeZod, UserRolesZod } from '@/_types';
import * as z from 'zod';

const passwordSchema = z.string()
    .min(8, 'The password must be at least 8 characters long.')
    .max(72, 'The password must be at most 72 characters long.')
    .regex(/[A-Z]/, 'The password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'The password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'The password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'The password must contain at least one special character (e.g. !@#$%&).');

export const createAdminSchema = z.object({
    name: z.string()
        .min(1, 'Name is required.'),
    email: z.email('Invalid email address')
        .trim()
        .toLowerCase()
        .max(254, 'Email must be at most 254 characters long.'),
    password: passwordSchema,
    password_confirmation: z.string()
        .min(1, 'Please confirm your password.')
        .max(72, 'The password must be at most 72 characters long.')
})
    .refine((data) => data.password === data.password_confirmation, {
        message: "The passwords don't match.",
        path: ['password_confirmation']
    });

export function getSignUpUpdateSchema(formData: FormData) {
    const isEdit = Boolean(formData.get('id'));

    return z.object({
        name: z.string()
            .min(1, 'Name is required.')
            .max(100, 'Name must be at most 100 characters long.'),
        email: z.email('Invalid email address')
            .trim()
            .toLowerCase()
            .max(254, 'Email must be at most 254 characters long.'),
        family_name: z.string()
            .min(4, 'Nome deve ter ao menos 4 caracteres.')
            .max(20, 'Family name must be at most 20 characters long.')
            .optional(),
        password: isEdit
            ? z.string().max(72, 'The password must be at most 72 characters long.').optional()
            : passwordSchema,
        password_confirmation: isEdit
            ? z.string().max(72, 'The password must be at most 72 characters long.').optional()
            : z.string().min(1, 'Please confirm your password.').max(72, 'The password must be at most 72 characters long.'),
        role: z.enum(UserRolesZod, {
            error: 'The role must be INDIVIDUAL, MEMBER or ADMIN.'
        })
    })
        .superRefine((data, ctx) => {
            if (data.password !== data.password_confirmation) {
                ctx.addIssue({
                    path: ['password_confirmation'],
                    code: 'custom',
                    message: "The passwords don't match.",
                });
            }
            if (data.role === 'MEMBER' && !data.family_name?.trim()) {
                ctx.addIssue({
                    path: ['family_name'],
                    code: 'custom',
                    message: 'Family name is required for MEMBER accounts.',
                });
            }
        });
}

export const createFamilySchema = z.object({
    name: z.string()
        .min(4, 'Nome deve ter ao menos 4 caracteres.')
        .max(20, 'Family name must be at most 20 characters long.'),
})

export const inviteMemberSchema = z.object({
    familyId: z.uuid({ error: 'ID de produto inválido' }),
    email: z.email('Invalid email address')
        .trim()
        .toLowerCase()
        .max(254, 'Email must be at most 254 characters long.'),
})

export const signInSchema = z.object({
    email: z.email('Invalid email address')
        .trim()
        .toLowerCase()
        .max(254, 'Email must be at most 254 characters long.'),
    password: z.string()
        .min(1, 'The password required.')
        .max(72, 'The password must be less than 72 characters long.')
})

export const updateUserSchema = z.object({
    name: z.string()
        .min(1, 'Name is required.')
        .max(100, 'Name must be at most 100 characters long.'),
    email: z.email('Invalid email address')
        .trim()
        .toLowerCase()
        .max(254, 'Email must be at most 254 characters long.')
})

export const deleteUserSchema = z.object({
    password: passwordSchema
})

export const passwordUpdateSchema = z.object({
    current_password: z.string()
        .min(8, 'The password must be at least 8 characters long.')
        .max(72, 'The password must be at most 72 characters long.'),
    password: passwordSchema,
    password_confirmation: z.string()
        .min(8, 'Please confirm your password.')
        .max(72, 'The password must be at most 72 characters long.')
})
    .refine((data) => data.password === data.password_confirmation, {
        message: "The passwords don't match.",
        path: ['password_confirmation']
    });

export const passwordResetSchema = z.object({
    token: z.string()
        .regex(/^[a-f0-9]{64}$/, 'Invalid or expired token.'),
    password: passwordSchema,
    password_confirmation: z.string()
        .min(1, 'Please confirm your password.')
        .max(72, 'The password must be at most 72 characters long.')
})
    .refine((data) => data.password === data.password_confirmation, {
        message: "The passwords don't match.",
        path: ['password_confirmation']
    });

export const passwordForgotSchema = z.object({
    email: z.email('Invalid email address')
        .trim()
        .toLowerCase()
        .max(254, 'Email must be at most 254 characters long.')
});

export const createAccountActionSchema = z.object({
    name: z.string({ error: 'O nome da conta é obrigatório.' })
        .min(1, 'O nome da conta é obrigatório.')
        .max(50, 'O nome da conta deve ter no máximo 50 caracteres!'),
    type: z.enum(AccountTypeZod, {
        error: 'Valor inválido para o tipo de conta.'
    }),
    initialBalance: z.number()
        .min(0, 'O saldo inicial deve ser um valor positivo!')
        .multipleOf(0.01, "O valor deve ter no máximo 2 casas decimais.")
});

export const createCategoryActionSchema = z.object({
    name: z.string({ error: 'O nome da categoria é obrigatório.' })
        .min(1, 'O nome da categoria é obrigatório.')
        .max(100, 'O nome da categoria deve ter no máximo 100 caracteres!'),
    type: z.enum(TransactionTypeZod, {
        error: 'Valor inválido para o tipo de transação.'
    }),
    parentId: z.uuid({ error: 'Invalid parent category ID.' })
        .nullable()
});

export const createTransactionActionSchema = z.object({
    accountId: z.uuid({ error: 'O ID da conta é obrigatório!' }),
    categoryId: z.uuid({ error: 'O ID da categoria é obrigatório!' }),
    type: z.enum(TransactionTypeZod, {
        error: 'Valor inválido para o tipo de transação.'
    }),
    value: z.number()
        .min(0, 'O saldo inicial deve ser um valor positivo!')
        .multipleOf(0.01, "O valor deve ter no máximo 2 casas decimais."),
    transactionDate: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),
    description: z.string({ error: 'Descrição inválida' })
        .nullable()
});

export type FormStateCreateAdmin =
    | {
        errors?: {
            name?: string[];
            email?: string[];
            password?: string[];
            password_confirmation?: string[];
            avatar?: string[];
        }
        warning?: string;
    } | undefined;

export type FormStateCreateUpdateAdminUser =
    | {
        errors?: {
            name?: string[];
            email?: string[];
            family_name?: string[];
            role?: string[];
            password?: string[];
            password_confirmation?: string[];
            avatar?: string[];
        }
        warning?: string;
    } | undefined;

export type FormStateCreateFamily =
    | {
        errors?: {
            name?: string[];
        }
        message?: string;
        warning?: string;
    } | undefined;

export type FormStateInviteMember =
    | {
        errors?: {
            email?: string[];
        }
        message?: string;
        warning?: string;
    } | undefined;

export type FormStateLoginUser =
    | {
        errors?: {
            email?: string[];
            password?: string[];
        }
        message?: string;
        warning?: string;
        retryAfterSeconds?: number;
    } | undefined;

export type FormStateUserDelete =
    | {
        errors?: {
            password?: string[];
        }
        message?: boolean;
    } | undefined;

export type FormStatePasswordUpdate =
    | {
        errors?: {
            current_password?: string[];
            password?: string[];
            password_confirmation?: string[];
        }
        message?: boolean;
        ts?: number;
    } | undefined;

export type FormStateUserUpdate =
    | {
        errors?: {
            name?: string[];
            email?: string[];
            avatar?: string[];
        };
        message?: string;
        success?: boolean;
        ts?: number;
    } | undefined;

export type FormStatePasswordForgot =
    | {
        errors?: {
            email?: string[];
        }
        message?: string;
        error?: string;
    } | undefined;

export type FormStatePasswordReset =
    | {
        errors?: {
            token?: string[];
            password?: string[];
            password_confirmation?: string[];
        }
        message?: string;
        warning?: string;
    } | undefined;

export type FormStateEmailVerification =
    | {
        error?: string;
        success?: string;
    } | undefined;

export type FormStateAcceptInvite =
    | {
        success?: string;
        warning?: string;
        error?: string;
    } | undefined;

export type HandleImageChangeResult = {
    file: File | null;
    preview: string | null;
    error: string | null;
}

export type FormStateRemoveMember =
    | {
        warning?: string;
        message?: string;
    } | undefined;

export type FormStateCreateAccountAction =
    | {
        errors?: {
            name?: string[];
            type?: string[];
            initialBalance?: string[];
        }
        success?: string;
        error?: string;
    } | undefined;

export type FormStateCreateCategoryAction =
    | {
        errors?: {
            name?: string[];
            type?: string[];
            parentId?: string[];
        }
        success?: string;
        error?: string;
    } | undefined;

export type FormStateCreateTransactionAction =
    | {
        errors?: {
            accountId?: string[];
            categoryId?: string[];
            type?: string[];
            value?: string[];
            transactionDate?: string[];
            description?: string[];
        }
        success?: string;
        error?: string;
    } | undefined;