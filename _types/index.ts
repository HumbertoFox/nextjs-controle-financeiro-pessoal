import { LucideIcon } from 'lucide-react';

export type UserRole = 'INDIVIDUAL' | 'MEMBER' | 'ADMIN';

export type AccountType = 'CURRENT' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'DIGITAL';

export type TransactionType = 'REVENUE' | 'EXPENSE';

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export const UserRolesZod: UserRole[] = ['INDIVIDUAL', 'MEMBER', 'ADMIN'];

export const AccountTypeZod: AccountType[] = ['CURRENT', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'DIGITAL'];

export const TransactionTypeZod: TransactionType[] = ['REVENUE', 'EXPENSE'];

export const transactionStatusZod: TransactionStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED'];

export const roleLabels: Record<UserRole, string> = { INDIVIDUAL: 'Individual', MEMBER: 'Membro', ADMIN: 'Administrador' };

export const accountTypeLabel: Record<AccountType, string> = { CURRENT: 'Conta corrente', SAVINGS: 'Poupança', CREDIT: 'Cartão de crédito', INVESTMENT: 'Investimento', DIGITAL: 'Conta digital' };

export const transactionTypeLabel: Record<TransactionType, string> = { REVENUE: 'Receita', EXPENSE: 'Despesa' };

export const transactionStatusLabel: Record<TransactionStatus, string> = { PENDING: 'Pendente', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' };

export const TransactionStatusClass: Record<TransactionStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    CONFIRMED: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    CANCELLED: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
};

export const MAX_FILE_SIZE = 512 * 1024;

export const MAX_DIMENSION = 512;

export const MIME_TO_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export const CSRF_COOKIE_NAME = 'csrfToken';

export type UserDetailsProps = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
    readonly family_id?: string | null;
    readonly family_name?: string | null;
    readonly is_owner: boolean;
    readonly role: UserRole;
    readonly email_verified?: string | null;
    readonly deleted_at?: string | null;
    readonly created_at: string;
    readonly updated_at: string;
}

export type UserActive = UserDetailsProps & {
    readonly password: string;
}

export type UserProfilePageProps = {
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
    readonly email_verified?: string | null;
}

export type UserSettingsClientProps = {
    user: UserDetailsProps;
    readonly csrfToken?: string;
    readonly familyMembers: Pick<UserDetailsProps, 'id' | 'name' | 'avatar' | 'role'>[];
}

export type Account = {
    readonly id: string;
    readonly name: string;
    readonly type: AccountType;
    readonly current_balance: string;
    readonly initial_balance: string;
}

export type CategoryNode = {
    readonly id: string;
    readonly name: string;
    readonly type: TransactionType;
    readonly parent_id: string | null;
    readonly depth: number;
    readonly children?: CategoryNode[];
}

export type CategoryFlat = {
    readonly id: string;
    readonly name: string;
    readonly type: TransactionType;
    readonly parent_id: string | null;
    readonly parent_name: string | null;
    readonly depth: number;
}

export type TransactionRow = {
    readonly id: string;
    readonly type: TransactionType;
    readonly value: string;
    readonly description: string | null;
    readonly transaction_date: string;
    readonly status: TransactionStatus;
    readonly account_name: string;
    readonly category_name: string;
    readonly subcategory_name: string | null;
}

export type TransactionsPaginated = {
    rows: TransactionRow[];
    readonly total: number;
}

export type DialogAddCategoryProps = {
    categories: CategoryFlat[];
}

export type DialogAddTransactionProps = {
    accounts: Account[];
    categories: CategoryFlat[];
}

export type TransactionsTableProps = {
    rows: TransactionRow[];
    readonly total: number;
    readonly pageSize: number;
}

export type AccountSummary = {
    readonly id: string;
    readonly name: string;
    readonly type: AccountType;
    readonly current_balance: string;
}

export type UserSummaryCardsProps = {
    user: UserDetailsProps;
    accounts: AccountSummary[];
}

