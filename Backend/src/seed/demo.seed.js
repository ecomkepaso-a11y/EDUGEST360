import "dotenv/config";

import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import {
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
    BaremeFrais,
    PieceRequise,
    Inscription,
    Necessite,
    FactureEcheance,
    Salle,
    Matiere,
    Enseign,
    CreneauPlanning,
    Conge,
} from "../models/index.js";

const runSeed = async () => {

    console.log("======================================");
    console.log("EDUGEST 360 — DEMO SEED");
    console.log("======================================");

    /*
    |--------------------------------------------------------------------------
    | 1. ETABLISSEMENT
    |--------------------------------------------------------------------------
    */

    const eta_id = "demo-eta-001";

    const baremes = [
        { code_annee_scolaire: "2026-2027", code_niveau: "NIV-1", code_filiere: null, montant: 100000 },
        { code_annee_scolaire: "2026-2027", code_niveau: "NIV-2", code_filiere: null, montant: 125000 },
        { code_annee_scolaire: "2026-2027", code_niveau: "NIV-1", code_filiere: "FIL-INFO", montant: 110000 },
        { code_annee_scolaire: "2026-2027", code_niveau: "NIV-2", code_filiere: "FIL-INFO", montant: 135000 },
        { code_annee_scolaire: "2026-2027", code_niveau: "NIV-1", code_filiere: "FIL-GEST", montant: 105000 },
    ];

    await Etablissement.findOrCreate({
        where: {
            eta_id,
        },
        defaults: {
            eta_id,
            eta_code: "EDU360-CM",
            eta_nom: "EDUGEST 360 Demo",
            eta_type: "secondaire",
            eta_adresse: "Douala",
            eta_ville: "Douala",
            eta_pays: "Cameroun",
            eta_tel: "690000000",
            eta_email: "demo@edugest360.com",
            eta_statut: "actif",
            eta_heure_ouverture: "07:00:00",
            eta_heure_fermeture: "18:00:00",
        },
    });

    /*
    |--------------------------------------------------------------------------
    | 2. ANNEE SCOLAIRE
    |--------------------------------------------------------------------------
    */

    await AnneeScolaire.findOrCreate({
        where: {
            code_annee_scolaire: "2026-2027",
        },
        defaults: {
            code_annee_scolaire: "2026-2027",
            date_debut_annee: "2026-09-01",
            date_fin_annee: "2027-07-31",
            eta_id,
        },
    });

    // Année précédente utilisée pour démontrer la réinscription.
    await AnneeScolaire.findOrCreate({
        where: { code_annee_scolaire: "2025-2026" },
        defaults: {
            code_annee_scolaire: "2025-2026",
            date_debut_annee: "2025-09-01",
            date_fin_annee: "2026-07-31",
            eta_id,
        },
    });

    /*
    |--------------------------------------------------------------------------
    | 3. NIVEAUX
    |--------------------------------------------------------------------------
    */

    await Niveau.findOrCreate({
        where: {
            code_niveau: "NIV-1",
        },
        defaults: {
            code_niveau: "NIV-1",
            libelle_niveau: "Premier cycle",
        },
    });

    await Niveau.findOrCreate({
        where: {
            code_niveau: "NIV-2",
        },
        defaults: {
            code_niveau: "NIV-2",
            libelle_niveau: "Second cycle",
        },
    });

    /*
    |--------------------------------------------------------------------------
    | 4. FILIERES
    |--------------------------------------------------------------------------
    */

    await Filiere.findOrCreate({
        where: {
            code_filiere: "FIL-INFO",
        },
        defaults: {
            code_filiere: "FIL-INFO",
            libelle_filiere: "Informatique",
        },
    });

    await Filiere.findOrCreate({
        where: {
            code_filiere: "FIL-GEST",
        },
        defaults: {
            code_filiere: "FIL-GEST",
            libelle_filiere: "Gestion",
        },
    });

    /*
|--------------------------------------------------------------------------
| 5. BARÈMES DE FRAIS
|--------------------------------------------------------------------------
|
*/

for (const bareme of baremes) {
    await BaremeFrais.findOrCreate({
        where: {
            code_annee_scolaire: bareme.code_annee_scolaire,
            code_niveau: bareme.code_niveau,
            code_filiere: bareme.code_filiere,
        },
        defaults: bareme,
    });
}

    /*
    |--------------------------------------------------------------------------
    | 6. CLASSES
    |--------------------------------------------------------------------------
    */

    const classes = [
        {
            code_classe: "CLS-INFO-1",
            libelle_classe: "Informatique Niveau 1",
            effectif_classe: 30,
            effectif_max: 40,
            statut_classe: true,
            eta_id,
            code_annee_scolaire: "2026-2027",
            code_niveau: "NIV-1",
            code_filiere: "FIL-INFO",
        },

        {
            code_classe: "CLS-INFO-2",
            libelle_classe: "Informatique Niveau 2",
            effectif_classe: 28,
            effectif_max: 40,
            statut_classe: true,
            eta_id,
            code_annee_scolaire: "2026-2027",
            code_niveau: "NIV-2",
            code_filiere: "FIL-INFO",
        },

        {
            code_classe: "CLS-GEST-1",
            libelle_classe: "Gestion Niveau 1",
            effectif_classe: 32,
            effectif_max: 50,
            statut_classe: true,
            eta_id,
            code_annee_scolaire: "2026-2027",
            code_niveau: "NIV-1",
            code_filiere: "FIL-GEST",
        },
        {
            code_classe: "CLS-DEMO-FULL",
            libelle_classe: "Classe complète — démonstration",
            effectif_classe: 2,
            effectif_max: 2,
            statut_classe: true,
            eta_id,
            code_annee_scolaire: "2026-2027",
            code_niveau: "NIV-1",
            code_filiere: "FIL-INFO",
        },
        {
            code_classe: "CLS-ARCHIVE-1",
            libelle_classe: "Classe archive 2025-2026",
            effectif_classe: 1,
            effectif_max: 40,
            statut_classe: true,
            eta_id,
            code_annee_scolaire: "2025-2026",
            code_niveau: "NIV-1",
            code_filiere: "FIL-INFO",
        },
    ];

    for (const classe of classes) {
        const [classeExistante] = await Classe.findOrCreate({
            where: { code_classe: classe.code_classe },
            defaults: classe,
        });
        // Garder la classe de démonstration réellement pleine lors des exécutions répétées.
        if (classe.code_classe === "CLS-DEMO-FULL") {
            await classeExistante.update({
                effectif_max: 2,
                code_annee_scolaire: "2026-2027",
                code_niveau: "NIV-1",
                code_filiere: "FIL-INFO",
                statut_classe: true,
            });
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 7. PASSWORD
    |--------------------------------------------------------------------------
    */

    const passwordHash = await bcrypt.hash("Demo@12345", 10);

    /*
    |--------------------------------------------------------------------------
    | 8. DIRECTION
    |--------------------------------------------------------------------------
    */

    const directionId = randomUUID();

    const [direction] = await Utilisateur.findOrCreate({
        where: {
            usr_login: "demo.direction",
        },
        defaults: {
            usr_id: directionId,
            usr_nom: "Admin",
            usr_prenom: "Direction",
            usr_email: "direction.demo@edugest360.com",
            usr_tel: "690000001",
            usr_login: "demo.direction",
            usr_mdp_hash: passwordHash,
            usr_role: "direction",
            usr_statut: "actif",
            usr_date_creation: new Date(),
            eta_id,
        },
    });

    /*
    |--------------------------------------------------------------------------
    | 9. PERSONNEL
    |--------------------------------------------------------------------------
    */

    const personnelUserId = randomUUID();

    const [personnelUser] = await Utilisateur.findOrCreate({
        where: {
            usr_login: "demo.personnel",
        },
        defaults: {
            usr_id: personnelUserId,
            usr_nom: "Ndi",
            usr_prenom: "Personnel",
            usr_email: "personnel.demo@edugest360.com",
            usr_tel: "690000002",
            usr_login: "demo.personnel",
            usr_mdp_hash: passwordHash,
            usr_role: "personnel",
            usr_statut: "actif",
            usr_date_creation: new Date(),
            eta_id,
        },
    });

    await Personnel.findOrCreate({
        where: {
            rh_matricule: "RH-DEMO-001",
        },
        defaults: {
            rh_id: randomUUID(),
            usr_id: personnelUser.usr_id,
            rh_matricule: "RH-DEMO-001",
            rh_fonction: "Personnel administratif",
            rh_date_embauche: "2026-01-10",
            rh_salaire_base: 250000,
        },
    });

    /*
    |--------------------------------------------------------------------------
    | 10. ENSEIGNANT
    |--------------------------------------------------------------------------
    */

    const enseignantUserId = randomUUID();

    const [enseignantUser] = await Utilisateur.findOrCreate({
        where: {
            usr_login: "demo.enseignant",
        },
        defaults: {
            usr_id: enseignantUserId,
            usr_nom: "Manga",
            usr_prenom: "Enseignant",
            usr_email: "enseignant.demo@edugest360.com",
            usr_tel: "690000003",
            usr_login: "demo.enseignant",
            usr_mdp_hash: passwordHash,
            usr_role: "enseignant",
            usr_statut: "actif",
            usr_date_creation: new Date(),
            eta_id,
        },
    });

    const [enseignantDemo]=await EnseignantFormateur.findOrCreate({
        where: {
            usr_id: enseignantUser.usr_id,
        },
        defaults: {
            usr_id: enseignantUser.usr_id,
            enseignant_specialite: "Informatique",
            enseignant_statut: true,
        },
    });

        /*
    |--------------------------------------------------------------------------
    | 11. PLANNING : SALLES, MATIERES, HABILITATIONS 
    |--------------------------------------------------------------------------
    */

    const sallesDemo = [
        { salle_nom: "Salle 1", capacite: 40 },
        { salle_nom: "Salle 2", capacite: 30 },
        { salle_nom: "Labo Informatique", capacite: 25 },
    ];

    for (const salle of sallesDemo) {
        await Salle.findOrCreate({
            where: { eta_id, salle_nom: salle.salle_nom },
            defaults: { eta_id, ...salle },
        });
    }

    const matieresDemo = [
        { matiere_code: "INFO", matiere_libelle: "Informatique" },
        { matiere_code: "MATH", matiere_libelle: "Mathématiques" },
        { matiere_code: "FR", matiere_libelle: "Français" },
        { matiere_code: "ANG", matiere_libelle: "Anglais" },
    ];

    const matieres = {};
    for (const matiere of matieresDemo) {
        const [row] = await Matiere.findOrCreate({
            where: { matiere_code: matiere.matiere_code },
            defaults: matiere,
        });
        matieres[matiere.matiere_code] = row;
    }

    // L'enseignant de démonstration est habilité en informatique et en mathématiques.
    for (const code of ["INFO", "MATH"]) {
        await Enseign.findOrCreate({
            where: {
                matiere_id: matieres[code].matiere_id,
                enseignant_id: enseignantDemo.enseignant_id,
            },
            defaults: {
                matiere_id: matieres[code].matiere_id,
                enseignant_id: enseignantDemo.enseignant_id,
            },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 12. ELEVE
    |--------------------------------------------------------------------------
    */

    const eleveUserId = randomUUID();

    const [eleveUser] = await Utilisateur.findOrCreate({
        where: {
            usr_login: "demo.eleve",
        },
        defaults: {
            usr_id: eleveUserId,
            usr_nom: "Kamga",
            usr_prenom: "Élève",
            usr_email: "eleve.demo@edugest360.com",
            usr_tel: "690000004",
            usr_login: "demo.eleve",
            usr_mdp_hash: passwordHash,
            usr_role: "élève",
            usr_statut: "actif",
            usr_date_creation: new Date(),
            eta_id,
        },
    });

    const [eleve] = await EleveApprenant.findOrCreate({
        where: {
            mat_eleve: "ELEVE-DEMO-001",
        },
        defaults: {
            mat_eleve: "ELEVE-DEMO-001",
            usr_id: eleveUser.usr_id,
            nom_eleve: "Kamga",
            prenom_eleve: "Élève",
            sexe_eleve: "M",
            date_naiss: "2007-05-10",
            lieu_naiss: "Douala",
            nationalite: "Camerounaise",
        },
    });

    /*
    |--------------------------------------------------------------------------
    | 13. PARENT
    |--------------------------------------------------------------------------
    */

    const [parent] = await ParentTuteur.findOrCreate({
        where: {
            com_id: "demo-parent-001",
        },
        defaults: {
            com_id: "demo-parent-001",
            com_canal: "email",
            com_statut: "actif",
        },
    });

    const parentUserId = randomUUID();
    const [parentUser] = await Utilisateur.findOrCreate({
        where: { usr_login: "demo.parent" },
        defaults: {
            usr_id: parentUserId,
            usr_nom: "Kamga",
            usr_prenom: "Parent",
            usr_email: "parent.demo@edugest360.com",
            usr_tel: "690000005",
            usr_login: "demo.parent",
            usr_mdp_hash: passwordHash,
            usr_role: "parent",
            usr_statut: "actif",
            usr_date_creation: new Date(),
            eta_id,
        },
    });

    // Mettre à jour le lien également si le profil parent existait déjà.
    if (parent.usr_id !== parentUser.usr_id) {
        await parent.update({ usr_id: parentUser.usr_id });
    }

    /*
    |--------------------------------------------------------------------------
    | 14. RELATION PARENT - ELEVE
    |--------------------------------------------------------------------------
    */

    await EstResponsableDe.findOrCreate({
        where: {
            mat_eleve: eleve.mat_eleve,
            com_id: parent.com_id,
        },
        defaults: {
            mat_eleve: eleve.mat_eleve,
            com_id: parent.com_id,
            lien_parente: "père",
        },
    });

    /*
|--------------------------------------------------------------------------
| 15.CATALOGUE DES PIECES REQUISES
|--------------------------------------------------------------------------
|
| Données de démonstration uniquement.
|
*/

const piecesRequises = [
    {
        piece_nom: "Acte de naissance",
        piece_description:
            "Copie de l'acte de naissance de l'élève.",
        piece_quantite: 1,
        piece_obligatoire: true,
        piece_statut: "active",
    },

    {
        piece_nom: "Photo d'identité",
        piece_description:
            "Photo récente de l'élève.",
        piece_quantite: 2,
        piece_obligatoire: true,
        piece_statut: "active",
    },

    {
        piece_nom: "Certificat médical",
        piece_description:
            "Certificat médical de l'élève.",
        piece_quantite: 1,
        piece_obligatoire: true,
        piece_statut: "active",
    },

    {
        piece_nom: "Copie du dernier bulletin",
        piece_description:
            "Dernier bulletin scolaire disponible.",
        piece_quantite: 1,
        piece_obligatoire: false,
        piece_statut: "active",
    },
];

for (const piece of piecesRequises) {
    await PieceRequise.findOrCreate({
        where: { piece_nom: piece.piece_nom },
        defaults: piece,
    });
}

/*
|--------------------------------------------------------------------------
| 16. DOSSIERS DE DÉMONSTRATION ET HISTORIQUE
|--------------------------------------------------------------------------
*/
const demoStudents = [
    { mat_eleve: "ELEVE-DEMO-PENDING", nom_eleve: "Tchoumi", prenom_eleve: "Attente", sexe_eleve: "F", date_naiss: "2008-02-14", lieu_naiss: "Douala", nationalite: "Camerounaise" },
    { mat_eleve: "ELEVE-DEMO-VALID-1", nom_eleve: "Nana", prenom_eleve: "Valide Un", sexe_eleve: "M", date_naiss: "2007-03-11", lieu_naiss: "Douala", nationalite: "Camerounaise" },
    { mat_eleve: "ELEVE-DEMO-VALID-2", nom_eleve: "Mekongo", prenom_eleve: "Valide Deux", sexe_eleve: "F", date_naiss: "2007-04-12", lieu_naiss: "Douala", nationalite: "Camerounaise" },
    { mat_eleve: "ELEVE-DEMO-REFUSED", nom_eleve: "Fopa", prenom_eleve: "Refus", sexe_eleve: "M", date_naiss: "2008-05-13", lieu_naiss: "Douala", nationalite: "Camerounaise" },
    { mat_eleve: "ELEVE-DEMO-CANCELLED", nom_eleve: "Etoa", prenom_eleve: "Annule", sexe_eleve: "F", date_naiss: "2008-06-14", lieu_naiss: "Douala", nationalite: "Camerounaise" },
    { mat_eleve: "ELEVE-DEMO-REINSCRIPTION", nom_eleve: "Biloa", prenom_eleve: "Reinscription", sexe_eleve: "M", date_naiss: "2007-07-15", lieu_naiss: "Douala", nationalite: "Camerounaise" },
];

for (const student of demoStudents) {
    await EleveApprenant.findOrCreate({
        where: { mat_eleve: student.mat_eleve },
        defaults: student,
    });
}

const pieceCatalogue = await PieceRequise.findAll({
    where: { piece_obligatoire: true, piece_statut: "active" },
});

const createDemoDossier = async ({ mat_eleve, year, classe, status, dueDate, motif }) => {
    let fact_id = null;
    if (status === "validee") {
        const [facture] = await FactureEcheance.findOrCreate({
            where: { mat_eleve, fin_date_echeance: dueDate },
            defaults: {
                fin_montant_frais: 110000,
                fin_date_echeance: dueDate,
                fin_statut: "en_attente",
                mat_eleve,
            },
        });
        fact_id = facture.fact_id;
    }

    const dossierValues = {
        mat_eleve,
        date_inscription: year === "2025-2026" ? "2025-09-05" : "2026-09-05",
        statut_inscription: status,
        code_annee_scolaire: year,
        code_classe: classe,
        fact_id,
        motif_refus: status === "refusee" ? motif : null,
    };
    const [dossier] = await Inscription.findOrCreate({
        where: { mat_eleve, code_annee_scolaire: year },
        defaults: dossierValues,
    });
    // Le seed de démonstration reste reproductible si on le relance.
    await dossier.update(dossierValues);

    for (const piece of pieceCatalogue) {
        const necessiteValues = {
            ins_id: dossier.ins_id,
            piece_id: piece.piece_id,
            fournie: status === "validee",
            date_depot: status === "validee" ? "2026-09-06" : null,
        };
        const [necessite] = await Necessite.findOrCreate({
            where: { ins_id: dossier.ins_id, piece_id: piece.piece_id },
            defaults: necessiteValues,
        });
        await necessite.update(necessiteValues);
    }
    return dossier;
};

await createDemoDossier({ mat_eleve: "ELEVE-DEMO-001", year: "2026-2027", classe: "CLS-INFO-1", status: "en_attente" });
await createDemoDossier({ mat_eleve: "ELEVE-DEMO-PENDING", year: "2026-2027", classe: "CLS-INFO-1", status: "en_attente" });
await createDemoDossier({ mat_eleve: "ELEVE-DEMO-VALID-1", year: "2026-2027", classe: "CLS-DEMO-FULL", status: "validee", dueDate: "2026-10-30" });
await createDemoDossier({ mat_eleve: "ELEVE-DEMO-VALID-2", year: "2026-2027", classe: "CLS-DEMO-FULL", status: "validee", dueDate: "2026-10-31" });
await createDemoDossier({ mat_eleve: "ELEVE-DEMO-REFUSED", year: "2026-2027", classe: "CLS-INFO-1", status: "refusee", motif: "Dossier incomplet après vérification." });
await createDemoDossier({ mat_eleve: "ELEVE-DEMO-CANCELLED", year: "2026-2027", classe: "CLS-INFO-2", status: "annulee" });
await createDemoDossier({ mat_eleve: "ELEVE-DEMO-REINSCRIPTION", year: "2025-2026", classe: "CLS-ARCHIVE-1", status: "validee", dueDate: "2026-06-30" });


/*
|--------------------------------------------------------------------------
| 17. PLANNING 
|--------------------------------------------------------------------------
*/

    
    const eta2_id = "demo-eta-002";
    await Etablissement.findOrCreate({
        where: { eta_id: eta2_id },
        defaults: {
            eta_id: eta2_id, eta_code: "EDU360-CM2", eta_nom: "EDUGEST 360 Demo 2", eta_type: "secondaire",
            eta_adresse: "Yaoundé", eta_ville: "Yaoundé", eta_pays: "Cameroun", eta_tel: "690000010",
            eta_email: "demo2@edugest360.com", eta_statut: "actif",
            eta_heure_ouverture: "08:00:00", eta_heure_fermeture: "17:00:00",
        },
    });

    await Utilisateur.findOrCreate({
        where: { usr_login: "demo.direction2" },
        defaults: {
            usr_id: randomUUID(), usr_nom: "Admin", usr_prenom: "Direction 2", usr_email: "direction2.demo@edugest360.com",
            usr_tel: "690000011", usr_login: "demo.direction2", usr_mdp_hash: passwordHash, usr_role: "direction",
            usr_statut: "actif", usr_date_creation: new Date(), eta_id: eta2_id,
        },
    });

    for (const salle of [{ salle_nom: "Salle A", capacite: 35 }, { salle_nom: "Salle B", capacite: 20 }]) {
        await Salle.findOrCreate({ where: { eta_id: eta2_id, salle_nom: salle.salle_nom }, defaults: { eta_id: eta2_id, ...salle } });
    }

    await Classe.findOrCreate({
        where: { code_classe: "CLS-ETA2-1" },
        defaults: {
            code_classe: "CLS-ETA2-1", libelle_classe: "Seconde A — établissement 2", effectif_classe: 20, effectif_max: 30,
            statut_classe: true, eta_id: eta2_id, code_annee_scolaire: "2026-2027", code_niveau: "NIV-2", code_filiere: null,
        },
    });

    // 17.2 Deuxième enseignant (Français / Anglais) dans l'établissement de démonstration
    const [enseignant2User] = await Utilisateur.findOrCreate({
        where: { usr_login: "demo.enseignant2" },
        defaults: {
            usr_id: randomUUID(), usr_nom: "Biya", usr_prenom: "Enseignante", usr_email: "enseignant2.demo@edugest360.com",
            usr_tel: "690000012", usr_login: "demo.enseignant2", usr_mdp_hash: passwordHash, usr_role: "enseignant",
            usr_statut: "actif", usr_date_creation: new Date(), eta_id,
        },
    });
    const [enseignant2] = await EnseignantFormateur.findOrCreate({
        where: { usr_id: enseignant2User.usr_id },
        defaults: { usr_id: enseignant2User.usr_id, enseignant_specialite: "Lettres", enseignant_statut: true },
    });
    for (const code of ["FR", "ANG"]) {
        await Enseign.findOrCreate({
            where: { matiere_id: matieres[code].matiere_id, enseignant_id: enseignant2.enseignant_id },
            defaults: { matiere_id: matieres[code].matiere_id, enseignant_id: enseignant2.enseignant_id },
        });
    }
    const [eleveUser2] = await Utilisateur.findOrCreate({
        where: { usr_login: "demo.eleve2" },
        defaults: {
            usr_id: randomUUID(), usr_nom: "Owona", usr_prenom: "Élève Planning", usr_email: "eleve2.demo@edugest360.com",
            usr_tel: "690000013", usr_login: "demo.eleve2", usr_mdp_hash: passwordHash, usr_role: "élève",
            usr_statut: "actif", usr_date_creation: new Date(), eta_id,
        },
    });
    await EleveApprenant.findOrCreate({
        where: { mat_eleve: "ELEVE-DEMO-PLAN" },
        defaults: {
            mat_eleve: "ELEVE-DEMO-PLAN", usr_id: eleveUser2.usr_id, nom_eleve: "Owona", prenom_eleve: "Élève Planning",
            sexe_eleve: "F", date_naiss: "2008-09-09", lieu_naiss: "Douala", nationalite: "Camerounaise",
        },
    });
    await Inscription.findOrCreate({
        where: { mat_eleve: "ELEVE-DEMO-PLAN", code_annee_scolaire: "2026-2027" },
        defaults: {
            mat_eleve: "ELEVE-DEMO-PLAN", code_annee_scolaire: "2026-2027", code_classe: "CLS-INFO-1",
            date_inscription: "2026-09-05", statut_inscription: "validee",
        },
    });
    await EstResponsableDe.findOrCreate({
        where: { mat_eleve: "ELEVE-DEMO-PLAN", com_id: parent.com_id },
        defaults: { mat_eleve: "ELEVE-DEMO-PLAN", com_id: parent.com_id, lien_parente: "père" },
    });

    const salleParNom = {};
    for (const salle of await Salle.findAll({ where: { eta_id } })) salleParNom[salle.salle_nom] = salle;

    // [classe, jour, début, fin, matière, enseignant, salle]
    const creneauxDemo = [
        // Enseignant de démo (Informatique / Maths)
        ["CLS-INFO-1", "lundi",    "08:00:00", "10:00:00", "INFO", enseignantDemo,  "Salle 1"],
        ["CLS-INFO-2", "lundi",    "10:00:00", "12:00:00", "MATH", enseignantDemo,  "Salle 2"],
        ["CLS-INFO-2", "mercredi", "08:00:00", "10:00:00", "INFO", enseignantDemo,  "Salle 2"],
        ["CLS-INFO-1", "mercredi", "14:00:00", "16:00:00", "MATH", enseignantDemo,  "Salle 1"],
        ["CLS-GEST-1", "vendredi", "08:00:00", "10:00:00", "MATH", enseignantDemo,  "Salle 1"],
        // Enseignante 2 (Français / Anglais)
        ["CLS-INFO-2", "lundi",    "08:00:00", "10:00:00", "FR",   enseignant2,     "Salle 2"],
        ["CLS-INFO-1", "mardi",    "08:00:00", "10:00:00", "ANG",  enseignant2,     "Salle 1"],
        ["CLS-GEST-1", "mardi",    "10:00:00", "12:00:00", "FR",   enseignant2,     "Salle 1"],
        ["CLS-GEST-1", "jeudi",    "08:00:00", "10:00:00", "ANG",  enseignant2,     "Salle 1"],
        ["CLS-INFO-1", "jeudi",    "10:00:00", "12:00:00", "FR",   enseignant2,     "Salle 2"],
    ];

    for (const [code_classe, plan_jour, plan_heure_debut, plan_heure_fin, codeMatiere, prof, nomSalle] of creneauxDemo) {
        await CreneauPlanning.findOrCreate({
            where: { code_classe, plan_jour, plan_heure_debut, salle_id: salleParNom[nomSalle].salle_id },
            defaults: {
                code_classe, plan_jour, plan_heure_debut, plan_heure_fin, plan_statut: "actif",
                matiere_id: matieres[codeMatiere].matiere_id, enseignant_id: prof.enseignant_id,
                salle_id: salleParNom[nomSalle].salle_id,
            },
        });
    }

    const personnelDemo = await Personnel.findOne({ where: { rh_matricule: "RH-DEMO-001" } });

    await Conge.findOrCreate({
        where: { conge_id: "demo-conge-001" },
        defaults: {
            conge_id: "demo-conge-001", conge_date_debut: "2026-11-09", conge_date_fin: "2026-11-11",
            conge_motif: "Congé de démonstration (RG-PLAN-06)", rh_statut_conge: "valide",
            rh_id: personnelDemo.rh_id, usr_id: enseignantUser.usr_id,
        },
    });

    /*
    |--------------------------------------------------------------------------
    | FIN
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("SEED TERMINÉ AVEC SUCCÈS");

    console.log("Établissement : EDU360-CM");
    console.log("Année scolaire : 2026-2027");
    console.log("Niveaux : 2");
    console.log("Filières : 2");
    console.log("Classes : 6 (dont 1 dans le 2e établissement)");
    console.log("Établissements : 2 (EDU360-CM, EDU360-CM2) ; 10 créneaux sur 3 classes ; 1 congé validé (demo-conge-001)");
    console.log("Dossiers de démonstration : 6 (tous les statuts + classe pleine)");
    console.log("");
    console.log("Comptes de démonstration :");
    console.log("Direction   : demo.direction");
    console.log("Personnel   : demo.personnel");
    console.log("Enseignant  : demo.enseignant");
    console.log("Élève       : demo.eleve");
    console.log("Parent      : demo.parent");
    console.log("Planning    : demo.enseignant2, demo.eleve2 (inscription validée), demo.direction2 (établissement 2)");
    console.log("");
    console.log("Mot de passe développement : Demo@12345");
};

runSeed()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("Erreur pendant le seed :", error);
        process.exit(1);
    });