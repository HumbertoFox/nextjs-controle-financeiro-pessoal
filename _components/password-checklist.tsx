'use client';

import { PasswordChecklistProps } from '@/_types';

export function PasswordChecklist({ password }: PasswordChecklistProps) {
    if (!password) return null;
    const checks = [
        { label: 'Pelo menos 8 caracteres', valid: password.length >= 8 },
        { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
        { label: 'Uma letra minúscula', valid: /[a-z]/.test(password) },
        { label: 'Um número', valid: /[0-9]/.test(password) },
        { label: 'Um personagem especial (ex. !@#$%&)', valid: /[^A-Za-z0-9]/.test(password) },
    ];
    const allValid = checks.every(({ valid }) => valid);
    if (allValid) {
        return (
            <p className="flex items-center gap-2 text-xs text-green-600 mt-1">
                <span className="text-base leading-none">✓</span>
                Senha forte!
            </p>
        );
    }
    return (
        <ul className="mt-1 space-y-1">
            {checks.map(({ label, valid }) => (
                <li
                    key={label}
                    className={`flex items-center gap-2 text-xs ${valid ? 'text-green-600' : 'text-red-500'}`}
                >
                    <span className="text-base leading-none">{valid ? '✓' : '✗'}</span>
                    {label}
                </li>
            ))}
        </ul>
    );
}