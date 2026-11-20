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
import Necessite from "./Necessite.js";
import BaremeFrais from "./BaremeFrais.js";
import PieceRequise from "./PieceRequise.js";
import Inscription from "./Inscription.js";
import FactureEcheance from "./FactureEcheance.js";
import Salle from "./Salle.js";
import Matiere from "./Matiere.js";
import Enseign from "./Enseign.js";
import CreneauPlanning from "./CreneauPlanning.js";
import Conge from "./Conge.js";


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

/*
 * ============================================================
 * ASSOCIATIONS - INSCRIPTION
 * ============================================================
 */

// Un élève peut avoir plusieurs inscriptions.
EleveApprenant.hasMany(Inscription, {
    foreignKey: "mat_eleve",
    sourceKey: "mat_eleve",
    as: "inscriptions",
});

// Une inscription appartient à un élève.
Inscription.belongsTo(EleveApprenant, {
    foreignKey: "mat_eleve",
    targetKey: "mat_eleve",
    as: "eleve",
});


// Une année scolaire peut avoir plusieurs inscriptions.
AnneeScolaire.hasMany(Inscription, {
    foreignKey: "code_annee_scolaire",
    sourceKey: "code_annee_scolaire",
    as: "inscriptions",
});

// Une inscription appartient à une année scolaire.
Inscription.belongsTo(AnneeScolaire, {
    foreignKey: "code_annee_scolaire",
    targetKey: "code_annee_scolaire",
    as: "anneeScolaire",
});


// Une classe peut avoir plusieurs inscriptions.
Classe.hasMany(Inscription, {
    foreignKey: "code_classe",
    sourceKey: "code_classe",
    as: "inscriptions",
});

// Une inscription appartient à une classe.
Inscription.belongsTo(Classe, {
    foreignKey: "code_classe",
    targetKey: "code_classe",
    as: "classe",
});


/*
 * ============================================================
 * ASSOCIATIONS - PIECES REQUISES
 * ============================================================
 */

// Une inscription possède plusieurs pièces requises
// via la table de liaison necessite.
Inscription.belongsToMany(PieceRequise, {
    through: Necessite,
    foreignKey: "ins_id",
    otherKey: "piece_id",
    as: "pieces",
});

// Une pièce peut être requise pour plusieurs inscriptions.
PieceRequise.belongsToMany(Inscription, {
    through: Necessite,
    foreignKey: "piece_id",
    otherKey: "ins_id",
    as: "inscriptions",
});

// ============================================================
// INSCRIPTION - FACTURE ECHEANCE
// ============================================================

// Une inscription peut avoir une facture d'échéance.
Inscription.belongsTo(FactureEcheance, {
    foreignKey: "fact_id",
    targetKey: "fact_id",
    as: "facture",
});

// Une facture est rattachée à une inscription via fact_id.
FactureEcheance.hasOne(Inscription, {
    foreignKey: "fact_id",
    sourceKey: "fact_id",
    as: "inscription",
});

/*
 * ============================================================
 * ASSOCIATIONS - UTILISATEUR
 * ============================================================
 */

// Un compte utilisateur parent peut être relié à son profil parent/tuteur.
Utilisateur.hasOne(ParentTuteur, {
    foreignKey: "usr_id",
    sourceKey: "usr_id",
    as: "profilParent",
});

ParentTuteur.belongsTo(Utilisateur, {
    foreignKey: "usr_id",
    targetKey: "usr_id",
    as: "utilisateur",
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

/*
 * ============================================================
 * ASSOCIATIONS - ELEVE
 * ============================================================
 */

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

/*
 * ============================================================
 * ASSOCIATIONS - PLANNING 
 * ============================================================
 */

// Un etablissement possede plusieurs salles ; une salle appartient a un seul etablissement.
Etablissement.hasMany(Salle, {
    foreignKey: "eta_id",
    sourceKey: "eta_id",
    as: "salles",
});

Salle.belongsTo(Etablissement, {
    foreignKey: "eta_id",
    targetKey: "eta_id",
    as: "etablissement",
});

// Habilitations : matiere / enseignant via la table enseign.
Matiere.belongsToMany(EnseignantFormateur, {
    through: Enseign,
    foreignKey: "matiere_id",
    otherKey: "enseignant_id",
    as: "enseignants",
});

EnseignantFormateur.belongsToMany(Matiere, {
    through: Enseign,
    foreignKey: "enseignant_id",
    otherKey: "matiere_id",
    as: "matieres",
});

// Un creneau relie une classe, une matiere, un enseignant et une salle (RG-PLAN-01).
Classe.hasMany(CreneauPlanning, { foreignKey: "code_classe", sourceKey: "code_classe", as: "creneaux" });
CreneauPlanning.belongsTo(Classe, { foreignKey: "code_classe", targetKey: "code_classe", as: "classe" });

Matiere.hasMany(CreneauPlanning, { foreignKey: "matiere_id", sourceKey: "matiere_id", as: "creneaux" });
CreneauPlanning.belongsTo(Matiere, { foreignKey: "matiere_id", targetKey: "matiere_id", as: "matiere" });

EnseignantFormateur.hasMany(CreneauPlanning, { foreignKey: "enseignant_id", sourceKey: "enseignant_id", as: "creneaux" });
CreneauPlanning.belongsTo(EnseignantFormateur, { foreignKey: "enseignant_id", targetKey: "enseignant_id", as: "enseignant" });

Salle.hasMany(CreneauPlanning, { foreignKey: "salle_id", sourceKey: "salle_id", as: "creneaux" });
CreneauPlanning.belongsTo(Salle, { foreignKey: "salle_id", targetKey: "salle_id", as: "salle" });

Utilisateur.hasMany(Conge, { foreignKey: "usr_id", sourceKey: "usr_id", as: "conges" });
Conge.belongsTo(Utilisateur, { foreignKey: "usr_id", targetKey: "usr_id", as: "utilisateur" });

Personnel.hasMany(Conge, { foreignKey: "rh_id", sourceKey: "rh_id", as: "conges" });
Conge.belongsTo(Personnel, { foreignKey: "rh_id", targetKey: "rh_id", as: "personnel" });

/*
 * ============================================================
 * ASSOCIATIONS - PARENT
 * ============================================================
 */

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

AnneeScolaire.hasMany(BaremeFrais, {
    foreignKey: "code_annee_scolaire",
    sourceKey: "code_annee_scolaire",
});

BaremeFrais.belongsTo(AnneeScolaire, {
    foreignKey: "code_annee_scolaire",
    targetKey: "code_annee_scolaire",
});

Niveau.hasMany(BaremeFrais, {
    foreignKey: "code_niveau",
    sourceKey: "code_niveau",
});

BaremeFrais.belongsTo(Niveau, {
    foreignKey: "code_niveau",
    targetKey: "code_niveau",
});

Filiere.hasMany(BaremeFrais, {
    foreignKey: "code_filiere",
    sourceKey: "code_filiere",
});

BaremeFrais.belongsTo(Filiere, {
    foreignKey: "code_filiere",
    targetKey: "code_filiere",
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
    Necessite,
    BaremeFrais,
    PieceRequise,
    Inscription,
    FactureEcheance,
    Salle,
    Matiere,
    Enseign,
    CreneauPlanning,
    Conge,
};