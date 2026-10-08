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
    {
        code_annee_scolaire: "2026-2027",
        code_niveau: "NIV-1",
        code_filiere: null,
        montant: 100000,
    },
    {
        code_annee_scolaire: "2026-2027",
        code_niveau: "NIV-2",
        code_filiere: null,
        montant: 125000,
    },
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
    ];

    for (const classe of classes) {
        await Classe.findOrCreate({
            where: {
                code_classe: classe.code_classe,
            },
            defaults: classe,
        });
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

    await EnseignantFormateur.findOrCreate({
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
    | 11. ELEVE
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
    | 12. PARENT
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

    /*
    |--------------------------------------------------------------------------
    | 13. RELATION PARENT - ELEVE
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
| 13.CATALOGUE DES PIECES REQUISES
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
        where: {
            piece_nom: piece.piece_nom,
        },
        defaults: piece,
    });
}

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
    console.log("Classes : 3");
    console.log("");
    console.log("Comptes de démonstration :");
    console.log("Direction   : demo.direction");
    console.log("Personnel   : demo.personnel");
    console.log("Enseignant  : demo.enseignant");
    console.log("Élève       : demo.eleve");
    console.log("Parent      : demo.parent");
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