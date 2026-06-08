import { Avatar, AvatarFallback, AvatarImage } from '@/_components/ui/avatar';
import { useInitials } from '@/_hooks/use-initials';
import { UserSettingsClientProps } from '@/_types';
import CreateFamilyForm from './form-register-family';
import InviteMemberForm from './form-invite-member';
import { Button } from '@/_components/ui/button';

export default function FamilyPageClient({ user, csrfToken, familyMembers }: UserSettingsClientProps) {
    const getInitials = useInitials();

    // INDIVIDUAL sem família — mostra formulário de criação
    if (!user.family_id) {
        return (
            <>
                <div className="space-y-6">
                    <div className="mb-8 my-1 space-y-0.5">
                        <h2 className="text-xl font-semibold tracking-tight">Criar Família</h2>
                        <p className="text-muted-foreground text-sm">Crie uma família para compartilhar finanças com outras pessoas.</p>
                    </div>
                    <CreateFamilyForm
                        csrfToken={csrfToken}
                        userId={user.id}
                    />
                </div>
            </>
        );
    }

    // Usuário já tem família
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">{user.family_name}</h2>
                    <p className="text-muted-foreground text-sm">Gerencie os membros da sua família.</p>
                </div>

                {/* Convidar membro */}
                <InviteMemberForm
                    csrfToken={csrfToken}
                    familyId={user.family_id}
                />

                {/* Lista de membros */}
                <div className="flex flex-col gap-3">
                    <strong className="text-sm">Membros</strong>
                    {familyMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                    {member.avatar ? (
                                        <AvatarImage src={member.avatar} alt={member.name} />
                                    ) : (
                                        <AvatarFallback className="text-xs bg-neutral-200 dark:bg-neutral-700">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm font-medium">{member.name}</span>
                                    <span
                                        className={`text-xs font-pirata ${member.role === 'ADMIN' ? 'text-blue-700' : member.role === 'INDIVIDUAL' ? 'text-orange-700' : 'text-green-700'}`}
                                    >
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                            {/* Só mostra remover se não for o próprio usuário */}
                            {member.id !== user.id && (
                                <Button variant="destructive">
                                    Remover
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sair da família */}
            {user.role === 'MEMBER' && (
                <Button
                    variant='destructive'
                    className="mr-auto"
                >
                    Sair da família
                </Button>
            )}
        </>
    );
}