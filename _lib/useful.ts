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

