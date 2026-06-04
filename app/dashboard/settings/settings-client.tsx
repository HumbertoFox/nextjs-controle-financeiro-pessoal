'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/_components/ui/avatar';
import { useInitials } from '@/_hooks/use-initials';
import { formatDate } from '@/_lib/useful';
import { UserSettingsClientProps } from '@/_types';
import { BadgeAlert, BadgeCheck } from 'lucide-react';

export default function SettingsPageClient({ user, familyMembers }: UserSettingsClientProps) {
    const getInitials = useInitials();
    return (
        <>
            <div className="flex flex-1 flex-col lg:flex-row gap-4 cursor-default">
                <div className="size-40 rounded-full overflow-hidden border border-gray-300">
                    <Avatar className="size-full overflow-hidden rounded-full">
                        {user.avatar ? (
                            <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                            />
                        ) : (
                            <AvatarFallback className="font-bold font-pirata text-8xl bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </div>
                <div className="flex flex-col justify-center gap-2 text-left leading-tight">
                    <div className="group">
                        <strong>ID : </strong>
                        <span className="blur-sm group-hover:blur-none transition cursor-help">
                            {user.id}
                        </span>
                    </div>
                    <span className="font-extralight font-pirata text-3xl">
                        <strong>{user.name}</strong>
                    </span>
                    <span className="text-muted-foreground truncate text-sm gap-x-1.5 inline-flex">
                        {user.email}
                        {user.email_verified ? <BadgeCheck className="text-green-500" /> : <BadgeAlert className="text-orange-500" />}
                    </span>
                    <div>
                        <strong>Tipo de conta : </strong>
                        <span className={`font-serif ${user.role === 'ADMIN' ? 'text-blue-700' : user.role === 'INDIVIDUAL' ? 'text-orange-700' : 'text-green-700'}`}>
                            {user.role}
                        </span>
                    </div>
                    <div>
                        <strong>Membro da Família : </strong>
                        <span className={`font-serif ${user.role === 'ADMIN' ? 'text-blue-700' : user.role === 'INDIVIDUAL' ? 'text-orange-700' : 'text-green-700'}`}>
                            {user.family_name ? user.family_name : 'Nenhuma família associada'}
                        </span>
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <strong>Usuário criado em : </strong>
                    <span>{formatDate(user.created_at)}</span>
                </div>
                <div>
                    <strong>Usuário atualizou em : </strong>
                    <span>{formatDate(user.updated_at)}</span>
                </div>
            </div>
            {familyMembers.length > 0 && (
                <div>
                    <strong>Membros da Família</strong>
                    <div className="flex flex-col gap-2 mt-2">
                        {familyMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-2">
                                <Avatar className="size-6">
                                    {member.avatar ? (
                                        <AvatarImage
                                            src={member.avatar}
                                            alt={member.name}
                                        />
                                    ) : (
                                        <AvatarFallback className="text-xs bg-neutral-200 dark:bg-neutral-700">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <span className="text-sm">{member.name}</span>
                                <span className={`text-xs font-pirata ${member.role === 'ADMIN' ? 'text-blue-700' : member.role === 'INDIVIDUAL' ? 'text-orange-700' : 'text-green-700'}`}>
                                    {member.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}