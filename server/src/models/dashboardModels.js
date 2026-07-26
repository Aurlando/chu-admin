const prisma = require('../config/prisma');

async function getDashboardStats() {
    // on recupere les 6 groupes (uniquement les fonctionnaires)
    const groupes = await prisma.groupe_fonction.findMany({
        orderBy: { id: 'asc' },
        include: {
            fonction: {
                include: {
                    personnel: {
                        where: {
                            statut: { not: 'Sortie' },
                            type_personnel: 'FONCTIONNAIRE',
                        },
                        select: {
                            id: true,
                            service_id: true,
                        }
                    }
                }
            }
        }
    });

    // tous les benevoles actifs, indépendamment de leur fonction/groupe
    const benevoles = await prisma.personnel.findMany({
        where: {
            statut: { not: 'Sortie' },
            type_personnel: 'BENEVOLE',
        },
        select: {
            id: true,
            service_id: true,
        }
    });

    // on recupere les services
    const services = await prisma.service.findMany({
        orderBy: { libelle: 'asc' },
        select: { id: true, libelle: true }
    });

    const LIBELLE_BENEVOLES = 'Bénévoles';

    // total des personnels dans chu (fonctionnaires + benevoles, PAS les stagiaires)
    let totalGeneral = 0;

    // cards : total personnels dans un groupe pour les 6 groupes (fonctionnaires uniquement)
    const cards = groupes.map(groupe => {
        const personnelsDuGroupe = groupe.fonction.flatMap(f => f.personnel);
        const total = personnelsDuGroupe.length;
        totalGeneral += total;

        return {
            type: 'groupe',
            groupe_id: groupe.id,
            groupe: groupe.libelle,
            total,
        };
    });

    // card dédiée aux bénévoles : ce n'est pas un groupe_fonction, donc pas de groupe_id
    totalGeneral += benevoles.length;
    cards.push({
        type: 'benevoles',
        groupe_id: null,
        groupe: LIBELLE_BENEVOLES,
        total: benevoles.length,
    });

    // on ajoute une card final pour le total des personnels dans le chu
    cards.push({
        type: 'total',
        groupe_id: null,
        groupe: 'Total',
        total: totalGeneral,
    });

    // Construction donnees graphe par service
    const grapheMap = new Map();

    for (const service of services) {
        // initialisation de chaque groupe a 0 (+ le groupe Bénévoles)
        const entry = { service: service.libelle };
        for (const groupe of groupes) {
            entry[groupe.libelle] = 0;
        }
        entry[LIBELLE_BENEVOLES] = 0;
        grapheMap.set(service.id, entry);
    }

    // Comptage des personnels par groupes et par serrvice (fonctionnaires)
    for (const groupe of groupes) {
        const personnelsDuGroupe = groupe.fonction.flatMap(f => f.personnel);
        for (const personnel of personnelsDuGroupe) {
            // on ne compte pas un personnel sans service
            if (personnel.service_id === null) continue;
            const entry = grapheMap.get(personnel.service_id);
            if (entry) {
                // incrementer le groupe pour ce service
                entry[groupe.libelle] = (entry[groupe.libelle] || 0) + 1;
            }
        }
    };

    // Comptage des benevoles par service
    for (const personnel of benevoles) {
        if (personnel.service_id === null) continue;
        const entry = grapheMap.get(personnel.service_id);
        if (entry) {
            entry[LIBELLE_BENEVOLES] = (entry[LIBELLE_BENEVOLES] || 0) + 1;
        }
    }

    // conversion du Map en tableau pour le JSON
    const graphe = Array.from(grapheMap.values());

    return { cards, graphe };
}

async function getRecentAuditLogs({ limit = 5 } = {}) {
    const logs = await prisma.ref_audit_log.findMany({
        orderBy: { created_at: 'desc' },
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
    });

    return logs.map(l => ({
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
    }));
}

module.exports = {
    getDashboardStats,
    getRecentAuditLogs,
}