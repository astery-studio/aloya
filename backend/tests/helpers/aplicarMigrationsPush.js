import { readFileSync } from 'node:fs';

export function aplicarMigrationsPush(banco) {
    for (const migration of [
        '20261125230000_preferencias_notificacao_eventos',
        '20261125231000_identificar_eventos_notificacao',
        '20261126090000_entrega_push'
    ]) {
        const arquivo = new URL(
            `../../prisma/migrations/${migration}/migration.sql`,
            import.meta.url
        );
        banco.exec(readFileSync(arquivo, 'utf8'));
    }
}
