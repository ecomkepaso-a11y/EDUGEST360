/*
 * SEMAINE 7 — JOUR 4 : vues de planning et contrôle d'accès « propriétaire ».
 *
 * ATTENTION : écrit dans la base pointée par .env. Tout est préfixé "t7j4"
 * et supprimé avant et après les tests.
 */
import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Op } from "sequelize";

import app from "../src/app.js";
import sequelize from "../config/database.js";
import {
    Etablissement, AnneeScolaire, Niveau, Classe, Utilisateur, EnseignantFormateur, EleveApprenant,
    ParentTuteur, EstResponsableDe, Inscription, Salle, Matiere, Enseign, CreneauPlanning,
} from "../src/models/index.js";

sequelize.options.logging = false;
jest.setTimeout(60000);

const ETA_A = "t7j4-eta-a";
const ETA_B = "t7j4-eta-b";
const ANNEE = "T7J4-AS";
const NIVEAU = "T7J4-NIV";

const jeton = (user, role, eta_id = ETA_A) =>
    jwt.sign({ usr_id: user?.usr_id ?? randomUUID(), usr_login: `t7j4.${role}`, usr_role: role, eta_id }, process.env.JWT_SECRET, { expiresIn: "1h" });
const get = (url, token) => request(app).get(url).set({ Authorization: `Bearer ${token}` });

let classe1, classe2, classeB, salle1, salle2, salle3, salleB, matMath;
let profA, profB, userProfA, userProfB;
let eleve1, eleve2, userEleve1, userEleve2;
let parent1, parent2, userParent1, userParent2;
let tDirection, tPersonnel, tDirectionB, tProfA, tProfB, tEleve1, tEleve2, tParent1, tParent2;

const nettoyer = async () => {
    const users = await Utilisateur.findAll({ where: { usr_login: { [Op.like]: "t7j4.%" } } });
    const usrIds = users.map((u) => u.usr_id);
    const profs = await EnseignantFormateur.findAll({ where: { usr_id: usrIds } });
    const parents = await ParentTuteur.findAll({ where: { usr_id: usrIds } });
    const mats = await Matiere.findAll({ where: { matiere_code: { [Op.like]: "T7J4-%" } } });

    await CreneauPlanning.destroy({ where: { code_classe: { [Op.like]: "T7J4-%" } } });
    await Inscription.destroy({ where: { code_classe: { [Op.like]: "T7J4-%" } } });
    await EstResponsableDe.destroy({ where: { mat_eleve: { [Op.like]: "T7J4-%" } } });
    await ParentTuteur.destroy({ where: { com_id: parents.map((p) => p.com_id) } });
    await EleveApprenant.destroy({ where: { mat_eleve: { [Op.like]: "T7J4-%" } } });
    await Enseign.destroy({ where: { [Op.or]: [{ matiere_id: mats.map((m) => m.matiere_id) }, { enseignant_id: profs.map((p) => p.enseignant_id) }] } });
    await Classe.destroy({ where: { code_classe: { [Op.like]: "T7J4-%" } } });
    await AnneeScolaire.destroy({ where: { code_annee_scolaire: ANNEE } });
    await Niveau.destroy({ where: { code_niveau: NIVEAU } });
    await Salle.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
    await Matiere.destroy({ where: { matiere_code: { [Op.like]: "T7J4-%" } } });
    await EnseignantFormateur.destroy({ where: { usr_id: usrIds } });
    await Utilisateur.destroy({ where: { usr_login: { [Op.like]: "t7j4.%" } } });
    await Etablissement.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
};

const etablissement = (eta_id, n) =>
    Etablissement.create({
        eta_id, eta_code: `T7J4-${n}`, eta_nom: `Établissement ${n}`, eta_type: "secondaire",
        eta_adresse: "Douala", eta_ville: "Douala", eta_pays: "Cameroun", eta_tel: "690000000", eta_email: `t7j4.${n}@test.local`,
    });

