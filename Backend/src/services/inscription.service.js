import {Inscription,EleveApprenant,Classe,AnneeScolaire,PieceRequise,Necessite} from "../models/index.js";
import sequelize from "../../config/database.js";

/*
|--------------------------------------------------------------------------
| Création d'une inscription
|--------------------------------------------------------------------------
| le dossier doit être créé avec les pièces obligatoires
| automatiquement rattachées.
|
| Vérifications :
| 1. élève existe
| 2. année scolaire existe
| 3. classe existe
| 4. année de la classe = année de l'inscription
| 5. création de l'inscription
| 6. rattachement des pièces obligatoires
|
*/

export const createInscription = async (data) => {
    const eleve = await EleveApprenant.findByPk(
        data.mat_eleve
    );

    if (!eleve) {
        const error = new Error(
            `Élève introuvable : ${data.mat_eleve}`
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

    const classe = await Classe.findByPk(
        data.code_classe
    );

    if (!classe) {
        const error = new Error(
            `Classe introuvable : ${data.code_classe}`
        );

        error.status = 404;
        throw error;
    }

    /*
     *
     * l'inscription doit appartenir à la même année
     * que la classe choisie.
     */
    if (
        classe.code_annee_scolaire !==
        data.code_annee_scolaire
    ) {
        const error = new Error(
            "L'année scolaire de l'inscription ne correspond pas à l'année scolaire de la classe."
        );

        error.status = 400;
        throw error;
    }

    /*
     * Récupération des pièces obligatoires actives.
     */
    const piecesObligatoires = await PieceRequise.findAll({
        where: {
            piece_obligatoire: true,
            piece_statut: "active",
        },
        order: [["piece_id", "ASC"]],
    });

    const transaction = await sequelize.transaction();

    try {
        const inscription = await Inscription.create(
            data,
            { transaction }
        );

        /*
         * Création automatique des lignes necessite.
         *
         */
        if (piecesObligatoires.length > 0) {
            await Necessite.bulkCreate(
                piecesObligatoires.map((piece) => ({
                    ins_id: inscription.ins_id,
                    piece_id: piece.piece_id,
                    fournie: false,
                    date_depot: null,
                })),
                { transaction }
            );
        }

        await transaction.commit();

        /*
         * Retour avec les pièces associées.
         */
        return await getInscriptionById(
            inscription.ins_id
        );

    } catch (error) {
        await transaction.rollback();

        /*
         * MySQL / Sequelize :
         * double des élèves et années.
         */
        if (
            error.name ===
                "SequelizeUniqueConstraintError" ||
            error.original?.errno === 1062
        ) {
            const conflictError = new Error(
                `Une inscription existe déjà pour l'élève ${data.mat_eleve} pour l'année scolaire ${data.code_annee_scolaire}.`
            );

            conflictError.status = 409;

            throw conflictError;
        }

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Consultation d'une inscription
|--------------------------------------------------------------------------
*/

export const getInscriptionById = async (ins_id) => {
    const inscription = await Inscription.findByPk(
        ins_id,
        {
            include: [
                {
                    model: EleveApprenant,
                    as: "eleve",
                },
                {
                    model: Classe,
                    as: "classe",
                },
                {
                    model: AnneeScolaire,
                    as: "anneeScolaire",
                },
                {
                    model: PieceRequise,
                    as: "pieces",
                    through: {
                        attributes: [
                            "fournie",
                            "date_depot",
                        ],
                    },
                },
            ],
        }
    );

    if (!inscription) {
        const error = new Error(
            `Inscription introuvable : ${ins_id}`
        );

        error.status = 404;
        throw error;
    }

    return inscription;
};


/*
|--------------------------------------------------------------------------
| Liste avec filtres et pagination
|--------------------------------------------------------------------------
*/

export const getInscriptions = async ({
    mat_eleve,
    code_annee_scolaire,
    code_classe,
    statut_inscription,
    page = 1,
    limit = 10,
}) => {
    const where = {};

    if (mat_eleve) {
        where.mat_eleve = mat_eleve;
    }

    if (code_annee_scolaire) {
        where.code_annee_scolaire =
            code_annee_scolaire;
    }

    if (code_classe) {
        where.code_classe = code_classe;
    }

    if (statut_inscription) {
        where.statut_inscription =
            statut_inscription;
    }

    const safePage = Math.max(
        Number(page) || 1,
        1
    );

    const safeLimit = Math.min(
        Math.max(Number(limit) || 10, 1),
        100
    );

    const offset = (safePage - 1) * safeLimit;

    const result = await Inscription.findAndCountAll({
        where,

        include: [
            {
                model: EleveApprenant,
                as: "eleve",
            },
            {
                model: Classe,
                as: "classe",
            },
            {
                model: AnneeScolaire,
                as: "anneeScolaire",
            },
        ],

        order: [["ins_id", "DESC"]],

        limit: safeLimit,
        offset,

        distinct: true,
    });

    return {
        items: result.rows,

        pagination: {
            page: safePage,
            limit: safeLimit,
            total: result.count,
            totalPages: Math.ceil(
                result.count / safeLimit
            ),
        },
    };
};


/*
|--------------------------------------------------------------------------
| Marquer une piece comme fournie
|--------------------------------------------------------------------------
*/

export const markPieceAsFournie = async (
    ins_id,
    piece_id,
    date_depot = null) => {
    const inscription = await Inscription.findByPk(ins_id);

    if (!inscription) {
        const error = new Error(
            `Inscription introuvable : ${ins_id}`
        );

        error.status = 404;
        throw error;
    }

    const piece = await PieceRequise.findByPk(
        piece_id
    );

    if (!piece) {
        const error = new Error(
            `Pièce requise introuvable : ${piece_id}`
        );

        error.status = 404;
        throw error;
    }

    const necessite = await Necessite.findOne({
        where: {
            ins_id,
            piece_id,
        },
    });

    if (!necessite) {
        const error = new Error(
            "Cette pièce n'est pas rattachée à cette inscription."
        );

        error.status = 404;
        throw error;
    }

    await necessite.update({
        fournie: true,
        date_depot: date_depot || new Date(),
    });

    return necessite;
};