const pool = require('../config/db');

async function getDashboardStats() {
    const statsQuery = `
        SELECT
            COUNT(*) AS total_staff,
            COUNT(*) FILTER (WHERE fonction = 'Médecin traitant') AS total_medecin,
            COUNT(*) FILTER (WHERE fonction = 'Sage Femme') AS total_sage_femme,
            COUNT(*) FILTER (WHERE fonction NOT IN ('Médecin traitant', 'Sage Femme')) AS total_admin
        FROM chu.personnel;
    `;

    const distributionQuery = `
        SELECT
            s.code AS code_service,
            COUNT(p.id) AS id_medecin
        FROM ref.service s
        LEFT JOIN chu.personnel p ON s.id = p.service_id
        GROUP BY s.code;    
    `;

    const statsResult = await pool.query(statsQuery);
    const distributionResult = await pool.query(distributionQuery);

    return {
        'summary': statsResult.rows[0] || {},
        'distribution': distributionResult.rows
    };
}

module.exports = {
    getDashboardStats,
}