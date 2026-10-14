import {
    Classe,
    Etablissement,
    AnneeScolaire,
    Niveau,
    Filiere,
    Inscription,
} from "../models/index.js";

export const createClasse = async (data) => {
    const etablissement = await Etablissement.findByPk(data.eta_id);

    if (!etablissement) {
        const error = new Error(
            `Établissement introuvable avec l'identifiant : ${data.eta_id}`
        );
        error.status = 404;
        throw error;
    }

    const anneeScolaire = await AnneeScolaire.findByPk(
        data.code_annee_scolaire
    );

    if (!anneeScolaire) {
        const error = new Error(
            `Année scolaire introuvable : ${data.code_annee_scolaire}`
        );
        error.status = 404;
        throw error;
    }

    const niveau = await Niveau.findByPk(data.code_niveau);

    if (!niveau) {
        const error = new Error(
            `Niveau introuvable : ${data.code_niveau}`
        );
        error.status = 404;
        throw error;
    }

    if (data.code_filiere) {
        const filiere = await Filiere.findByPk(data.code_filiere);

        if (!filiere) {
            const error = new Error(
                `Filière introuvable : ${data.code_filiere}`
            );
            error.status = 404;
            throw error;
        }
    }

    /*
     * Vérification importante :
     * l'année scolaire doit appartenir au même établissement.
     */
    if (anneeScolaire.eta_id !== data.eta_id) {
        const error = new Error(
            "L'année scolaire n'appartient pas à cet établissement."
        );
        error.status = 400;
        throw error;
    }

    try {
        return await Classe.create(data);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            const conflictError = new Error(
                `Une classe avec le code ${data.code_classe} existe déjà.`
            );

            conflictError.status = 409;
            throw conflictError;
        }

        throw error;
    }
};

export const getClasses = async (filters = {}, currentUser) => {

    const where = {};

    if (filters.annee_scolaire) {
        where.code_annee_scolaire = filters.annee_scolaire;
    }

    if (filters.niveau) {
        where.code_niveau = filters.niveau;
    }

    /*
     * Tenant / établissement protection.
     *
     * Direction et personnel peuvent consulter
     * les classes selon leurs droits.
     *
     * Un enseignant est limite a son etablissement.
     */
    if (currentUser?.usr_role === "enseignant") {
        where.eta_id = currentUser.eta_id;
    }

    return await Classe.findAll({
        where,
        order: [["code_classe", "ASC"]],
    });
};

export const getClasseById = async (code_classe, currentUser) => {

    const classe = await Classe.findByPk(code_classe);

    if (!classe) {
        const error = new Error(
            `Classe introuvable : ${code_classe}`
        );

        error.status = 404;
        throw error;
    }

    if (
        currentUser?.usr_role === "enseignant" &&
        classe.eta_id !== currentUser.eta_id
    ) {
        const error = new Error("Accès refusé à cette classe.");

        error.status = 403;
        throw error;
    }

    return classe;
};

export const updateClasse = async (code_classe, data) => {

    const classe = await Classe.findByPk(code_classe);

    if (!classe) {
        const error = new Error(
            `Classe introuvable : ${code_classe}`
        );

        error.status = 404;
        throw error;
    }

    await classe.update(data);

    return classe;
};

export const deleteClasse = async (code_classe) => {

    const classe = await Classe.findByPk(code_classe);

    if (!classe) {
        const error = new Error(
            `Classe introuvable : ${code_classe}`
        );

        error.status = 404;
        throw error;
    }

    await classe.update({
        statut_classe: false,
    });

    return classe;
};

// ============================================================
// EFFECTIF D'UNE CLASSE
// Seules les inscriptions validées comptent dans l'effectif.
// ============================================================

export const getClasseEffectif = async (code_classe) => {
    const classe = await Classe.findByPk(code_classe);

    if (!classe) {
        const error = new Error(
            `Classe introuvable : ${code_classe}`
        );
        error.status = 404;
        throw error;
    }

    const effectif = await Inscription.count({
        where: {
            code_classe: classe.code_classe,
            statut_inscription: "validee",
        },
    });

    // Une capacité NULL signifie qu'aucune limite n'est définie.
    const placesRestantes =
        classe.effectif_max === null
            ? null
            : Math.max(classe.effectif_max - effectif, 0);

    return {
        code_classe: classe.code_classe,
        effectif,
        effectif_max: classe.effectif_max,
        places_restantes: placesRestantes,
    };
};