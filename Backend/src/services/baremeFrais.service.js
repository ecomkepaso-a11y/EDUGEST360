import { AnneeScolaire, BaremeFrais, Filiere, Niveau } from "../models/index.js";

export const createBaremeFrais = async (data) => {
    const annee = await AnneeScolaire.findByPk(data.code_annee_scolaire);
    if (!annee) {
        const error = new Error(`Année scolaire introuvable : ${data.code_annee_scolaire}`);
        error.status = 404;
        throw error;
    }

    const niveau = await Niveau.findByPk(data.code_niveau);
    if (!niveau) {
        const error = new Error(`Niveau introuvable : ${data.code_niveau}`);
        error.status = 404;
        throw error;
    }

    if (data.code_filiere) {
        const filiere = await Filiere.findByPk(data.code_filiere);
        if (!filiere) {
            const error = new Error(`Filière introuvable : ${data.code_filiere}`);
            error.status = 404;
            throw error;
        }
    }

    try {
        return await BaremeFrais.create({
            ...data,
            code_filiere: data.code_filiere ?? null,
        });
    } catch (error) {
        if (
            error.name === "SequelizeUniqueConstraintError" ||
            error.original?.errno === 1062
        ) {
            const conflictError = new Error(
                "Un barème existe déjà pour cette année scolaire, ce niveau et cette filière."
            );
            conflictError.status = 409;
            throw conflictError;
        }
        if (error.name === "SequelizeForeignKeyConstraintError" || error.original?.errno === 1452) {
            const referenceError = new Error("L'année, le niveau ou la filière référencée est invalide.");
            referenceError.status = 400;
            throw referenceError;
        }
        throw error;
    }
};
