const ExcelJS = require('exceljs');
const structureModels = require('../models/structureModels');

async function getRecap(req, res) {
    try {
        const recap = await structureModels.getRecap();
        res.status(200).json({
            message: 'Récapitulatif récupéré avec succès',
            data: recap,
        });
    } catch (error) {
        console.error('[getRecap] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

async function exportRecapExcel(req, res) {
    try {
        const recap = await structureModels.getRecap();
        const { groupes, lignes, totaux } = recap;
        const groupesLibelles = groupes.map(g => g.libelle);

        // creer workbook ExcelJs en memoire
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('recap');

        // Styles reutilisables
        const jauneFond = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
        const grasJaune = { bold: true, color: { argb: 'FF000000' } };
        const grasBlanc = { bold: true };
        const centreH = { horizontal: 'center', vertical: 'middle' };
        const bordure = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        // Nombre total de colonnes
        const nbColonnes = groupes.length + 3;

        // Ligne 1 : Titre centré
        worksheet.mergeCells(1, 1, 1, nbColonnes);
        const titreCell = worksheet.getCell('A1');
        titreCell.value = 'RECAPITULATION RESSOURCES HUMAINES';
        titreCell.font = { bold: true, size: 12 };
        titreCell.alignment = centreH;

        // Ligne 2 : En-têtes des colonnes
        const enTetes = ['N°', 'SERVICE', ...groupesLibelles, 'TOTAL'];
        const ligneEnTete = worksheet.addRow(enTetes);

        ligneEnTete.eachCell((cell) => {
            cell.fill = jauneFond;
            cell.font = grasJaune;
            cell.alignment = centreH;
            cell.border = bordure;
        });

        // Lignes de données
        lignes.forEach((ligne, index) => {
            const rowData = [
                index + 1,
                ligne.service,
                ...groupesLibelles.map(g => ligne[g] || null),
                ligne['TOTAL'],
            ];

            const row = worksheet.addRow(rowData);

            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.border = bordure;
                cell.alignment = centreH;

                if (colNumber === 2) {
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                }
            });
        });

        // Ligne TOTAL
        const totalRow = worksheet.addRow([
            'TOTAL',
            '',
            ...groupesLibelles.map(g => totaux[g] || null),
            totaux['TOTAL'],
        ]);

        const totalRowNum = worksheet.rowCount;
        worksheet.mergeCells(totalRowNum, 1, totalRowNum, 2);

        totalRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.fill = jauneFond;
            cell.font = grasJaune;
            cell.alignment = centreH;
            cell.border = bordure;
        });

        // Largeurs de colonnes
        worksheet.getColumn(1).width = 6;
        worksheet.getColumn(2).width = 45;
        groupesLibelles.forEach((_, i) => {
            worksheet.getColumn(i + 3).width = 14;
        });

        // En-tête du fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=recap_ressources_humaines.xlsx');

        // Envoyer le fichier directement au client
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('[exportRecapExcel] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

async function getDetailServiceGroupe(req, res) {
    const serviceId = req.params.serviceId;
    const groupeId = req.params.groupeId;

    if (!serviceId || !groupeId) {
        return res.status(400).json({ message: 'Service ID et Groupe ID sont requis' });
    }

    try {
        const detail = await structureModels.getDetailServiceGroupe(serviceId, groupeId);

        if (!detail) {
            return res.status(404).json({ message: 'Service ou groupe introuvable' });
        }

        res.status(200).json({
            message: 'Détail récupéré avec succès',
            data:    detail,
        });
    } catch (error) {
        console.error('[getDetailServiceGroupe] Erreur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

module.exports = {
    getRecap,
    exportRecapExcel,
    getDetailServiceGroupe,
};