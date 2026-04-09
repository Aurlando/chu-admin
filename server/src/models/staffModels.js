const pool = require("../config/db");

// ── LISTE DU STAFF ────────────────────────────────────────────────
async function getAllStaff({
    search = "",
    department = "",
    fonction = "",
    page = 1,
    limit = 10,
} = {}) {
    // -- PARAMÈTRES DE PAGINATION ----------------------------------
    const offset = (page - 1) * limit; // ligne 1 de la page N = (N-1) * taille_page

    // -- CONSTRUCTION DYNAMIQUE DE LA REQUÊTE ----------------------
    const conditions = []; // ["m.nom ILIKE $1", "s.libelle = $2"]
    const params = []; // ["%rakoto%", "Chirurgie"]

    if (search) {
        params.push(`%${search}%`);
        const idx = params.length;
        conditions.push(`(
            p.nom     ILIKE $${idx} OR
            p.prenoms ILIKE $${idx} OR
            CAST(p.im AS TEXT) ILIKE $${idx}
        )`);
    }

    if (department) {
        params.push(department);
        conditions.push(`LOWER(s.libelle) = LOWER($${params.length})`);
    }

    if (fonction) {
        params.push(fonction);
        conditions.push(`LOWER(f.libelle) = LOWER($${params.length})`);
    }

    const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // -- REQUÊTE PRINCIPALE (avec pagination) ----------------------
    params.push(limit); // $N   → nb lignes à retourner
    params.push(offset); // $N+1 → nb lignes à sauter
    const limitIdx = params.length - 1; // index du $limit  dans params
    const offsetIdx = params.length; // index du $offset dans params

    const staffsQuery = `
        SELECT
            p.id,
            p.nom,
            p.prenoms,
            p.im               AS matricule,
            INITCAP(s.libelle) AS departement,
            INITCAP(f.libelle) AS service
        FROM chu.personnel p
        LEFT JOIN ref.service s ON s.id = p.service_id
        LEFT JOIN ref.fonction f ON f.id = p.fonction_id
        ${whereClause}
        ORDER BY p.nom ASC, p.prenoms ASC
        LIMIT  $${limitIdx}
        OFFSET $${offsetIdx}
    `;

    // -- REQUÊTE DE COMPTAGE (pour calculer le total de pages) ------
    const countParams = params.slice(0, params.length - 2); // retire les 2 derniers (limit, offset)
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM chu.personnel p
        LEFT JOIN ref.service s ON s.id = p.service_id
        LEFT JOIN ref.fonction f ON f.id = p.fonction_id
        ${whereClause}
    `;

    // -- EXÉCUTION EN PARALLÈLE ------------------------------------
    // Promise.all([...]) lance les deux requêtes EN MÊME TEMPS
    const [staffResult, countResult] = await Promise.all([
        pool.query(staffsQuery, params),
        pool.query(countQuery, countParams),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
        data: staffResult.rows,
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
    };
}

// ── DROPDOWNS ─────────────────────────────────────────────────────
// Dropdown Department
async function getDistinctDepartments() {
    const result = await pool.query(`
        SELECT id, INITCAP(libelle) AS libelle
        FROM ref.service
        ORDER BY libelle ASC
    `);
    return result.rows;
}

// Dropdown Fonction
async function getDistinctFonctions() {
    const result = await pool.query(`
        SELECT id, INITCAP(libelle) AS libelle
        FROM ref.fonction
        ORDER BY libelle ASC
    `);
    return result.rows;
}

// ── PROFIL ────────────────────────────────────────────────────────
async function getStaffById(id) {
    const query = `
        SELECT
            p.id,
            p.nom,
            p.prenoms,
            p.im AS matricule,
            CONCAT('/uploads/', p.photo_profil) AS photo_profil,

            TO_CHAR(p.date_naissance, 'DD/MM/YYYY') AS date_naissance,
            CAST(DATE_PART('year', AGE(p.date_naissance)) AS INT) AS age,
            
            p.categorie, 
            p.classe, 
            p.echelon,

            
            TO_CHAR(p.date_entree_admin, 'DD/MM/YYYY') AS date_entree_admin,
            CAST(DATE_PART('year', AGE(CURRENT_DATE, p.date_entree_admin)) AS INT) AS annees_exercice,
            
            p.specialite,
            INITCAP(f.libelle) AS service,
            p.telephone,
            p.email,
            INITCAP(s.libelle) AS departement,
            p.statut,
            
            COALESCE(
                (
                    SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id',              d.id,
                            'libelle',         d.libelle,
                            'etablissement',   d.etablissement,
                            'annee_obtention', d.annee_obtention,
                            'est_principal',   d.est_principal
                        )
                        ORDER BY d.est_principal DESC    
                    )
                    FROM ref.diplome d   
                    WHERE p.id = d.id_personnel 
                ), '[]'::json
            ) AS diplomes

        FROM chu.personnel p
        LEFT JOIN ref.service s ON s.id = p.service_id
        LEFT JOIN ref.fonction f ON f.id = p.fonction_id
        WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
}
/*  -- JSON_AGG() agrège plusieurs lignes en un tableau JSON
    -- JSON_BUILD_OBJECT() construit un objet JSON clé/valeur
    -- COALESCE(..., '[]'::json) : si le personnel n'a AUCUN diplôme,
    JSON_AGG retourne NULL — on le remplace par un tableau JSON vide []
    pour que le front reçoive toujours un tableau (jamais null)
*/

