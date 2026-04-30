const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs');
const validators = require('../validators/staffValidators');


// Calculer l'age à partir de la date de naissance
// Équivalent de DATE_PART('year', AGE(date_naissance))
function calculerAge(date) {
    if (!date) return null;

    const naissance = new Date(date);
    if (isNaN(naissance.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - naissance.getFullYear();
    const moisDiff = today.getMonth() - naissance.getMonth();
    if (moisDiff < 0 || (moisDiff === 0 && today.getDate() < naissance.getDate())) {
        age--;
    }
    return age;
}

// Formater la date de naissance
// Équivalent de TO_CHAR(date_naissance, 'DD/MM/YYYY')
function formaterDate(date) {
    if (!date) return null;

    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const annee = d.getFullYear();

    return `${jour}/${mois}/${annee}`;
}

// ── LISTE DU STAFF ────────────────────────────────────────────────
async function getAllStaff({  search = "", department = "", fonction = "", page = 1, limit = 10, } = {}) {
    // Construction du WHERE dynamique Prisma pour les filtres
    const where = {
        AND: [],
    }

    // Filtre de recherche (nom, prenoms ou matricule)
    if (search) {
        where.AND.push({
            OR: [
                { nom: { contains: search, mode: 'insensitive' } },
                { prenoms: { contains: search, mode: 'insensitive' } },
                { im: { contains: search, mode: 'insensitive' } },
            ]
        })
    }

    // Filtre de departement
    if (department) {
        where.AND.push({
            service: {
                libelle: { equals: department, mode: 'insensitive' }
            }
        })
    }

    // Filtre de fonction
    if (fonction) {
        where.AND.push({
            fonction: {
                libelle: { equals: fonction, mode: 'insensitive' }
            }
        })
    }

    // si aucun filtre on vide le where
    const whereClause = where.AND.length > 0 ? where : {};

    // Execution en parallele : findMany + count
    const [data, total] = await Promise.all([
        prisma.personnel.findMany({
            where: whereClause,
            select: {
                id: true,
                nom: true,
                prenoms: true,
                im: true,
                service: {
                    select: { libelle: true }
                },
                fonction: {
                    select: { libelle: true }
                },
            },
            orderBy: [
                { nom: 'asc' },
                { prenoms: 'asc' },
            ],
            // Pagination : skip = OFFSET, take = LIMIT
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.personnel.count({ where: whereClause }),
    ]);

    const formatedData = data.map(p => ({
        id: p.id,
        nom: p.nom,
        prenoms: p.prenoms,
        matricule: p.im,
        departement: p.service
            ? p.service.libelle.charAt(0).toUpperCase() + p.service.libelle.slice(1).toLowerCase()
            : null,
        service: p.fonction
            ? p.fonction.libelle.charAt(0).toUpperCase() + p.fonction.libelle.slice(1).toLowerCase()
            : null,
    }));

    return {
        data: formatedData,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// ── DROPDOWNS ─────────────────────────────────────────────────────
// Dropdown Department
async function getDistinctDepartments() {
    const services = await prisma.service.findMany({
        select: { id: true, libelle: true },
        orderBy: { libelle: 'asc' },
    });

    return services.map(s => ({
        id: s.id,
        libelle: s.libelle.charAt(0).toUpperCase() + s.libelle.slice(1).toLowerCase(),
    }));
}

// Dropdown Fonction
async function getDistinctFonctions() {
    const fonctions = await prisma.fonction.findMany({
        select: { id: true, libelle: true },
        orderBy: { libelle: 'asc' },
    });

    return fonctions.map(f => ({
        id: f.id,
        libelle: f.libelle.charAt(0).toUpperCase() + f.libelle.slice(1).toLowerCase(),
    }));
};

// ── PROFIL ────────────────────────────────────────────────────────
async function getStaffById(id) {
    const personnel = await prisma.personnel.findUnique({
        where: { id: BigInt(id) },

        include: {
            service: {
                select: { id: true, libelle: true }
            },
            fonction: {
                select: { id: true, libelle: true }
            },
            diplome: {
                orderBy: { est_principal: 'desc' },
                select: {
                    id: true,
                    libelle: true,
                    etablissement: true,
                    annee_obtention: true,
                    est_principal: true,
                },
            },
            grade: {
                select: {
                    id_grade:         true,
                    categorie:        true,
                    classe:           true,
                    echelon:          true,
                    indice:           true,
                    duree_mois:       true,
                    id_grade_suivant: true,
                }
            },
            auth_user: {
                select: {
                    username: true,
                }
            },
        },
    });

    if (!personnel) return null;

    const dateNaissanceFormatee = formaterDate(personnel.date_naissance);
    const dateEntreeAdminFormatee = formaterDate(personnel.annee_entree_admin);
    const age = calculerAge(personnel.date_naissance);
    const anneesExercice = calculerAge(personnel.date_entree_admin);

    // INITCAP sur libelles
    const toInitCap = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : null;

    return {
        id: personnel.id,
        nom: personnel.nom,
        prenoms: personnel.prenoms,
        matricule: personnel.im,
        photo_profil: personnel.photo_profil ? `/uploads/${personnel.photo_profil}` : `/uploads/default-avatar.png`,
        date_naissance: dateNaissanceFormatee,
        age: age,
        // categorie: personnel.categorie,
        // classe: personnel.classe,
        // echelon: personnel.echelon,
        grade_actuel: personnel.grade ? {
            id_grade:         personnel.grade.id_grade,
            categorie:        personnel.grade.categorie,
            classe:           personnel.grade.classe,
            echelon:          personnel.grade.echelon,
            indice:           personnel.grade.indice,
            est_au_maximum:   personnel.grade.id_grade_suivant === null,
        } : null,
        date_entree_admin: dateEntreeAdminFormatee,
        annees_exercice: anneesExercice,
        specialite: personnel.specialite,
        service: toInitCap(personnel.fonction?.libelle),
        fonction_id: personnel.fonction_id,
        telephone: personnel.telephone,
        email: personnel.email,
        departement: toInitCap(personnel.service?.libelle),
        service_id: personnel.service_id,
        statut: validators.formatStatutPourClient(personnel.statut),
        a_acces_sih: personnel.auth_user?.username ?? null,
        username_sih: personnel.auth_user?.username ?? null,
        diplomes: personnel.diplome,
    }
}

// ── AJOUT ─────────────────────────────────────────────────────────
async function addPersonnel({
    nom, prenoms, im, date_naissance,
    id_grade_actuel,
    specialite, telephone, email,
    service_id, fonction_id, statut, photo_profil,
    diplomes = [],
    num_arrete = null,
    donner_acces = false, username, password_hash,
}) {

    const grade = await prisma.grade.findUnique({
        where: { id_grade: parseInt(id_grade_actuel, 10) },
        select: { duree_mois: true, classe: true },
    });

    if (!grade) throw new Error(`Grade introuvable : id_grade_actuel = ${id_grade_actuel}`);

    const dateAujourdhui = new Date();
    const dateProchain = new Date(dateAujourdhui);
    dateProchain.setMonth(dateProchain.getMonth() + grade.duree_mois);

    let type_mouvement;
    if (grade.classe === 'STAGIAIRE') {
        type_mouvement = 'NOMINATION';
    } else {
        type_mouvement = 'INITIALISATION';
    }
    
    return await prisma.$transaction(async (tx) => {

        // INSERT chu.personnel
        const personnel = await tx.personnel.create({
            data: {
                nom, 
                prenoms,
                im,
                date_naissance: new Date(date_naissance),
                id_grade_actuel: parseInt(id_grade_actuel, 10),
                date_entree_admin: dateAujourdhui,
                specialite,
                telephone,
                email,
                service_id: BigInt(service_id),
                fonction_id: fonction_id !== undefined ? fonction_id : null,
                statut,
                photo_profil,
            },
        });

        const personnelId = personnel.id;
        const personnelIm = personnel.im;

        // Insertion dans avancements -> grade initial
        await tx.avancements.create({
            data: {
                id_personnel: personnelId,
                id_grade_obtenu: parseInt(id_grade_actuel, 10),
                num_arrete: num_arrete || '', // facultatif
                date_signature: dateAujourdhui,
                date_effet: dateAujourdhui,
                date_prochain_avancement: dateProchain,
                type_mouvement: type_mouvement,
            },
        });

        // INSERT ref.diplome
        if (diplomes.length > 0) {
            await tx.diplome.createMany({
                data: diplomes.map(d => ({
                    libelle: d.libelle,
                    etablissement: d.etablissement || null,
                    annee_obtention: d.annee_obtention ?? null,
                    est_principal: Boolean(d.est_principal),
                    id_personnel: personnelId,
                })),
            });
        }

        // INSERT ref.auth_user si acces SIH donne
        if (donner_acces && username && password_hash) {
            await tx.auth_user.create({
                data: {
                    username,
                    password_hash,
                    role: 'user',
                    id_personnel: personnelId,
                },
            });
        }

        return { personnelId, personnelIm };
    });
}

// ── UPDATE ────────────────────────────────────────────────────────
async function updatePersonnel({
    id,
    nom, prenoms, date_naissance,
    categorie, classe, echelon,
    specialite, telephone, email,
    service_id, fonction_id, statut,
    photo_profil,
    anciennePhoto,
    diplomes = [],
    donner_acces,
    username, password_hash,
}) {
    await prisma.$transaction(async (tx) => {
        const dataToUpdate = {};

        // ajout des champs non undefined
        if (nom !== undefined) dataToUpdate.nom = nom;
        if (prenoms !== undefined) dataToUpdate.prenoms = prenoms;
        if (date_naissance !== undefined) dataToUpdate.date_naissance = new Date(date_naissance);
        if (categorie !== undefined) dataToUpdate.categorie = categorie;
        if (classe !== undefined) dataToUpdate.classe = classe;
        if (echelon !== undefined) dataToUpdate.echelon = echelon;
        if (specialite !== undefined) dataToUpdate.specialite = specialite;
        if (telephone !== undefined) dataToUpdate.telephone = telephone;
        if (email !== undefined) dataToUpdate.email = email;
        if (service_id !== undefined) dataToUpdate.service_id = BigInt(service_id);
        if (fonction_id !== undefined) dataToUpdate.fonction_id = fonction_id;
        if (statut !== undefined) dataToUpdate.statut = statut;
        if (photo_profil !== undefined) dataToUpdate.photo_profil = photo_profil;

        // UPDATE only si un cham a ete modifie
        if (Object.keys(dataToUpdate).length > 0) {
            await tx.personnel.update({
                where: { id: BigInt(id) },
                data: dataToUpdate,
            });
        }

        // INSERT ou UPDATE
        for (const diplome of diplomes) {
            if (!diplome.libelle) continue;
            if (diplome.id) {
                // UPDATE si a un id
                await tx.diplome.update({
                    where: {
                        id: parseInt(diplome.id, 10),
                    },
                    data: {
                        libelle: diplome.libelle,
                        etablissement: diplome.etablissement || null,
                        annee_obtention: diplome.annee_obtention ?? null,
                        est_principal: Boolean(diplome.est_principal),
                    },
                });
            } else {
                // INSERT si pas d'id
                await tx.diplome.create({
                    data: {
                        libelle: diplome.libelle,
                        etablissement: diplome.etablissement || null,
                        annee_obtention: diplome.annee_obtention ?? null,
                        est_principal: Boolean(diplome.est_principal),
                        id_personnel: BigInt(id),
                    },
                });
            }
        }

        // upsert = INSERT si absent, UPDATE si present
        if (donner_acces && username) {
            if (password_hash !== undefined) {
                // upsert complet si nouveau password
                await tx.auth_user.upsert({
                    where: { id_personnel: BigInt(id) },
                    create: {
                        // si pas de compte -> creer
                        username,
                        password_hash,
                        role: 'user',
                        id_personnel: BigInt(id),
                    },
                    update: {
                        // si compte existe -> update
                        username,
                        password_hash,
                    },
                });
            }
            else {
                // upsert username si pas de nouveau password
                await tx.auth_user.upsert({
                    where: { id_personnel: BigInt(id) },
                    create: {
                        username,
                        password_hash: '',
                        role: 'user',
                        id_personnel: BigInt(id),
                    },
                    update: {
                        username,
                    }
                })
            }
        }
    });

    return { success: true };
}

// Fonction auxiliaire : supprime l'ancienne photo du serveur
function supprimerAnciennePhoto(photo_profil, anciennePhoto) {
    if (photo_profil && anciennePhoto && anciennePhoto !== 'default-avatar.png') {
        const cheminAncien = path.join(__dirname, '..', '..', 'uploads', anciennePhoto);
        try {
            if (fs.existsSync(cheminAncien)) fs.unlinkSync(cheminAncien);
        } catch {
            console.warn(`[supprimerAnciennePhoto] Impossible de supprimer : ${anciennePhoto}`);
        }
    }
}

// ── ARCHIVER UN PERSONNEL (soft delete) ───────────────────────────
async function archiverPersonnel(id) {
    const personnel = await prisma.personnel.findUnique({
        where: { id: BigInt(id) },
        select: { id: true, statut: true },
    });

    if (!personnel) return { found: false };

    if (personnel.statut === 'Sortie') {
        return { found: true, dejaArchive: true };
    }
    
    await prisma.$transaction(async (tx) => {
        // update changer statut et date_sortie
        await tx.personnel.update({
            where: { id: BigInt(id) },
            data: {
                statut: 'Sortie',
                date_sortie: new Date(),
            },
        });

        // Mettre inactif les comptes SIH
        await tx.auth_user.updateMany({
            where: { id_personnel: BigInt(id) },
            data:  { actif: false },
        });
    });

    return { found: true, dejaArchive: false };
}

module.exports = {
    getAllStaff,
    getDistinctDepartments,
    getDistinctFonctions,
    getStaffById,
    addPersonnel,
    updatePersonnel,
    supprimerAnciennePhoto,
    archiverPersonnel,
};
