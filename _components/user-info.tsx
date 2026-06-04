'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/_components/ui/avatar';
import { useInitials } from '@/_hooks/use-initials';
import { UserInfoProps } from '@/_types';

export function UserInfo({ user, showEmail = false, }: UserInfoProps) {
    const getInitials = useInitials();
    return (
        <>
            <Avatar className="overflow-hidden rounded-full">
                {user.avatar ? (
                    <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                    />
                ) : (
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
            </div>
        </>
    );
}