// ── AJOUT ─────────────────────────────────────────────────────────
async function addPersonnel({
    nom,
    prenoms,
    im,
    date_naissance,
    categorie,
    classe,
    echelon,
    specialite,
    telephone,
    email,
    service_id,
    fonction_id,
    statut,
    photo_profil,
    diplomes = [],
    donner_acces = false,
    username,
    password_hash,
}) {
    const client = await pool.connect(); // reserver une connexion du pool permettant de faire plusieurs requetes dans la même transaction, avy eo BEGIN-COMMIT-ROLLBACK

    try {
        await client.query("BEGIN"); // debut de la transaction

        const personnelResult = await client.query(
            `INSERT INTO chu.personnel (
                nom, prenoms, im, date_naissance, 
                categorie, classe, echelon,
                date_entree_admin,
                specialite, telephone, email,
                service_id, fonction_id, statut, photo_profil
            ) 
            VALUES (
                $1, $2, $3, $4,
                $5, $6, $7,
                CURRENT_DATE,
                $8, $9, $10,
                $11, $12, $13, $14
            )
            RETURNING id, im`,
            [
                nom,
                prenoms,
                im,
                date_naissance,
                categorie,
                classe,
                echelon,
                specialite,
                telephone,
                email,
                service_id,
                fonction_id,
                statut,
                photo_profil,
            ],
        );

        const { id: personnelId, im: personnelIm } = personnelResult.rows[0]; // prends id et im du RETURNING et on renomme avec personnelId et personnelIm

        for (const diplome of diplomes) {
            // Respect des types et des champs optionnels pour éviter les erreurs SQL
            const anneeObtention = Number.isFinite(
                Number(diplome.annee_obtention),
            ) ? Number(diplome.annee_obtention) : null;

            await client.query(
                `INSERT INTO ref.diplome (
                    libelle, etablissement, annee_obtention, est_principal, id_personnel
                )
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    diplome.libelle,
                    diplome.etablissement || null,
                    anneeObtention,
                    Boolean(diplome.est_principal),
                    personnelId,
                ],
            );
        }

        // MBOLA MILA JERENA LE ROLE io
        if (donner_acces) {
            await client.query(
                `INSERT INTO ref.auth_user (username, password_hash, role, id_personnel)
                 VALUES ($1, $2, 'user', $3)`,
                [username, password_hash, personnelId],
            );
        }


        await client.query("COMMIT"); // validation des transactions si aucune erreur

        return { personnelId, personnelIm };
    } catch (error) {
        await client.query("ROLLBACK"); // annulation de toutes les requetes si une erreur survient
        throw error; // relance l'erreur pour que le controller la gère
    } finally {
        client.release(); // toujours libérer la connexion, que la transaction réussisse ou échoue
    }
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
    const client = await pool.connect();
    const fs   = require("fs");
    const path = require("path");

    try {
        await client.query("BEGIN");

        // ── SET dynamique pour chu.personnel ──────────────────────
        const setClauses = [];
        const setParams  = [];

        // Helper pour construire les clauses SET de manière dynamique
        const ajouter = (colonne, valeur) => {
            if (valeur !== undefined) {
                setParams.push(valeur);
                setClauses.push(`${colonne} = $${setParams.length}`);
            }
        };

        ajouter("nom", nom);
        ajouter("prenoms", prenoms);
        ajouter("date_naissance", date_naissance);
        ajouter("categorie", categorie);
        ajouter("classe", classe);
        ajouter("echelon", echelon);
        ajouter("specialite", specialite);
        ajouter("telephone", telephone);
        ajouter("email", email);
        ajouter("service_id", service_id);
        ajouter("fonction_id", fonction_id);
        ajouter("statut", statut);
        ajouter("photo_profil", photo_profil);

        if (setClauses.length > 0) {
            setParams.push(id); // WHERE id = $N (dernier paramètre)
            await client.query(
                `UPDATE chu.personnel SET ${setClauses.join(", ")} WHERE id = $${setParams.length}`,
                setParams,
            );
        }

        // ── Diplômes : INSERT ou UPDATE ───────────────────────────
        for(const diplome of diplomes) {
            const anneeObtention = Number.isFinite(Number(diplome.annee_obtention)) ? Number(diplome.annee_obtention) :null;
            const libelle = diplome.libelle?.toString().trim() || "";
            const etablissement = diplome.etablissement?.toString().trim() || null;
            const estPrincipal = Boolean(diplome.est_principal);

            if(!libelle) continue;

            if(diplome.id) {
                await client.query(
                    `UPDATE ref.diplome
                     SET libelle = $1, etablissement = $2,
                         annee_obtention = $3, est_principal = $4
                     WHERE id = $5 AND id_personnel = $6`,
                    [libelle, etablissement, anneeObtention, estPrincipal, diplome.id, id],
                );
            } else {
                await client.query(
                    `INSERT INTO ref.diplome (libelle, etablissement, annee_obtention, est_principal, id_personnel)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [libelle, etablissement, anneeObtention, estPrincipal, id],
                );
            }
        }

        // ── Accès SIH : upsert ────────────────────────────────────
        if(donner_acces && username) {
            if (password_hash !== undefined) {
                await client.query(
                    `INSERT INTO ref.auth_user (username, password_hash, role, id_personnel)
                     VALUES ($1, $2, 'user', $3)
                     ON CONFLICT (id_personnel) DO UPDATE SET
                         username      = EXCLUDED.username,
                         password_hash = EXCLUDED.password_hash`,
                    [username, password_hash, id],
                );
            } else {
                await client.query(
                    `INSERT INTO ref.auth_user (username, password_hash, role, id_personnel)
                     VALUES ($1, '', 'user', $2)
                     ON CONFLICT (id_personnel) DO UPDATE SET
                         username = EXCLUDED.username`,
                        [username, id],
                );
            }
        }

        await client.query("COMMIT");

        // ── Suppression ancienne photo APRÈS le COMMIT ────────────
        if (photo_profil && anciennePhoto && anciennePhoto !== "default-avatar.png") {
            const cheminAncien = path.join(__dirname, "..", "..", "uploads", anciennePhoto);
            try {
                if (fs.existsSync(cheminAncien)) fs.unlinkSync(cheminAncien);
            } catch {
                console.warn(`[updatePersonnel] Impossible de supprimer : ${anciennePhoto}`);
            }
        }

        return { success: true };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getAllStaff,
    getDistinctDepartments,
    getDistinctFonctions,
    getStaffById,
    addPersonnel,
    updatePersonnel,
};
