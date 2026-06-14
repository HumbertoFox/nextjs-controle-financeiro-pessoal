export function formatDate(
    date: string | Date
): string {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date.replace(' ', 'T'));

    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

const SMALL_WORDS = new Set([
    'da', 'de', 'do', 'dos', 'das', 'e', 'em', 'na', 'no', 'nas', 'nos'
]);

export function formatBrazilianName(value: string) {
    return value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((word, index) => {
            if (index !== 0 && SMALL_WORDS.has(word)) {
                return word; // mantém minúsculo
            }

            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

export function formatCurrency(value?: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}