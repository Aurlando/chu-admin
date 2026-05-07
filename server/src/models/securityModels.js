const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

// Liste des comptes SIH avec les infos du personnel lié
async function getAccounts({ search = '', page = 1, limit = 10 } = {}) {
    const where = search ? {
        OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { personnel: { nom: { contains: search, mode: 'insensitive' } } },
            { personnel: { prenoms: { contains: search, mode: 'insensitive' } } },
        ]
    } : {};

    const [accounts, total] = await Promise.all([
        prisma.auth_user.findMany({
            where,
            select: {
                id: true,
                username: true,
                role: true,
                actif: true,
                personnel: {
                    select: {
                        id: true,
                        nom: true,
                        prenoms: true,
                        im: true,
                        fonction: { select: { libelle: true } },
                        service: { select: { libelle: true } },
                    }
                }
            },
            orderBy: { username: 'asc' },
            skip: (page - 1) * limit, 
            take: limit,
        }),
        prisma.auth_user.count({ where }),
    ]);

    return {
        data: accounts.map(a => ({
            id: a.id,
            username: a.username,
            role: a.role,
            actif: a.actif,
            personnel: a.personnel ? {
                id: a.personnel.id,
                nom: a.personnel.nom,
                prenoms: a.personnel.prenoms,
                matricule: a.personnel.im,
                fonction: a.personnel.fonction?.libelle || null,
                service: a.personnel.service?.libelle || null,
            } : null,
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }
}

// Réinitialise le mot de passe + enregistre dans ref_audit_log
async function resetPassword({ accountId, newPassword, adminId }) {
    // verification que le compte existe
    const account = await prisma.auth_user.findUnique({
        where: { id: BigInt(accountId) },
        select: { id: true, username: true },
    });

    if (!account) return { found: false };

    // Hachage du nouveau mot de passe
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Transaction : update + log ensemble
    await prisma.$transaction(async (tx) => {
        await tx.auth_user.update({
            where: { id: BigInt(accountId) },
            data: { password_hash },
        });

        await tx.ref_audit_log.create({
            data: {
                action: 'RESET_MDP',
                cible_type: 'auth_user',
                cible_id: BigInt(accountId),
                fait_par_id: BigInt(adminId),
                details: {
                    username_cible: account.username,
                },
            },
        });
    });

    return { found: true };
}

// Active/désactive un compte
async function toggleActif({ accountId, adminId }) {
    const account = await prisma.auth_user.findUnique({
        where: { id: BigInt(accountId) },
        select: { id: true, username: true, actif: true },
    });

    if (!account) return { found: false };

    const nouvelEtat = !account.actif;

    await prisma.$transaction(async (tx) => {
        await tx.auth_user.update({
            where: { id: BigInt(accountId) },
            data: { actif: nouvelEtat },
        });

        await tx.ref_audit_log.create({
            data: {
                action: nouvelEtat ? 'ACTIVATION' : 'DESACTIVATION',
                cible_type: 'auth_user',
                cible_id: BigInt(accountId),
                fait_par_id: BigInt(adminId),
                details: {
                    username_cible: account.username,
                    ancien_etat: account.actif,
                    nouvel_etat: nouvelEtat,
                },
            },
        });
    });
    
    return { found: true, actif: nouvelEtat };
}

// Historique de toutes les actions admin
async function getAuditLog({ page = 1, limit = 20 } = {}) {
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
        data: logs.map(l => ({
            id: l.id,
            action: l.action,
            cible_type: l.cible_type,
            cible_id: l.cible_id,
            details: l.details,
            created_at: l.created_at,
            fait_par: {
                username: l.auth_user?.username || null,
                nom: l.auth_user?.personnel?.nom || null,
                prenoms: l.auth_user?.personnel?.prenoms || null,
            },
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }
}

module.exports = {
    getAccounts,
    resetPassword,
    toggleActif,
    getAuditLog,
};
