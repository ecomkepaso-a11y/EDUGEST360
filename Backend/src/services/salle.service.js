import { Salle, Etablissement } from "../models/index.js";

/*
 *  - compte rattaché à un établissement : il ne peut agir QUE sur celui-ci ;
 *  - compte sans établissement : eta_id doit être fourni explicitement.
 */
const resolveEtaId = (currentUser, requestedEtaId) => {
    if (currentUser?.eta_id) {
        if (requestedEtaId && requestedEtaId !== currentUser.eta_id) {
            const error = new Error("Accès refusé : vous ne pouvez gérer que les salles de votre établissement.");
            error.status = 403;
            throw error;
        }
        return currentUser.eta_id;
    }

    if (!requestedEtaId) {
        const error = new Error("Le champ eta_id est obligatoire pour ce compte.");
        error.status = 400;
        throw error;
    }

    return requestedEtaId;
};

const assertEtablissementExists = async (eta_id) => {
    const etablissement = await Etablissement.findByPk(eta_id);

    if (!etablissement) {
        const error = new Error(`Établissement introuvable : ${eta_id}`);
        error.status = 404;
        throw error;
    }
};

const isDuplicate = (error) =>
    error.name === "SequelizeUniqueConstraintError" || error.original?.errno === 1062;

const throwNomDejaPris = (nom) => {
    const error = new Error(`Une salle nommée « ${nom} » existe déjà dans cet établissement.`);
    error.status = 409;
    throw error;
};

export const createSalle = async (data, currentUser) => {
    const eta_id = resolveEtaId(currentUser, data.eta_id);
    await assertEtablissementExists(eta_id);

    try {
        return await Salle.create({
            salle_nom: data.salle_nom,
            capacite: data.capacite ?? null,
            eta_id,
        });
    } catch (error) {
        if (isDuplicate(error)) throwNomDejaPris(data.salle_nom);
        throw error;
    }
};

export const getSalles = async (query, currentUser) => {
    const eta_id = resolveEtaId(currentUser, query.eta_id);
    await assertEtablissementExists(eta_id);

    return Salle.findAll({
        where: { eta_id },
        order: [["salle_nom", "ASC"]],
    });
};

export const updateSalle = async (salle_id, data, currentUser) => {
    const salle = await Salle.findByPk(salle_id);

    if (!salle) {
        const error = new Error(`Salle introuvable : ${salle_id}`);
        error.status = 404;
        throw error;
    }

    if (currentUser?.eta_id && salle.eta_id !== currentUser.eta_id) {
        const error = new Error("Accès refusé : cette salle appartient à un autre établissement.");
        error.status = 403;
        throw error;
    }

    try {
        await salle.update(data);
        return salle;
    } catch (error) {
        if (isDuplicate(error)) throwNomDejaPris(data.salle_nom);
        throw error;
    }
};