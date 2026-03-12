const pool = require('../config/db');

async function getAllStaff({ search = '', department = '', fonction = '', page = 1, limit = 10 } = {}) {

    // -- PARAMÈTRES DE PAGINATION ----------------------------------
    const offset = (page - 1) * limit;    // ligne 1 de la page N = (N-1) * taille_page

    // -- CONSTRUCTION DYNAMIQUE DE LA REQUÊTE ----------------------
    const conditions = [];   // ["m.nom ILIKE $1", "s.libelle = $2"]
    const params = [];       // ["%rakoto%", "Chirurgie"]

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
        params.push(`%${fonction}%`);
        conditions.push(`p.fonction ILIKE $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // -- REQUÊTE PRINCIPALE (avec pagination) ----------------------
    params.push(limit);                       // $N   → nb lignes à retourner
    params.push(offset);                      // $N+1 → nb lignes à sauter
    const limitIdx  = params.length - 1;      // index du $limit  dans params
    const offsetIdx = params.length;          // index du $offset dans params

    const staffsQuery = `
        SELECT
            p.id,
            p.nom,
            p.prenoms,
            p.im               AS matricule,
            INITCAP(s.libelle) AS departement,
            p.fonction         AS service
        FROM chu.personnel p
        LEFT JOIN ref.service s ON s.id = p.service_id
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
        ${whereClause}
    `;

    // -- EXÉCUTION EN PARALLÈLE ------------------------------------
    // Promise.all([...]) lance les deux requêtes EN MÊME TEMPS
    const [staffResult, countResult] = await Promise.all([
        pool.query(staffsQuery, params),
        pool.query(countQuery,  countParams)
    ]);

    const total      = parseInt(countResult.rows[0].total, 10); 
    const totalPages = Math.ceil(total / limit);                

    return {
        data:       staffResult.rows, 
        pagination: {
            total,         
            page,           
            limit,          
            totalPages,     
        }
    };
}

// ------------------------------------------------------------------
//  pour alimenter le dropdown "Department"
// ------------------------------------------------------------------
async function getDistinctDepartments() {
    const result = await pool.query(`
        SELECT DISTINCT INITCAP(s.libelle) AS departement
        FROM ref.service s
        ORDER BY departement ASC
    `);
    return result.rows.map(r => r.departement); // retourne un tableau de strings
}

// ------------------------------------------------------------------
//  pour alimenter le dropdown "Service" du mockup
// ------------------------------------------------------------------
async function getDistinctFonctions() {
    const result = await pool.query(`
        SELECT DISTINCT p.fonction AS job_title
        FROM chu.personnel p
        WHERE p.fonction IS NOT NULL
        ORDER BY job_title ASC
    `);
    return result.rows.map(r => r.job_title);
}

// ------------------------------------------------------------------
//  page profil d'un personnel
// ------------------------------------------------------------------
async function getStaffById(id) {
    const query = `
        SELECT
            p.id,
            p.nom,
            p.prenoms,
            p.im AS matricule,
            TO_CHAR(p.date_naissance, 'DD/MM/YYYY') AS date_naissance,
            CAST(DATE_PART('year', AGE(p.date_naissance)) AS INT) AS age,
            p.diplome,
            p.categorie, 
            p.classe, 
            p.echelon,
            TO_CHAR(p.date_entree_admin, 'DD/MM/YYYY') AS date_entree_admin,
            CAST(DATE_PART('year', AGE(CURRENT_DATE, p.date_entree_admin)) AS INT) AS annees_exercice,
            p.specialite,
            p.fonction AS service,
            COALESCE(p.autres_diplomes, 'Aucun') AS autres_diplomes,
            p.telephone,
            p.email,
            INITCAP(s.libelle) AS departement,
            p.statut,
            CONCAT('/uploads/', p.photo_profil) AS photo_profil
        FROM chu.personnel p
        LEFT JOIN ref.service s ON s.id = p.service_id
        WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
}

module.exports = {
    getAllStaff,
    getDistinctDepartments,
    getDistinctFonctions,
    getStaffById,
};
