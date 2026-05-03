const prisma = require('../config/prisma');

function calculerDateProchainAvancement(date_effet, duree_mois) {
    const date = new Date(date_effet);
    date.setMonth(date.getMonth() + duree_mois);
    return date;
}

async function getGradesParCategorie(categorie) {
    return prisma.grade.findMany({
        where: { categorie },
        orderBy: { id_grade: 'asc' },
        select: {
            id_grade: true,
            categorie: true,
            classe: true,
            echelon: true,
            duree_mois: true,
            indice: true,
            id_grade_suivant: true,
        },
    });
}

async function getHistoriqueAvancements(personnelId) {
    return prisma.avancements.findMany({
        where: { id_personnel: BigInt(personnelId) },
        orderBy: { date_effet: 'desc' },
        select: {
            id_avancement: true,
            num_arrete: true,
            date_signature: true,
            date_effet: true,
            date_prochain_avancement: true,
            type_mouvement: true,
            grade: {
                select: {
                    id_grade: true,
                    categorie: true,
                    classe: true,
                    echelon: true,
                    indice: true,
                }
            }
        },
    });
}

async function getAvancementsProches(mois = 3) {
    const dateLimite = new Date();
    dateLimite.setMonth(dateLimite.getMonth() + mois);

    // 1. On interroge la table avancements pour profiter de l'index sur la date
    const avancements = await prisma.avancements.findMany({
        where: {
            date_prochain_avancement: { lte: dateLimite },
            personnel: {
                statut: { not: 'Sortie' },
                grade: { id_grade_suivant: { not: null } }
            }
        },
        select: {
            id_grade_obtenu: true,
            date_prochain_avancement: true,
            personnel: {
                select: {
                    id: true,
                    nom: true,
                    prenoms: true,
                    im: true,
                    id_grade_actuel: true,
                    service: { select: { libelle: true } },
                    grade: {
                        select: {
                            categorie: true,
                            classe: true,
                            echelon: true
                        }
                    }
                }
            }
        },
        orderBy: { date_prochain_avancement: 'asc' }
    });

    // 2. Filtre crucial en mémoire : 
    // On ne garde que l'enregistrement d'avancement qui correspond au grade ACTUEL du personnel.
    // Cela élimine mathématiquement tout l'historique des anciens avancements remontés par la base.
    return avancements
        .filter(a => a.id_grade_obtenu === a.personnel.id_grade_actuel)
        .map(a => {
            const p = a.personnel;
            const dateProchain = new Date(a.date_prochain_avancement);
            return {
                personnel_id: p.id,
                nom: p.nom,
                prenoms: p.prenoms,
                matricule: p.im,
                service: p.service?.libelle || null,
                grade_actuel: `${p.grade.classe} ${p.grade.echelon}ème échelon`,
                categorie: p.grade.categorie,
                date_prochain_avancement: a.date_prochain_avancement,
                jours_restants: Math.ceil((dateProchain - new Date()) / (1000 * 60 * 60 * 24))
            };
        });
}

async function effectuerAvancement({ personnelId, num_arrete, date_signature, date_effet }) {
    const dateEffet  = new Date(date_effet);
    const dateSignature = new Date(date_signature);

    // On englobe toute la logique dans la transaction
    return await prisma.$transaction(async (tx) => {
        const personnel = await tx.personnel.findUnique({
            where: { id: BigInt(personnelId) },
            select: {
                id: true,
                statut: true,
                grade: {
                    select: {
                        id_grade: true,
                        classe: true,
                        echelon: true,
                        id_grade_suivant: true,
                    }
                },
                // Récupération du dernier avancement pour vérifier la chronologie
                avancements: {
                    orderBy: { date_effet: 'desc' },
                    take: 1,
                    select: { date_effet: true }
                }
            },
        });

        if (!personnel) return { found: false };
        if (personnel.statut === 'Sortie') return { found: true, erreur: 'Personnel sorti du service' };
        if (!personnel.grade) return { found: true, erreur: 'Aucun grade actuel défini' };

        const gradeActuel = personnel.grade;

        if (!gradeActuel.id_grade_suivant) {
            return { found: true, erreur: 'Ce personnel est déjà au grade maximum' };
        }

        // 1. GARDE-FOU CHRONOLOGIQUE
        if (personnel.avancements.length > 0) {
            const lastAvancementDate = personnel.avancements[0].date_effet;
            if (dateEffet <= lastAvancementDate) {
                // Formater la date pour le message d'erreur
                const d = lastAvancementDate;
                const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                return { 
                    found: true, 
                    erreur: `La date d'effet doit être strictement postérieure au dernier avancement (${dateStr})` 
                };
            }
        }

        const gradeSuivant = await tx.grade.findUnique({
            where: { id_grade: gradeActuel.id_grade_suivant },
            select: { id_grade: true, categorie: true, classe: true, echelon: true, duree_mois: true, indice: true},
        });

        let type_mouvement;
        if (gradeActuel.classe === 'STAGIAIRE') {
            type_mouvement = 'TITULARISATION';
        } else if (gradeSuivant.classe !== gradeActuel.classe) {
            type_mouvement = 'AVANCEMENT_DE_CLASSE';
        } else {
            type_mouvement = 'AVANCEMENT_DECHELON';
        }

        const dateProchain  = calculerDateProchainAvancement(dateEffet, gradeSuivant.duree_mois);

        // 2. PROTECTION CONTRE LES DOUBLES-CLICS (Optimistic Concurrency Control)
        // On update uniquement SI le grade en base est TOUJOURS le gradeActuel qu'on a lu
        const updateResult = await tx.personnel.updateMany({
            where: { 
                id: BigInt(personnelId),
                id_grade_actuel: gradeActuel.id_grade 
            },
            data: { id_grade_actuel: gradeSuivant.id_grade },
        });

        if (updateResult.count === 0) {
            return { found: true, erreur: 'L\'avancement a déjà été traité (requête simultanée).' };
        }

        await tx.avancements.create({
            data: {
                id_personnel: BigInt(personnelId),
                id_grade_obtenu: gradeSuivant.id_grade,
                num_arrete,
                date_signature: dateSignature,
                date_effet: dateEffet,
                date_prochain_avancement: dateProchain,
                type_mouvement,
            },
        });

        return {
            found: true,
            erreur: null,
            grade_obtenu: gradeSuivant,
            type_mouvement,
            date_prochain_avancement: dateProchain,
        };
    });
}

module.exports = {
    getGradesParCategorie,
    getHistoriqueAvancements,
    getAvancementsProches,
    effectuerAvancement,
}