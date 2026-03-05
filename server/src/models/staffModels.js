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
            m.nom     ILIKE $${idx} OR
            m.prenoms ILIKE $${idx} OR
            CAST(m.im AS TEXT) ILIKE $${idx}
        )`);
    }

    if (department) {
        params.push(department);
        conditions.push(`LOWER(s.libelle) = LOWER($${params.length})`);
    }

    if (fonction) {
        params.push(`%${fonction}%`);
        conditions.push(`m.fonction ILIKE $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // -- REQUÊTE PRINCIPALE (avec pagination) ----------------------
    params.push(limit);                       // $N   → nb lignes à retourner
    params.push(offset);                      // $N+1 → nb lignes à sauter
    const limitIdx  = params.length - 1;      // index du $limit  dans params
    const offsetIdx = params.length;          // index du $offset dans params

    const staffsQuery = `
        SELECT
            m.nom,
            m.prenoms,
            m.im               AS matricule,
            INITCAP(s.libelle) AS departement,
            m.fonction         AS service
            -- INITCAP() transforme "CHIRURGIE" → "Chirurgie" (capital case)
            -- m.fonction est renommé "service" pour correspondre au mockup
            -- AS renomme la colonne dans le résultat JSON renvoyé au front
        FROM chu.medecin_traitant m
        LEFT JOIN ref.service s ON s.id = m.service_id
        -- LEFT JOIN : garde les médecins même si service_id ne correspond à rien
        ${whereClause}
        ORDER BY m.nom ASC, m.prenoms ASC
        -- Tri alphabétique stable pour que la pagination soit cohérente
        LIMIT  $${limitIdx}
        OFFSET $${offsetIdx}
    `;

    // -- REQUÊTE DE COMPTAGE (pour calculer le total de pages) ------  
    const countParams = params.slice(0, params.length - 2); // retire les 2 derniers (limit, offset)
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM chu.medecin_traitant m
        LEFT JOIN ref.service s ON s.id = m.service_id
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
        SELECT DISTINCT m.fonction AS job_title
        FROM chu.medecin_traitant m
        WHERE m.fonction IS NOT NULL
        ORDER BY job_title ASC
    `);
    return result.rows.map(r => r.job_title);
}

module.exports = {
    getAllStaff,
    getDistinctDepartments,
    getDistinctFonctions,
};
