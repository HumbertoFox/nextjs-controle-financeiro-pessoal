import { rateLimitRepository } from '@/_lib/ratelimitrepositorys';

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 10 * 60_000; // 10 minutos

// Incrementa o contador da chave e verifica se o limite foi atingido.
// O upsert no banco reseta automaticamente o count quando a janela expira.
async function check(key: string, maxRequests: number, windowMs: number): Promise<{ allowed: boolean; retryAfterSeconds: number; count: number }> {
    const now = new Date();
    const reset_at = new Date(Date.now() + windowMs).toISOString();

    const entry = await rateLimitRepository.incrementAndCheck(key, reset_at);

    if (entry.count > maxRequests) {
        const retryAfterSeconds = Math.ceil((new Date(entry.reset_at).getTime() - now.getTime()) / 1000);
        return { allowed: false, retryAfterSeconds, count: entry.count };
    }

    return { allowed: true, retryAfterSeconds: 0, count: entry.count };
}

// Verifica rate limit por IP e por email separadamente.
// O check por IP é ignorado quando o IP não pôde ser identificado,
// evitando que requests sem header acumulem um contador compartilhado.
export async function checkLoginRateLimit(ip: string, email: string): Promise<{
    allowed: boolean;
    retryAfterSeconds: number;
    reason: 'ip' | 'email' | null;
    warning?: 'will-be-blocked';
}> {
    // IP desconhecido: pula o check por IP para evitar contador compartilhado entre requests sem header
    if (ip !== 'unknown') {
        const byIp = await check(`login:ip:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
        if (!byIp.allowed) {
            return { allowed: false, retryAfterSeconds: byIp.retryAfterSeconds, reason: 'ip' };
        }
    }

    const byEmail = await check(`login:email:${email.toLowerCase()}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!byEmail.allowed) {
        return { allowed: false, retryAfterSeconds: byEmail.retryAfterSeconds, reason: 'email' };
    }

    // Na tentativa LOGIN_MAX_ATTEMPTS - 1 (4ª de 5), avisa que a próxima falha bloqueará o acesso
    const isLastWarning = byEmail.count === LOGIN_MAX_ATTEMPTS - 1;

    return { allowed: true, retryAfterSeconds: 0, reason: null, ...(isLastWarning && { warning: 'will-be-blocked' }) };
}

// Remove os contadores após login bem-sucedido.
// A chave de IP só é deletada quando o IP foi identificado.
export async function resetLoginRateLimit(ip: string, email: string): Promise<void> {
    const keys = [`login:email:${email.toLowerCase()}`];
    if (ip !== 'unknown') keys.push(`login:ip:${ip}`);
    await Promise.all(keys.map(key => rateLimitRepository.deleteByKey(key)));
}

// 3 tentativas em 15 minutos
export async function checkForgotPasswordRateLimit(email: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
    return check(`forgot:email:${email.toLowerCase()}`, 3, 15 * 60_000);
}