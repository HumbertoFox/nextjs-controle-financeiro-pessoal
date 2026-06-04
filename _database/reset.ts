import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import 'dotenv/config';
import { rawPool } from '../_lib/db.ts';

const { Pool } = pkg;

const dbName = new URL(process.env.DATABASE_URL!).pathname.slice(1);
const roleName = `${dbName}_backend_role`;

async function dropRoleFromAllDatabases() {
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
        const roleExists = await adminPool.query(`
            SELECT 1
            FROM pg_roles
            WHERE rolname = $1
        `,
            [
                roleName
            ]
        );

        if ((roleExists.rowCount ?? 0) === 0) return;

        // Lista todos os bancos do cluster onde a role ainda tem objetos
        const { rows: databases } = await adminPool.query<{ datname: string }>(`
            SELECT DISTINCT d.datname
            FROM pg_database d
            JOIN pg_shdepend s ON s.dbid = d.oid
            WHERE s.refobjid = (
                SELECT oid
                FROM pg_roles
                WHERE rolname = $1
            )
            AND d.datistemplate = false
        `, [roleName]);

        for (const { datname } of databases) {
            const dbPool = new Pool({
                host: url.hostname,
                port: Number(url.port) || 5432,
                user: url.username,
                password: url.password,
                database: datname,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
            });

            try {
                await dbPool.query(`REVOKE ALL ON SCHEMA public FROM ${roleName}`);
                await dbPool.query(`REASSIGN OWNED BY ${roleName} TO CURRENT_USER`);
                await dbPool.query(`DROP OWNED BY ${roleName}`);
                console.log(`↷ Cleaned "${roleName}" from database "${datname}"`);
            } catch (err) {
                console.warn(`⚠️  Could not clean "${datname}": ${err instanceof Error ? err.message : err}`);
            } finally {
                await dbPool.end();
            }
        }

        await adminPool.query(`DROP ROLE ${roleName}`);
        console.log(`↷ Role "${roleName}" dropped.`);

    } finally {
        await adminPool.end();
    }
}

async function resetDatabase() {
    try {
        console.log('⚠️  Starting database reset...');

        const resetFile = path.join(
            process.cwd(),
            '_database',
            'migrations',
            '000_reset.sql'
        );

        if (!fs.existsSync(resetFile)) {
            throw new Error('Reset file 000_reset.sql not found.');
        }

        const rawSql = fs.readFileSync(resetFile, 'utf8');
        const sql = rawSql.replaceAll('__ROLE_NAME__', roleName);

        await rawPool.query(sql);
        await dropRoleFromAllDatabases();

        console.log('✅ Database reset successfully.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Database reset failed.');
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
    }
}

await resetDatabase();