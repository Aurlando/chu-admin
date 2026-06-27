const prisma = require('../config/prisma');

/**
 * Récupère les logs d'audit avec pagination, recherche et filtre côté backend.
 * Retourne aussi les stats (counts totaux) via groupBy Prisma.
 *
 * Recherche insensible à la casse via ILIKE sur :
 *   - details->>'description'  (JSON → Prisma ne supporte pas mode insensitive sur JSON)
 *   - username, nom, prenoms   (colonnes scalaires → mode:'insensitive' Prisma)
 *
 * Stratégie : si search est présent, on résout les IDs matchant la description
 * en amont via $queryRaw, puis on fusionne avec les filtres Prisma standards.
 * Si pas de search → 3 requêtes parallèles normales, aucun surcoût.
 */
async function getAllAuditLogs({ page = 1, limit = 20, search = '', type_action = '' } = {}) {

    // ── Pré-résolution des IDs matchant details->>'description' ILIKE
    // Nécessaire car Prisma ne supporte pas mode:'insensitive' sur les champs JSON/JSONB.
    // On cible uniquement la colonne JSON, les autres champs (username, nom, prenoms)
    // sont gérés nativement par Prisma avec mode:'insensitive'.
    let descriptionIds = null;
    if (search) {
        const rows = await prisma.$queryRaw`
            SELECT id
            FROM ref.audit_log
            WHERE details->>'description' ILIKE ${'%' + search + '%'}
        `;
        // Si aucun résultat → tableau vide (le OR Prisma l'ignorera proprement)
        descriptionIds = rows.map(r => r.id);
    }

    // ── Construction du WHERE dynamique (même pattern que staffModels)
    const where = { AND: [] };

    // Filtre par type d'action
    if (type_action) {
        where.AND.push({ action: type_action });
    }

    // Filtre de recherche — insensible à la casse sur tous les champs
    if (search) {
        const orConditions = [
            // Username de l'auteur (colonne scalaire → mode insensitive OK)
            {
                auth_user: {
                    username: { contains: search, mode: 'insensitive' }
                }
            },
            // Nom de l'auteur
            {
                auth_user: {
                    personnel: {
                        nom: { contains: search, mode: 'insensitive' }
                    }
                }
            },
            // Prénoms de l'auteur
            {
                auth_user: {
                    personnel: {
                        prenoms: { contains: search, mode: 'insensitive' }
                    }
                }
            },
        ];

        // Description JSON → IDs pré-résolus en ILIKE, injectés via { id: { in: [...] } }
        // On n'ajoute la condition que si au moins 1 ID a matché (évite IN() vide inutile)
        if (descriptionIds && descriptionIds.length > 0) {
            orConditions.push({ id: { in: descriptionIds } });
        }

        where.AND.push({ OR: orConditions });
    }

    // Si AND est vide (pas de filtre), Prisma attend {} et non { AND: [] }
    const finalWhere = where.AND.length > 0 ? where : {};

    // ── 3 requêtes en parallèle (findMany + count + groupBy stats)
    const [logs, total, statsRaw] = await Promise.all([

        // 1. Logs paginés
        prisma.ref_audit_log.findMany({
            where: finalWhere,
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
                            select: { nom: true, prenoms: true }
                        }
                    }
                }
            }
        }),

        // 2. Total avec les mêmes filtres (pour la pagination)
        prisma.ref_audit_log.count({ where: finalWhere }),

        // 3. COUNT(*) GROUP BY action → stats pour les cards
        prisma.ref_audit_log.groupBy({
            by: ['action'],
            where: finalWhere,
            _count: { action: true },
        }),
    ]);

    // ── Transformer le groupBy en map { ACTION: count }
    const countMap = Object.fromEntries(
        statsRaw.map(r => [r.action, r._count.action])
    );

    const stats = {
        // Ligne 1
        ajouts:               countMap['AJOUT_PERSONNEL']        || 0,
        archivages:           countMap['ARCHIVAGE_PERSONNEL']    || 0,
        avancements:         (countMap['AVANCEMENT_ECHELON']     || 0)
                           + (countMap['PROMOTION_CLASSE']       || 0),
        modifications:        countMap['MODIFICATION_PERSONNEL'] || 0,
        // Ligne 2
        documents:            countMap['GENERATION_DOCUMENT']    || 0,
        comptes:             (countMap['ACTIVATION']             || 0)
                           + (countMap['DESACTIVATION']          || 0),
        reinitialisations_mdp: countMap['RESET_MDP']             || 0,
    };

    return {
        data: logs.map(l => ({
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
        },
        stats,
    };
}

module.exports = { getAllAuditLogs };