export type ProfileForm = {
    readonly name: string;
    readonly email: string;
    readonly family_name?: string | null;
    readonly avatar?: string | null;
}

export type csrfTokenProps = {
    readonly csrfToken?: string;
}

export type ProfileFormClientProps = ProfileForm & csrfTokenProps & {
    readonly mustVerifyEmail: boolean;
}

export type UserComponentProps = {
    user: ProfileForm;
}

export type UserInfoProps = UserComponentProps & {
    readonly showEmail?: boolean;
}

export type BreadcrumbItemProps = {
    readonly text: string;
    readonly href?: string;
}

export type SidebarNavItemProps = {
    readonly text: string;
    readonly href: string;
}

export type NavMainItemProps = {
    readonly title: string;
    readonly href: string;
    readonly icon?: LucideIcon | null;
    readonly isActive?: boolean;
}

export type DashboardSidebarHeaderProps = {
    items: BreadcrumbItemProps[];
}

export type HeadingProps = {
    readonly title: string;
    readonly description?: string;
}

export type LoginFormProps = {
    readonly email: string;
    readonly password: string;
}

export type RegisterFormProps = LoginFormProps & {
    readonly name: string;
    readonly password_confirmation: string;
    readonly avatar?: File;
}

export type UserFormProps = ProfileForm & {
    readonly id: string;
    readonly role: UserRole;
    readonly password?: string;
    readonly password_confirmation?: string;
}

export type RegisterFormUserProps = csrfTokenProps & {
    user?: UserFormProps;
    readonly isEdit?: boolean;
    readonly titleForm: string;
    readonly valueButton?: string;
}

export type ResetPasswordForm = {
    readonly token: string;
    readonly password: string;
    readonly password_confirmation: string;
}

export type UsersActionsProps = {
    readonly id: string;
    readonly name: string;
    readonly deleted_at?: string | null;
}

export type UserActionsProps = {
    readonly user: UsersActionsProps;
}

export type UserActionButtonsProps = {
    user: {
        readonly id: string;
        readonly name: string;
        readonly email: string;
        readonly deleted_at?: string | null;
    };
    readonly csrfToken?: string;
}

export type AdminActionsProps = {
    admin: UsersActionsProps;
    readonly loggedAdmin: string;
}

export type AdminActionButtonsProps = {
    admin: {
        readonly id: string;
        readonly name: string;
        readonly email: string;
        readonly deleted_at?: string | null;
    };
    readonly csrfToken?: string;
    readonly isLoggedAdmin: boolean;
}

export type UserPublic = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: UserRole;
    readonly avatar?: string | null;
    readonly email_verified?: string | null;
    readonly created_at: string;
    readonly updated_at: string;
}

export type UserAdminPublic = UserPublic & {
    readonly deleted_at?: string | null;
}

export type UsersPagination = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly family_name?: string | null;
    readonly family_member_count?: number | null;
    readonly role: UserRole;
    readonly deleted_at?: string | null;
}

export type User = UserPublic & {
    readonly is_owner: boolean;
    readonly password: string;
    readonly family_id?: string | null;
    readonly deleted_at?: string | null;
}

export type VerificationToken = {
    readonly identifier: string;
    readonly token: string;
    readonly expires_at: string;
}

export type RateLimitEntry = {
    readonly count: number;
    readonly reset_at: string;
}

export type PasswordChecklistProps = {
    readonly password?: string;
}

export type InviteMemberFromProps = {
    readonly csrfToken?: string;
    readonly familyId: string;
}

export type InviteAcceptClientProps = {
    readonly email: string;
    readonly token: string;
    readonly csrfToken?: string;
}

export type InviteAcceptPageProps = {
    searchParams: Promise<{
        readonly email?: string;
        readonly token?: string
    }>;
}

export type UserDetailsTableProps = {
    user: UserDetailsProps;
    readonly familyName: string | null;
}