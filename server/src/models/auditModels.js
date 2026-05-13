const prisma = require('../config/prisma');

/**
 * Récupère tous les logs d'audit avec pagination
 */
async function getAllAuditLogs({ page = 1, limit = 20 } = {}) {
    const [logs, total] = await Promise.all([
        prisma.ref_audit_log.findMany({
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                action: true,
                cible_type: true,
                cible_id: true,
                details: true,
                created_at: true,
                auth_user: {
                    select: {
                        username: true,
                        personnel: {
                            select: {
                                nom: true,
                                prenoms: true,
                            }
                        }
                    }
                }
            }
        }),
        prisma.ref_audit_log.count(),
    ]);

    return {
        data: logs.map(l = ({
            id: l.id,
            action: l.action,
            cible_type: l.cible_type,
            cible_id: l.cible_id,
            details: l.details,
            date: l.created_at,
            utilisateur: {
                username: l.auth_user?.username || 'Système',
                nom_complet: l.auth_user?.personnel 
                    ? `${l.auth_user.personnel.nom} ${l.auth_user.personnel.prenoms}`
                    : 'Administrateur'
            }
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    };
}

module.exports = {
    getAllAuditLogs,
};
