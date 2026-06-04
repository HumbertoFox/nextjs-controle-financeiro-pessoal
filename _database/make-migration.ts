import fs from 'fs';
import path from 'path';

let description: string | undefined = process.argv[2];

function sanitizeDescription(desc: string) {
    return desc
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

const migrationsDir = path.join(process.cwd(),
    '_database',
    'migrations'
);

if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.includes('reset'));

const lastNumber = files
    .map(file => parseInt(file.split('_')[0], 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => b - a)[0] || 0;

const nextNumber = (lastNumber + 1)
    .toString()
    .padStart(3, '0');

const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .slice(0, 15);

if (description) {
    description = sanitizeDescription(description);
    if (!description) description = undefined;
}

const filename = description
    ? `${nextNumber}_${timestamp}_${description}.sql`
    : `${nextNumber}_${timestamp}.sql`;

const filepath = path.join(migrationsDir, filename);

fs.writeFileSync(filepath, '-- SQL migration here\n');

console.log(`✅ Migration created: ${filename}`);