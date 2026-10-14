import {Inscription,EleveApprenant,Classe,AnneeScolaire,PieceRequise,Necessite,BaremeFrais,FactureEcheance,ParentTuteur,EstResponsableDe} from "../models/index.js";
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
    // 1. Vérifier l'existence de l'élève.
    const eleve = await EleveApprenant.findByPk(data.mat_eleve);

    if (!eleve) {
        const error = new Error(
            `Élève introuvable : ${data.mat_eleve}`
        );
        error.status = 404;
        throw error;
    }

    // 2. Vérifier l'année scolaire.
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

    // 3. Vérifier la classe.
    const classe = await Classe.findByPk(data.code_classe);

    if (!classe) {
        const error = new Error(
            `Classe introuvable : ${data.code_classe}`
        );
        error.status = 404;
        throw error;
    }

    // 4. La classe et le dossier doivent concerner la même année.
    if (
        classe.code_annee_scolaire !== data.code_annee_scolaire
    ) {
        const error = new Error(
            "L'année scolaire de l'inscription ne correspond pas à celle de la classe."
        );
        error.status = 400;
        throw error;
    }

    // 5. Récupérer le catalogue des pièces obligatoires actives.
    const piecesObligatoires = await PieceRequise.findAll({
        where: {
            piece_obligatoire: true,
            piece_statut: "active",
        },
        order: [["piece_id", "ASC"]],
    });

    // 6. Créer le dossier et ses pièces dans une seule transaction.
    try {
        const inscriptionId = await sequelize.transaction(
            async (transaction) => {
                const inscription = await Inscription.create(
                    {
                        ...data,
                        // Le dossier est toujours créé en attente ; seule la validation
                        // métier peut lui attribuer le statut "validee".
                        statut_inscription: "en_attente",
                        fact_id: null,
                    },
                    { transaction }
                );

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

                return inscription.ins_id;
            }
        );

        // La transaction gérée a été validée automatiquement.
        return await getInscriptionById(inscriptionId);
    } catch (error) {
        // La transaction gérée annule automatiquement ses opérations
        // si une erreur est levée dans son callback.
        if (
            error.name === "SequelizeUniqueConstraintError" ||
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

export const getInscriptionById = async (ins_id, currentUser = null) => {
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
                    model: FactureEcheance,
                    as: "facture",
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

    // Un parent ne peut consulter que le dossier d'un élève qui lui est rattaché.
    // Le lien compte utilisateur -> profil parent est stocké dans parent_tuteur.usr_id.
    if (currentUser?.usr_role === "parent") {
        const parent = await ParentTuteur.findOne({
            where: { usr_id: currentUser.usr_id },
        });

        if (!parent) {
            const error = new Error("Aucun profil parent n'est associé à ce compte.");
            error.status = 403;
            throw error;
        }

        const relation = await EstResponsableDe.findOne({
            where: {
                mat_eleve: inscription.mat_eleve,
                com_id: parent.com_id,
            },
        });

        if (!relation) {
            const error = new Error("Vous n'êtes pas autorisé à consulter ce dossier.");
            error.status = 403;
            throw error;
        }
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

// ============================================================
// MACHINE A ETATS DES INSCRIPTIONS
// ============================================================

const INSCRIPTION_TRANSITIONS = {
    en_attente: ["validee", "refusee", "annulee"],
    validee: [],
    refusee: [],
    annulee: [],
};

// ============================================================
// VALIDER UNE INSCRIPTION
// ============================================================

export const validerInscription = async (
    ins_id,
    fin_date_echeance
) => {
    // Trouver le dossier pour savoir wuelle classe est ferme.
    const dossierInitial = await Inscription.findByPk(ins_id);

    if (!dossierInitial) {
        const error = new Error("Inscription introuvable");
        error.status = 404;
        throw error;
    }

    if (!fin_date_echeance) {
        const error = new Error(
            "La date d'échéance est obligatoire"
        );
        error.status = 400;
        throw error;
    }

    // A managed transaction commits on success and rolls back on error.
    return sequelize.transaction(async (transaction) => {
        // 1. Lock the class row FIRST.
        const classe = await Classe.findByPk(
            dossierInitial.code_classe,
            {
                transaction,
                lock: transaction.LOCK.UPDATE,
            }
        );

        if (!classe) {
            const error = new Error("Classe introuvable");
            error.status = 404;
            throw error;
        }

        // 2. Reload and lock the dossier inside the transaction.
        const inscription = await Inscription.findByPk(ins_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!inscription) {
            const error = new Error("Inscription introuvable");
            error.status = 404;
            throw error;
        }

        const transitions =
            INSCRIPTION_TRANSITIONS[
                inscription.statut_inscription
            ] || [];

        if (!transitions.includes("validee")) {
            const error = new Error(
                `Transition interdite : une inscription ${inscription.statut_inscription} ne peut pas être validée`
            );
            error.status = 409;
            throw error;
        }

        // 3. Confirm the due date is later than the registration date.
        if (
            new Date(fin_date_echeance) <=
            new Date(inscription.date_inscription)
        ) {
            const error = new Error(
                "La date d'échéance doit être postérieure à la date d'inscription"
            );
            error.status = 422;
            throw error;
        }

        // 4. Check all active mandatory documents are supplied.
        const piecesObligatoires = await PieceRequise.findAll({
            where: {
                piece_obligatoire: true,
                piece_statut: "active",
            },
            transaction,
        });

        const piecesNecessaires = await Necessite.findAll({
            where: { ins_id },
            transaction,
        });

        const piecesFournies = new Set(
            piecesNecessaires
                .filter((piece) => piece.fournie === true)
                .map((piece) => Number(piece.piece_id))
        );

        const piecesManquantes = piecesObligatoires.filter(
            (piece) =>
                !piecesFournies.has(Number(piece.piece_id))
        );

        if (piecesManquantes.length > 0) {
            const error = new Error(
                "Validation impossible : certaines pièces obligatoires ne sont pas fournies"
            );
            error.status = 422;
            error.data = {
                pieces_manquantes: piecesManquantes.map((piece) => ({
                    piece_id: piece.piece_id,
                    piece_nom: piece.piece_nom,
                })),
            };
            throw error;
        }

        // 5. Count validated dossiers AFTER acquiring the class lock.
        const effectifActuel = await Inscription.count({
            where: {
                code_classe: classe.code_classe,
                statut_inscription: "validee",
            },
            transaction,
        });

        if (
            classe.effectif_max !== null &&
            effectifActuel >= Number(classe.effectif_max)
        ) {
            const error = new Error(
                "La classe est pleine. Aucune place supplémentaire n'est disponible."
            );
            error.status = 409;
            error.data = {
                code_classe: classe.code_classe,
                effectif: effectifActuel,
                effectif_max: Number(classe.effectif_max),
                places_restantes: 0,
            };
            throw error;
        }

        // 6. Find the fee schedule for the class/year.
        const bareme = await BaremeFrais.findOne({
            where: {
                code_annee_scolaire:
                    inscription.code_annee_scolaire,
                code_niveau: classe.code_niveau,
                code_filiere: classe.code_filiere,
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!bareme) {
            const error = new Error(
                "Aucun barème de frais correspondant à l'inscription n'a été trouvé"
            );
            error.status = 422;
            throw error;
        }

        // 7. Create the invoice and validate the dossier atomically.
        const facture = await FactureEcheance.create(
            {
                fin_montant_frais: bareme.montant,
                fin_date_echeance,
                fin_statut: "en_attente",
                mat_eleve: inscription.mat_eleve,
            },
            { transaction }
        );

        await inscription.update(
            {
                fact_id: facture.fact_id,
                statut_inscription: "validee",
            },
            { transaction }
        );

        return {
            inscription: inscription.toJSON(),
            facture: facture.toJSON(),
            effectif: effectifActuel + 1,
            effectif_max: classe.effectif_max,
            places_restantes:
                classe.effectif_max === null
                    ? null
                    : Math.max(
                        Number(classe.effectif_max) -
                            (effectifActuel + 1),
                        0
                    ),
        };
    });
};

// ============================================================
// REFUSER UNE INSCRIPTION
// ============================================================

export const refuserInscription = async (ins_id, motif_refus) => {
    return sequelize.transaction(async (transaction) => {
        const inscription = await Inscription.findByPk(ins_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!inscription) {
            const error = new Error("Inscription introuvable");
            error.status = 404;
            throw error;
        }

        const transitions = INSCRIPTION_TRANSITIONS[inscription.statut_inscription] || [];
        if (!transitions.includes("refusee")) {
            const error = new Error(
                `Transition interdite : une inscription ${inscription.statut_inscription} ne peut pas être refusée`
            );
            error.status = 409;
            throw error;
        }

        await inscription.update({
            statut_inscription: "refusee",
            motif_refus,
        }, { transaction });

        return inscription;
    });
};


// ============================================================
// ANNULER UNE INSCRIPTION
// ============================================================

export const annulerInscription = async (ins_id) => {

    const inscription = await Inscription.findByPk(ins_id);

    if (!inscription) {
        const error = new Error("Inscription introuvable");
        error.statusCode = 404;
        throw error;
    }

    const transitions =
        INSCRIPTION_TRANSITIONS[inscription.statut_inscription] || [];

    if (!transitions.includes("annulee")) {
        const error = new Error(
            `Transition interdite : une inscription ${inscription.statut_inscription} ne peut pas être annulée`
        );

        error.statusCode = 409;
        throw error;
    }

    await inscription.update({
        statut_inscription: "annulee",
    });

    return inscription;
};

/* ============================================================
RÉINSCRIPTION : NOUVEAU DOSSIER, HISTORIQUE CONSERVÉ
============================================================ */
export const reinscrireEleve = async ({
mat_eleve,
code_annee_scolaire,
code_classe,
date_inscription,
}) => {
// 1. Vérifier que l'élève existe.
const eleve = await EleveApprenant.findByPk(mat_eleve);

if (!eleve) {
    const error = new Error(
        `Élève introuvable : ${mat_eleve}`
    );
    error.status = 404;
    throw error;
}

// 2. Vérifier que l'année scolaire cible existe.
const anneeCible = await AnneeScolaire.findByPk(
    code_annee_scolaire
);

if (!anneeCible) {
    const error = new Error(
        `Année scolaire cible introuvable : ${code_annee_scolaire}`
    );
    error.status = 404;
    throw error;
}

// 3. Vérifier qu'aucun dossier n'existe déjà
//    pour cet élève et cette année scolaire.
const dossierCible = await Inscription.findOne({
    where: {
        mat_eleve,
        code_annee_scolaire,
    },
});

if (dossierCible) {
    const error = new Error(
        "L'élève possède déjà un dossier pour cette année scolaire."
    );
    error.status = 409;
    throw error;
}

// 4. Vérifier qu'une inscription précédente existe.
const ancienDossier = await Inscription.findOne({
    where: { mat_eleve },
    order: [
        ["date_inscription", "DESC"],
        ["ins_id", "DESC"],
    ],
});

if (!ancienDossier) {
    const error = new Error(
        "Aucune inscription précédente trouvée pour cet élève. Utilisez la création normale d'inscription."
    );
    error.status = 400;
    throw error;
}

// 5. Créer un nouveau dossier en attente.
//    createInscription() vérifie également la classe et
//    rattache automatiquement les pièces obligatoires actives.
try {
    return await createInscription({
        mat_eleve,
        code_annee_scolaire,
        code_classe,
        date_inscription:
            date_inscription ||
            new Date().toISOString().slice(0, 10),
        statut_inscription: "en_attente",
        fact_id: null,
    });
} catch (error) {
    // Convertir les violations d'unicité en conflit HTTP 409.
    if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.original?.errno === 1062
    ) {
        const conflictError = new Error(
            `Une inscription existe déjà pour l'élève ${mat_eleve} pour l'année scolaire ${code_annee_scolaire}.`
        );
        conflictError.status = 409;
        throw conflictError;
    }

    throw error;
}

};