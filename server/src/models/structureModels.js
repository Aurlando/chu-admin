const { group } = require('node:console');
const prisma = require('../config/prisma');
const { totalmem } = require('node:os');

// ------------------------------------------------------------------
// getRecap  →  GET /structure/recap
// Retourne le tableau service × groupe pour affichage + export
// ------------------------------------------------------------------
async function getRecap() {
    // charger les groupes
    const groupes = await prisma.groupe_fonction.findMany({
        orderBy: { id: 'asc' },
        select: { id: true, libelle: true },
    });

    // charger les services actifs
    const services = await prisma.service.findMany({
        orderBy: { libelle: 'asc' },
        select: { id: true, libelle: true },
    });

    // charger les personnels actifs avec leur service_id et leur groupe
    const personnels = await prisma.personnel.findMany({
        where: { statut: { not: 'Sortie'} },
        select: {
            service_id: true,
            fonction: {
                select: {
                    groupe_fonction: {
                        select: { id: true }
                    }
                }
            }
        }
    });

    //  construction d'une Map : service_id → { groupe_id → count }
    const comptages = new Map();
    for (const s of services) {
        const row = {};
        for (const g of groupes) row[g.id] = 0;
        comptages.set(s.id, row);
    }

    // remplissage du comptages en parcourant les personnels
    for (const p of personnels) {
        if (!p.service_id) continue;

        const groupeId = p.fonction?.groupe_fonction?.id;
        if (!groupeId) continue;

        const row = comptages.get(p.service_id);
        if (row) row[groupeId] = (row[groupeId] || 0) + 1;
    }

    // totaux par groupes
    const totaux = {};
    for (const g of groupes) totaux[g.libelle] = 0;
    totaux['TOTAL'] = 0;

    // 
    const lignes = services.map(s => {
        const row = comptages.get(s.id) || {};
        const ligne = { service_id: s.id, service: s.libelle };
        let totalLigne = 0;

        for (const g of groupes) {
            const count = row[g.id] || 0;
            ligne[g.libelle] = count;
            totaux[g.libelle] += count;
            totalLigne += count;
        }

        ligne['TOTAL'] = totalLigne;
        totaux['TOTAL'] += totalLigne;

        return ligne;
    });

    return {
        groupes: groupes, // [{id, libelle}, ...]
        lignes,
        totaux,
    };
}

// ------------------------------------------------------------------
// 
// ------------------------------------------------------------------
async function getDetailServiceGroupe(serviceId, groupeId) {
    // verification service existe
    const service = await prisma.service.findUnique({
        where: { id: BigInt(serviceId) },
        select: { id: true, libelle: true },
    });
    if (!service) return null;

    // verification groupe existe
    const groupe = await prisma.groupe_fonction.findUnique({
        where: { id: parseInt(groupeId, 10) },
        select: { id: true, libelle: true },
    });
    if (!groupe) return null;

    // recuperer les personnels du service d'un groupe : personnel -> fonction -> groupe_fonction
    const personnels = await prisma.personnel.findMany({
        where: {
            service_id: BigInt(serviceId),
            statut: { not: 'Sortie' },
            fonction: { groupe_id: parseInt(groupeId, 10) }
        },
        select: {
            id: true,
            nom: true,
            prenoms: true,
            im: true,
            statut: true,
            fonction: {
                select: { libelle: true }
            }
        },
        orderBy: [
            { fonction: { libelle: 'asc' } },
            { nom: 'asc' }
        ],
    });

    // comptage par fonction
    const comptageParFonction = {};
    for (const p of personnels) {
        const libelle = p.fonction?.libelle || 'Non défini';
        comptageParFonction[libelle] = (comptageParFonction[libelle] || 0) + 1;
    }

    // mise en forme de la liste des personnels
    const liste = personnels.map(p => ({
        id: p.id,
        nom: p.nom,
        prenoms: p.prenoms,
        matricule: p.im,
        fonction: p.fonction?.libelle || null,
        statut: p.statut,
    }));

    return {
        service: service.libelle,
        groupe: groupe.libelle,
        total: personnels.length,
        comptage_par_fonction: comptageParFonction,
        personnels: liste,
    };
}

module.exports = { 
    getRecap,
    getDetailServiceGroupe,
};