const utilisateur = (suffixe, role, eta_id = ETA_A) =>
    Utilisateur.create({
        usr_id: randomUUID(), usr_nom: `Nom${suffixe}`, usr_prenom: "Test", usr_email: `t7j4.${suffixe}@test.local`,
        usr_login: `t7j4.${suffixe}`, usr_mdp_hash: "x", usr_role: role, usr_statut: "actif",
        usr_date_creation: new Date(), eta_id,
    });

const classe = (code, eta_id = ETA_A) =>
    Classe.create({ code_classe: code, libelle_classe: code, effectif_classe: 20, eta_id, code_annee_scolaire: ANNEE, code_niveau: NIVEAU });

const eleve = (mat, usr_id) =>
    EleveApprenant.create({ mat_eleve: mat, usr_id, nom_eleve: mat, prenom_eleve: "Eleve", sexe_eleve: "M", date_naiss: "2012-01-01" });

const inscrire = (mat_eleve, code_classe, statut = "validee") =>
    Inscription.create({ mat_eleve, code_classe, code_annee_scolaire: ANNEE, date_inscription: "2026-09-05", statut_inscription: statut });

const creneau = (o) =>
    CreneauPlanning.create({
        plan_jour: "lundi", plan_heure_debut: "08:00:00", plan_heure_fin: "10:00:00", plan_statut: "actif",
        matiere_id: matMath.matiere_id, ...o,
    });

beforeAll(async () => {
    await nettoyer();
    await etablissement(ETA_A, "A");
    await etablissement(ETA_B, "B");
    await AnneeScolaire.create({ code_annee_scolaire: ANNEE, date_debut_annee: "2026-09-01", date_fin_annee: "2027-07-31", eta_id: ETA_A });
    await Niveau.create({ code_niveau: NIVEAU, libelle_niveau: "Niveau test" });
    matMath = await Matiere.create({ matiere_code: "T7J4-MATH", matiere_libelle: "Mathématiques" });

    classe1 = await classe("T7J4-C1");
    classe2 = await classe("T7J4-C2");
    classeB = await classe("T7J4-CB", ETA_B);
    salle1 = await Salle.create({ salle_nom: "S1", eta_id: ETA_A, capacite: 40 });
    salle2 = await Salle.create({ salle_nom: "S2", eta_id: ETA_A, capacite: 20 });
    salle3 = await Salle.create({ salle_nom: "S3", eta_id: ETA_A, capacite: 40 });
    salleB = await Salle.create({ salle_nom: "SB", eta_id: ETA_B, capacite: 40 });

    userProfA = await utilisateur("profa", "enseignant");
    userProfB = await utilisateur("profb", "enseignant");
    profA = await EnseignantFormateur.create({ usr_id: userProfA.usr_id });
    profB = await EnseignantFormateur.create({ usr_id: userProfB.usr_id });

    userEleve1 = await utilisateur("eleve1", "élève");
    userEleve2 = await utilisateur("eleve2", "élève");
    eleve1 = await eleve("T7J4-E1", userEleve1.usr_id);
    eleve2 = await eleve("T7J4-E2", userEleve2.usr_id);
    await inscrire("T7J4-E1", "T7J4-C1");
    await inscrire("T7J4-E2", "T7J4-C2");

    userParent1 = await utilisateur("parent1", "parent");
    userParent2 = await utilisateur("parent2", "parent");
    parent1 = await ParentTuteur.create({ com_id: randomUUID(), usr_id: userParent1.usr_id, com_canal: "email" });
    parent2 = await ParentTuteur.create({ com_id: randomUUID(), usr_id: userParent2.usr_id, com_canal: "email" });
    await EstResponsableDe.create({ mat_eleve: "T7J4-E1", com_id: parent1.com_id, lien_parente: "père" });
    await EstResponsableDe.create({ mat_eleve: "T7J4-E2", com_id: parent2.com_id, lien_parente: "mère" });

    // Désordre volontaire (mercredi inséré avant lundi, 10h avant 08h) pour tester le tri
    await creneau({ code_classe: "T7J4-C1", enseignant_id: profA.enseignant_id, salle_id: salle1.salle_id, plan_jour: "mercredi" });
    await creneau({ code_classe: "T7J4-C1", enseignant_id: profA.enseignant_id, salle_id: salle1.salle_id, plan_heure_debut: "10:00:00", plan_heure_fin: "12:00:00" });
    await creneau({ code_classe: "T7J4-C1", enseignant_id: profA.enseignant_id, salle_id: salle1.salle_id });
    await creneau({ code_classe: "T7J4-C1", enseignant_id: profA.enseignant_id, salle_id: salle1.salle_id, plan_jour: "vendredi", plan_statut: "annule" });
    await creneau({ code_classe: "T7J4-C2", enseignant_id: profB.enseignant_id, salle_id: salle2.salle_id, plan_jour: "mardi" });

    tDirection = jeton(null, "direction");
    tPersonnel = jeton(null, "personnel");
    tDirectionB = jeton(null, "direction", ETA_B);
    tProfA = jeton(userProfA, "enseignant");
    tProfB = jeton(userProfB, "enseignant");
    tEleve1 = jeton(userEleve1, "élève");
    tEleve2 = jeton(userEleve2, "élève");
    tParent1 = jeton(userParent1, "parent");
    tParent2 = jeton(userParent2, "parent");
});

