import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pkg from 'pg';
import 'dotenv/config';
import { rawPool } from '../_lib/db.ts';

const { Pool } = pkg;

const dbName = new URL(process.env.DATABASE_URL!).pathname.slice(1);
const roleName = `${dbName}_backend_role`;

async function ensureDatabase() {
    const url = new URL(process.env.DATABASE_URL!);

    const adminPool = new Pool({
        host: url.hostname,
        port: Number(url.port) || 5432,
        user: url.username,
        password: url.password,
        database: 'postgres',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
    });

    try {
        const { rows } = await adminPool.query(`
            SELECT 1
            FROM pg_database
            WHERE datname = $1
        `,
            [
                dbName
            ]
        );

        if (rows.length === 0) {
            await adminPool.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Database "${dbName}" created.`);
        } else {
            console.log(`ℹ️  Database "${dbName}" already exists.`);
        }
    } finally {
        await adminPool.end();
    }
}

async function migrate() {
    try {
        console.log('🚀 Running database migrations...');

        await ensureDatabase();

        const migrationsDir = path.join(
            process.cwd(),
            '_database',
            'migrations'
        );

        if (!fs.existsSync(migrationsDir)) {
            console.error('❌ Migrations directory not found.');
            process.exit(1);
        }

        await rawPool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename    TEXT PRIMARY KEY,
                executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                hash        TEXT NOT NULL
            );
        `);

        const files = fs
            .readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql') && !file.includes('reset'))
            .sort();

        if (files.length === 0) {
            console.log('⚠️  No migration files found.');
            process.exit(0);
        }

        const { rows } = await rawPool.query(`
            SELECT filename, hash
            FROM schema_migrations
        `);
        const executed = new Map(rows.map(r => [r.filename, r.hash]));

        let executedCount = 0;

        for (const file of files) {
            const filepath = path.join(migrationsDir, file);
            const rawSql = fs.readFileSync(filepath, 'utf8');
            const sql = rawSql.replaceAll('__ROLE_NAME__', roleName);
            const hash = crypto.createHash('sha256').update(rawSql).digest('hex');

            if (executed.has(file)) {
                if (executed.get(file) !== hash) {
                    console.warn(`⚠️  Migration "${file}" was modified after it was applied!`);
                } else {
                    console.log(`↷ Skipping: ${file}`);
                }
                continue;
            }

            console.log(`→ Running: ${file}`);
            await rawPool.query(sql);

            await rawPool.query(`
                INSERT INTO schema_migrations (
                    filename,
                    hash
                )
                VALUES (
                    $1,
                    $2
                )
            `,
                [
                    file,
                    hash
                ]
            );

            executedCount++;
        }

        if (executedCount === 0) {
            console.log('ℹ️  Database is already up to date.');
        } else {
            console.log(`✅ ${executedCount} migration(s) executed successfully.`);
        }

        process.exit(0);

    } catch (err) {
        console.error('❌ Migration failed.');
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
    }
}

await migrate();