import Etablissement from "./Etablissement.js";
import AnneeScolaire from "./AnneeScolaire.js";
import Niveau from "./Niveau.js";
import Filiere from "./Filiere.js";
import Classe from "./Classe.js";
import Utilisateur from "./Utilisateur.js";
import EleveApprenant from "./EleveApprenant.js";
import EnseignantFormateur from "./EnseignantFormateur.js";
import Personnel from "./Personnel.js";
import ParentTuteur from "./ParentTuteur.js";
import EstResponsableDe from "./EstResponsableDe.js";

/*
 * ============================================================
 * ASSOCIATIONS - ETABLISSEMENT
 * ============================================================
 */

// Un etablissement peut avoir plusieurs années scolaires.
Etablissement.hasMany(AnneeScolaire, {
    foreignKey: "eta_id",
    sourceKey: "eta_id",
    as: "anneesScolaires",
});

// Une annee scolaire appartient a un etablissement.
AnneeScolaire.belongsTo(Etablissement, {
    foreignKey: "eta_id",
    targetKey: "eta_id",
    as: "etablissement",
});


/*
 * ============================================================
 * ASSOCIATIONS - CLASSE
 * ============================================================
 */

// Un etablissement peut avoir plusieurs classes.
Etablissement.hasMany(Classe, {
    foreignKey: "eta_id",
    sourceKey: "eta_id",
    as: "classes",
});

// Une classe appartient a un etablissement.
Classe.belongsTo(Etablissement, {
    foreignKey: "eta_id",
    targetKey: "eta_id",
    as: "etablissement",
});


// Une annee scolaire peut avoir plusieurs classes.
AnneeScolaire.hasMany(Classe, {
    foreignKey: "code_annee_scolaire",
    sourceKey: "code_annee_scolaire",
    as: "classes",
});

// Une classe appartient a une annee scolaire.
Classe.belongsTo(AnneeScolaire, {
    foreignKey: "code_annee_scolaire",
    targetKey: "code_annee_scolaire",
    as: "anneeScolaire",
});


// Un niveau peut avoir plusieurs classes.
Niveau.hasMany(Classe, {
    foreignKey: "code_niveau",
    sourceKey: "code_niveau",
    as: "classes",
});

// Une classe appartient a un niveau.
Classe.belongsTo(Niveau, {
    foreignKey: "code_niveau",
    targetKey: "code_niveau",
    as: "niveau",
});


// Une filiere peut etre associée a plusieurs classes.
Filiere.hasMany(Classe, {
    foreignKey: "code_filiere",
    sourceKey: "code_filiere",
    as: "classes",
});

// Une classe peut avoir une filiere.
Classe.belongsTo(Filiere, {
    foreignKey: "code_filiere",
    targetKey: "code_filiere",
    as: "filiere",
});

// Utilisateur - eleve
Utilisateur.hasOne(EleveApprenant, {
    foreignKey: "usr_id",
    sourceKey: "usr_id",
    as: "eleve",
});

EleveApprenant.belongsTo(Utilisateur, {
    foreignKey: "usr_id",
    targetKey: "usr_id",
    as: "utilisateur",
});

// Utilisateur - Enseignant
Utilisateur.hasOne(EnseignantFormateur, {
    foreignKey: "usr_id",
    sourceKey: "usr_id",
    as: "enseignant",
});

EnseignantFormateur.belongsTo(Utilisateur, {
    foreignKey: "usr_id",
    targetKey: "usr_id",
    as: "utilisateur",
});

// Utilisateur - Personnel
Utilisateur.hasOne(Personnel, {
    foreignKey: "usr_id",
    sourceKey: "usr_id",
    as: "personnel",
});

Personnel.belongsTo(Utilisateur, {
    foreignKey: "usr_id",
    targetKey: "usr_id",
    as: "utilisateur",
});

// Élève - EstResponsableDe
EleveApprenant.hasMany(EstResponsableDe, {
    foreignKey: "mat_eleve",
    sourceKey: "mat_eleve",
    as: "responsables",
});

EstResponsableDe.belongsTo(EleveApprenant, {
    foreignKey: "mat_eleve",
    targetKey: "mat_eleve",
    as: "eleve",
});

// Parent - EstResponsableDe
ParentTuteur.hasMany(EstResponsableDe, {
    foreignKey: "com_id",
    sourceKey: "com_id",
    as: "eleves",
});

EstResponsableDe.belongsTo(ParentTuteur, {
    foreignKey: "com_id",
    targetKey: "com_id",
    as: "parent",
});


export {
    Etablissement,
    AnneeScolaire,
    Niveau,
    Filiere,
    Classe,
    Utilisateur,
    EleveApprenant,
    EnseignantFormateur,
    Personnel,
    ParentTuteur,
    EstResponsableDe,
};