afterAll(async () => {
    await nettoyer();
    await sequelize.close();
});

describe("Format de la grille", () => {
    test("7 jours dans l'ordre de la semaine, créneaux triés par heure, annulés exclus", async () => {
        const res = await get("/api/v1/planning/classes/T7J4-C1", tDirection);

        expect(res.status).toBe(200);
        const semaine = res.body.data.semaine;
        expect(semaine.map((j) => j.jour)).toEqual(["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]);

        const lundi = semaine[0].creneaux;
        expect(lundi.map((c) => `${c.heure_debut}-${c.heure_fin}`)).toEqual(["08:00-10:00", "10:00-12:00"]);
        expect(lundi[0]).toMatchObject({
            matiere: { libelle: "Mathématiques" },
            salle: { nom: "S1" },
            classe: { code: "T7J4-C1" },
            enseignant: { id: profA.enseignant_id },
        });
        expect(semaine[2].creneaux).toHaveLength(1);
        expect(semaine[4].creneaux).toHaveLength(0); // le créneau annulé du vendredi n'apparaît pas
    });
});

describe("Vue élève", () => {
    test("l'élève voit son propre planning (inscription validée -> classe -> créneaux)", async () => {
        const res = await get("/api/v1/planning/eleves/T7J4-E1", tEleve1);
        expect(res.status).toBe(200);
        expect(res.body.data.classe.code).toBe("T7J4-C1");
        expect(res.body.data.semaine[0].creneaux).toHaveLength(2);
    });

    test("un élève ne voit PAS le planning d'un camarade (403)", async () => {
        const res = await get("/api/v1/planning/eleves/T7J4-E2", tEleve1);
        expect(res.status).toBe(403);
        expect(JSON.stringify(res.body)).not.toMatch(/T7J4-C2|Mathématiques/);
    });

    test("le parent voit celui de son enfant, pas celui d'un autre enfant", async () => {
        expect((await get("/api/v1/planning/eleves/T7J4-E1", tParent1)).status).toBe(200);
        expect((await get("/api/v1/planning/eleves/T7J4-E2", tParent1)).status).toBe(403);
        expect((await get("/api/v1/planning/eleves/T7J4-E1", tParent2)).status).toBe(403);
    });

    test("un enseignant n'a pas accès à la vue élève (403)", async () => {
        expect((await get("/api/v1/planning/eleves/T7J4-E1", tProfA)).status).toBe(403);
    });

    test("une inscription non validée ne donne aucun créneau", async () => {
        const user = await utilisateur("eleve3", "élève");
        await eleve("T7J4-E3", user.usr_id);
        await inscrire("T7J4-E3", "T7J4-C1", "en_attente");

        const res = await get("/api/v1/planning/eleves/T7J4-E3", jeton(user, "élève"));
        expect(res.status).toBe(200);
        expect(res.body.data.classe).toBeNull();
        expect(res.body.data.semaine.every((j) => j.creneaux.length === 0)).toBe(true);
    });

    test("direction : 200 ; élève inexistant : 404 ; autre établissement : 403", async () => {
        expect((await get("/api/v1/planning/eleves/T7J4-E1", tDirection)).status).toBe(200);
        expect((await get("/api/v1/planning/eleves/T7J4-INCONNU", tDirection)).status).toBe(404);
        expect((await get("/api/v1/planning/eleves/T7J4-E1", tDirectionB)).status).toBe(403);
    });
});

describe("Vue enseignant", () => {
    test("l'enseignant voit le sien", async () => {
        const res = await get(`/api/v1/planning/enseignants/${profA.enseignant_id}`, tProfA);
        expect(res.status).toBe(200);
        expect(res.body.data.semaine[0].creneaux).toHaveLength(2);
    });

    test("un enseignant ne voit PAS le planning d'un collègue (403)", async () => {
        const res = await get(`/api/v1/planning/enseignants/${profB.enseignant_id}`, tProfA);
        expect(res.status).toBe(403);
    });

    test("élève et parent n'y ont pas accès ; direction oui ; id invalide : 400", async () => {
        const url = `/api/v1/planning/enseignants/${profA.enseignant_id}`;
        expect((await get(url, tEleve1)).status).toBe(403);
        expect((await get(url, tParent1)).status).toBe(403);
        expect((await get(url, tDirection)).status).toBe(200);
        expect((await get("/api/v1/planning/enseignants/abc", tDirection)).status).toBe(400);
    });
});

describe("Vue classe", () => {
    test("l'enseignant voit une classe où il enseigne, pas les autres", async () => {
        expect((await get("/api/v1/planning/classes/T7J4-C1", tProfA)).status).toBe(200);
        expect((await get("/api/v1/planning/classes/T7J4-C2", tProfA)).status).toBe(403);
    });

    test("l'élève voit sa classe seulement ; le parent la classe de son enfant seulement", async () => {
        expect((await get("/api/v1/planning/classes/T7J4-C1", tEleve1)).status).toBe(200);
        expect((await get("/api/v1/planning/classes/T7J4-C2", tEleve1)).status).toBe(403);
        expect((await get("/api/v1/planning/classes/T7J4-C1", tParent1)).status).toBe(200);
        expect((await get("/api/v1/planning/classes/T7J4-C2", tParent1)).status).toBe(403);
    });

    test("direction : 200 ; classe inconnue : 404 ; autre établissement : 403", async () => {
        expect((await get("/api/v1/planning/classes/T7J4-C1", tPersonnel)).status).toBe(200);
        expect((await get("/api/v1/planning/classes/T7J4-NOPE", tDirection)).status).toBe(404);
        expect((await get("/api/v1/planning/classes/T7J4-C1", tDirectionB)).status).toBe(403);
    });

    test("sans jeton : 401", async () => {
        expect((await request(app).get("/api/v1/planning/classes/T7J4-C1")).status).toBe(401);
    });
});

describe("Vue salle", () => {
    test("direction/personnel : 200 ; enseignant, élève, parent : 403", async () => {
        const url = `/api/v1/planning/salles/${salle1.salle_id}`;
        const res = await get(url, tDirection);
        expect(res.status).toBe(200);
        expect(res.body.data.salle.nom).toBe("S1");
        expect(res.body.data.semaine[0].creneaux).toHaveLength(2);

        expect((await get(url, tPersonnel)).status).toBe(200);
        expect((await get(url, tProfA)).status).toBe(403);
        expect((await get(url, tEleve1)).status).toBe(403);
        expect((await get(url, tParent1)).status).toBe(403);
    });

    test("salle d'un autre établissement : 403 ; inconnue : 404", async () => {
        expect((await get(`/api/v1/planning/salles/${salleB.salle_id}`, tDirection)).status).toBe(403);
        expect((await get("/api/v1/planning/salles/999999999", tDirection)).status).toBe(404);
    });
});

describe("Salles libres", () => {
    const libres = (q, token = tDirection) => get(`/api/v1/planning/salles/libres?${new URLSearchParams(q)}`, token);
    const noms = (res) => res.body.data.salles.map((s) => s.salle_nom);

    test("exclut les salles occupées sur la plage (chevauchement), pas celles d'un autre jour", async () => {
        // Lundi 08-10 : S1 occupée (C1). Lundi : S2 libre. Mardi : S2 occupée par C2.
        const res = await libres({ jour: "lundi", debut: "09:00", fin: "09:30" });
        expect(res.status).toBe(200);
        expect(noms(res)).toEqual(["S2", "S3"]);

        expect(noms(await libres({ jour: "mardi", debut: "08:00", fin: "10:00" }))).toEqual(["S1", "S3"]);
    });

    test("bornes strictes : une salle libérée à 12:00 est libre de 12:00 à 13:00", async () => {
        // S1 lundi : 08-10 et 10-12
        expect(noms(await libres({ jour: "lundi", debut: "12:00", fin: "13:00" }))).toContain("S1");
        expect(noms(await libres({ jour: "lundi", debut: "11:59", fin: "13:00" }))).not.toContain("S1");
    });

    test("un créneau annulé libère la salle (vendredi)", async () => {
        expect(noms(await libres({ jour: "vendredi", debut: "08:00", fin: "10:00" }))).toContain("S1");
    });

    test("ne renvoie jamais les salles d'un autre établissement ; filtre capacite_min", async () => {
        const res = await libres({ jour: "samedi", debut: "08:00", fin: "10:00" });
        expect(noms(res)).toEqual(["S1", "S2", "S3"]);
        expect(noms(await libres({ jour: "samedi", debut: "08:00", fin: "10:00", capacite_min: 30 }))).toEqual(["S1", "S3"]);
    });

    test("validation (400) et droits (403)", async () => {
        expect((await libres({ jour: "lundi", debut: "10:00", fin: "09:00" })).status).toBe(400);
        expect((await libres({ jour: "funday", debut: "08:00", fin: "09:00" })).status).toBe(400);
        expect((await libres({ jour: "lundi", debut: "8h", fin: "9h" })).status).toBe(400);
        expect((await libres({ jour: "lundi", debut: "08:00", fin: "09:00" }, tProfA)).status).toBe(403);
        expect((await libres({ jour: "lundi", debut: "08:00", fin: "09:00" }, tEleve1)).status).toBe(403);
    });
});

describe("EXPLAIN : les index sont utilisés", () => {
    const explain = async (sql, replacements) => {
        const [rows] = await sequelize.query(`EXPLAIN ${sql}`, { replacements });
        return rows;
    };

    test("requête de conflit de salle -> idx_creneau_salle_jour", async () => {
        const rows = await explain(
            `SELECT plan_id FROM creneau_planning
              WHERE salle_id = :id AND plan_jour = 'lundi' AND plan_statut = 'actif'
                AND plan_heure_debut < '10:00:00' AND plan_heure_fin > '08:00:00'`,
            { id: salle1.salle_id }
        );
        expect(rows[0].key).toBe("idx_creneau_salle_jour");
    });

    test("vue classe -> idx_creneau_classe_jour ; vue enseignant -> idx_creneau_ens_jour", async () => {
        const c = await explain("SELECT plan_id FROM creneau_planning WHERE code_classe = :v AND plan_statut = 'actif'", { v: "T7J4-C1" });
        expect(c[0].key).toBe("idx_creneau_classe_jour");

        const e = await explain("SELECT plan_id FROM creneau_planning WHERE enseignant_id = :v AND plan_statut = 'actif'", { v: profA.enseignant_id });
        expect(e[0].key).toBe("idx_creneau_ens_jour");
    });
});