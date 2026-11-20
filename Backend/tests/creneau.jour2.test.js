/*
 * SEMAINE 7 — JOUR 2 : tests d'intégration de la création de créneau.
 * Couvre : création nominale, conflits enseignant / salle / classe (409),
 * hors plage, enseignant non habilité, salle trop petite (422), validations, RBAC.
 *
 * ATTENTION : écrit dans la base pointée par .env. Tout est préfixé "t7j2"
 * et supprimé avant et après les tests (les données demo.* ne sont pas touchées).
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Op } from "sequelize";

import app from "../src/app.js";
import sequelize from "../config/database.js";
import {
    Etablissement,
    AnneeScolaire,
    Niveau,
    Classe,
    Utilisateur,
    EnseignantFormateur,
    Salle,
    Matiere,
    Enseign,
    CreneauPlanning,
} from "../src/models/index.js";

sequelize.options.logging = false;

const ETA_A = "t7j2-eta-a";
const ETA_B = "t7j2-eta-b";
const ANNEE = "T7J2-AS";
const NIVEAU = "T7J2-NIV";

const tokenFor = (role, eta_id = ETA_A) =>
    jwt.sign({ usr_id: randomUUID(), usr_login: `t7j2.${role}`, usr_role: role, eta_id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

const direction = tokenFor("direction");
const post = (body, token = direction) =>
    request(app).post("/api/v1/creneaux").set({ Authorization: `Bearer ${token}` }).send(body);

let ens1, ens2, ensInactif, ensAutreEta;
let salle1, salle2, salleSmall, salleNullCap, salleAutreEta;
let matMath, matFr;

const nettoyer = async () => {
    const matieres = await Matiere.findAll({ where: { matiere_code: { [Op.like]: "T7J2-%" } } });
    const users = await Utilisateur.findAll({ where: { usr_login: { [Op.like]: "t7j2.%" } } });
    const profs = await EnseignantFormateur.findAll({ where: { usr_id: users.map((u) => u.usr_id) } });
    const ids = profs.map((p) => p.enseignant_id);

    await CreneauPlanning.destroy({
        where: { [Op.or]: [{ code_classe: { [Op.like]: "T7J2-%" } }, { enseignant_id: ids }] },
    });
    await Enseign.destroy({
        where: { [Op.or]: [{ matiere_id: matieres.map((m) => m.matiere_id) }, { enseignant_id: ids }] },
    });
    await Classe.destroy({ where: { code_classe: { [Op.like]: "T7J2-%" } } });
    await AnneeScolaire.destroy({ where: { code_annee_scolaire: ANNEE } });
    await Niveau.destroy({ where: { code_niveau: NIVEAU } });
    await Salle.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
    await Matiere.destroy({ where: { matiere_code: { [Op.like]: "T7J2-%" } } });
    await EnseignantFormateur.destroy({ where: { usr_id: users.map((u) => u.usr_id) } });
    await Utilisateur.destroy({ where: { usr_login: { [Op.like]: "t7j2.%" } } });
    await Etablissement.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
};

const creerEtablissement = (eta_id, n) =>
    Etablissement.create({
        eta_id,
        eta_code: `T7J2-${n}`,
        eta_nom: `Établissement test ${n}`,
        eta_type: "secondaire",
        eta_adresse: "Douala",
        eta_ville: "Douala",
        eta_pays: "Cameroun",
        eta_tel: "690000000",
        eta_email: `t7j2.${n}@test.local`,
    });

const creerClasse = (code, effectif, eta_id = ETA_A) =>
    Classe.create({
        code_classe: code,
        libelle_classe: code,
        effectif_classe: effectif,
        eta_id,
        code_annee_scolaire: ANNEE,
        code_niveau: NIVEAU,
    });

const creerEnseignant = async (suffixe, { actif = true, eta_id = ETA_A, habiliteA = [] } = {}) => {
    const user = await Utilisateur.create({
        usr_id: randomUUID(),
        usr_nom: `Nom${suffixe}`,
        usr_prenom: "Prof",
        usr_email: `t7j2.${suffixe}@test.local`,
        usr_login: `t7j2.ens.${suffixe}`,
        usr_mdp_hash: "x",
        usr_role: "enseignant",
        usr_statut: "actif",
        usr_date_creation: new Date(),
        eta_id,
    });
    const prof = await EnseignantFormateur.create({ usr_id: user.usr_id, enseignant_statut: actif });
    for (const m of habiliteA) await Enseign.create({ matiere_id: m.matiere_id, enseignant_id: prof.enseignant_id });
    return prof;
};

// Corps de requête valide par défaut : lundi 08:00–10:00, classe C1, prof 1, salle 1.
const corps = (surcharge = {}) => ({
    code_classe: "T7J2-C1",
    matiere_id: matMath.matiere_id,
    enseignant_id: ens1.enseignant_id,
    salle_id: salle1.salle_id,
    plan_jour: "lundi",
    plan_heure_debut: "08:00",
    plan_heure_fin: "10:00",
    ...surcharge,
});

const viderCreneaux = () =>
    CreneauPlanning.destroy({
        where: { [Op.or]: [{ code_classe: { [Op.like]: "T7J2-%" } }, { enseignant_id: [ens1.enseignant_id, ens2.enseignant_id] }] },
    });

beforeAll(async () => {
    await nettoyer();

    await creerEtablissement(ETA_A, "A");
    await creerEtablissement(ETA_B, "B");
    await AnneeScolaire.create({
        code_annee_scolaire: ANNEE,
        date_debut_annee: "2026-09-01",
        date_fin_annee: "2027-07-31",
        eta_id: ETA_A,
    });
    await Niveau.create({ code_niveau: NIVEAU, libelle_niveau: "Niveau test" });

    await creerClasse("T7J2-C1", 20);
    await creerClasse("T7J2-C2", 20);
    await creerClasse("T7J2-BIG", 40); // 40 élèves : trop pour salleSmall (30)
    await creerClasse("T7J2-EQ", 30); // effectif = capacité de salleSmall
    await creerClasse("T7J2-CB", 10, ETA_B); // classe de l'autre établissement

    salle1 = await Salle.create({ salle_nom: "Salle 1", eta_id: ETA_A, capacite: 50 });
    salle2 = await Salle.create({ salle_nom: "Salle 2", eta_id: ETA_A, capacite: 50 });
    salleSmall = await Salle.create({ salle_nom: "Petite", eta_id: ETA_A, capacite: 30 });
    salleNullCap = await Salle.create({ salle_nom: "Sans capacité", eta_id: ETA_A, capacite: null });
    salleAutreEta = await Salle.create({ salle_nom: "Salle B", eta_id: ETA_B, capacite: 50 });

    matMath = await Matiere.create({ matiere_code: "T7J2-MATH", matiere_libelle: "Mathématiques" });
    matFr = await Matiere.create({ matiere_code: "T7J2-FR", matiere_libelle: "Français" });

    ens1 = await creerEnseignant("1", { habiliteA: [matMath] });
    ens2 = await creerEnseignant("2", { habiliteA: [matMath] });
    ensInactif = await creerEnseignant("inactif", { actif: false, habiliteA: [matMath] });
    ensAutreEta = await creerEnseignant("autreeta", { eta_id: ETA_B, habiliteA: [matMath] });
});

afterAll(async () => {
    await nettoyer();
    await sequelize.close();
});

describe("Création nominale", () => {
    beforeEach(viderCreneaux);

    test("crée un créneau, normalise le jour et les heures", async () => {
        const res = await post(corps({ plan_jour: " Lundi ", plan_heure_debut: "08:00", plan_heure_fin: "10:00:00" }));

        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({
            plan_jour: "lundi",
            plan_heure_debut: "08:00:00",
            plan_heure_fin: "10:00:00",
            plan_statut: "actif",
            code_classe: "T7J2-C1",
        });
        expect(res.body.data.plan_id).toEqual(expect.any(Number));
    });

    test("accepte exactement les bornes de la plage officielle (07:00–18:00)", async () => {
        const res = await post(corps({ plan_heure_debut: "07:00", plan_heure_fin: "18:00" }));
        expect(res.status).toBe(201);
    });

    test("accepte une salle dont la capacité n'est pas renseignée (RG-PLAN-08)", async () => {
        const res = await post(corps({ code_classe: "T7J2-BIG", salle_id: salleNullCap.salle_id }));
        expect(res.status).toBe(201);
    });

    test("accepte une capacité exactement égale à l'effectif (RG-PLAN-08)", async () => {
        const res = await post(corps({ code_classe: "T7J2-EQ", salle_id: salleSmall.salle_id }));
        expect(res.status).toBe(201);
    });
});

describe("Conflits horaires (409) — RG-PLAN-02, 03, 04", () => {
    let existant;

    // Créneau de référence : lundi 08:00–10:00, classe C1, prof 1, salle 1
    beforeEach(async () => {
        await viderCreneaux();
        existant = await CreneauPlanning.create({
            plan_jour: "lundi",
            plan_heure_debut: "08:00:00",
            plan_heure_fin: "10:00:00",
            plan_statut: "actif",
            code_classe: "T7J2-C1",
            matiere_id: matMath.matiere_id,
            enseignant_id: ens1.enseignant_id,
            salle_id: salle1.salle_id,
        });
    });

    const chevauche = { plan_heure_debut: "09:00", plan_heure_fin: "11:00" };

    test("conflit ENSEIGNANT seul", async () => {
        const res = await post(corps({ ...chevauche, code_classe: "T7J2-C2", salle_id: salle2.salle_id }));

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["enseignant"]);
    });

    test("conflit SALLE seul", async () => {
        const res = await post(corps({ ...chevauche, code_classe: "T7J2-C2", enseignant_id: ens2.enseignant_id }));

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["salle"]);
    });

    test("conflit CLASSE seul", async () => {
        const res = await post(corps({ ...chevauche, enseignant_id: ens2.enseignant_id, salle_id: salle2.salle_id }));

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["classe"]);
    });

    test("les trois conflits sont tous signalés, dans l'ordre enseignant, salle, classe", async () => {
        const res = await post(corps());

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["enseignant", "salle", "classe"]);
    });

    test("la réponse nomme le créneau en conflit (jour, heures, classe, matière, salle)", async () => {
        const res = await post(corps(chevauche));

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/lundi de 08:00 à 10:00/);
        expect(res.body.details[0]).toMatchObject({
            plan_id: existant.plan_id,
            plan_jour: "lundi",
            plan_heure_debut: "08:00:00",
            plan_heure_fin: "10:00:00",
            code_classe: "T7J2-C1",
            matiere: "Mathématiques",
            salle: "Salle 1",
        });
    });

    test.each([
        ["identique", "08:00", "10:00"],
        ["contenu dans l'existant", "08:00", "09:00"],
        ["englobant", "07:00", "11:00"],
        ["chevauchement par le début", "07:00", "09:00"],
    ])("refuse un créneau %s", async (_nom, debut, fin) => {
        const res = await post(corps({ plan_heure_debut: debut, plan_heure_fin: fin }));
        expect(res.status).toBe(409);
    });

    test("accepte des créneaux consécutifs (10:00 après 08:00–10:00, et 07:00–08:00 avant)", async () => {
        expect((await post(corps({ plan_heure_debut: "10:00", plan_heure_fin: "12:00" }))).status).toBe(201);
        expect((await post(corps({ plan_heure_debut: "07:00", plan_heure_fin: "08:00" }))).status).toBe(201);
    });

    test("accepte les mêmes heures un autre jour", async () => {
        expect((await post(corps({ plan_jour: "mardi" }))).status).toBe(201);
    });

    test("accepte les mêmes heures avec une autre classe, un autre prof et une autre salle", async () => {
        const res = await post(
            corps({ code_classe: "T7J2-C2", enseignant_id: ens2.enseignant_id, salle_id: salle2.salle_id })
        );
        expect(res.status).toBe(201);
    });

    test("un créneau ANNULÉ libère l'enseignant, la salle et la classe", async () => {
        await CreneauPlanning.update({ plan_statut: "annule" }, { where: { plan_id: existant.plan_id } });

        const res = await post(corps({ plan_heure_debut: "09:00", plan_heure_fin: "10:00" }));
        expect(res.status).toBe(201);
    });
});

describe("Règles métier (422) — RG-PLAN-05, 07, 08", () => {
    beforeEach(viderCreneaux);

    test.each([
        ["commence avant l'ouverture", "06:00", "08:00"],
        ["se termine après la fermeture", "17:00", "19:00"],
        ["entièrement le soir", "20:00", "22:00"],
    ])("RG-PLAN-05 : refuse un créneau qui %s", async (_nom, debut, fin) => {
        const res = await post(corps({ plan_heure_debut: debut, plan_heure_fin: fin }));

        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/plage horaire/);
    });

    test("RG-PLAN-07 : refuse un enseignant non habilité pour la matière", async () => {
        const res = await post(corps({ matiere_id: matFr.matiere_id }));

        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/n'est pas habilité/);
        expect(res.body.message).toMatch(/Français/);
    });

    test("RG-PLAN-08 : refuse une salle trop petite pour la classe", async () => {
        const res = await post(corps({ code_classe: "T7J2-BIG", salle_id: salleSmall.salle_id }));

        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/trop petite/);
        expect(res.body.message).toMatch(/capacité 30/);
        expect(res.body.message).toMatch(/effectif 40/);
    });

    test("refuse un enseignant inactif", async () => {
        const res = await post(corps({ enseignant_id: ensInactif.enseignant_id }));
        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/inactif/);
    });

    test("refuse une salle d'un autre établissement que celui de la classe", async () => {
        const res = await post(corps({ salle_id: salleAutreEta.salle_id }));
        expect(res.status).toBe(422);
    });

    test("refuse un enseignant d'un autre établissement que celui de la classe", async () => {
        const res = await post(corps({ enseignant_id: ensAutreEta.enseignant_id }));
        expect(res.status).toBe(422);
    });
});

describe("Références, validation et accès", () => {
    beforeEach(viderCreneaux);

    test("404 si la classe, la matière, l'enseignant ou la salle n'existent pas", async () => {
        expect((await post(corps({ code_classe: "T7J2-INCONNUE" }))).status).toBe(404);
        expect((await post(corps({ matiere_id: 99999999 }))).status).toBe(404);
        expect((await post(corps({ enseignant_id: 99999999 }))).status).toBe(404);
        expect((await post(corps({ salle_id: 99999999 }))).status).toBe(404);
    });

    test("403 si la classe appartient à un autre établissement", async () => {
        const res = await post(corps({ code_classe: "T7J2-CB", salle_id: salleAutreEta.salle_id }));
        expect(res.status).toBe(403);
    });

    test.each([
        ["jour invalide", { plan_jour: "lundis" }],
        ["heure mal formée", { plan_heure_debut: "8h" }],
        ["heure inexistante", { plan_heure_fin: "25:00" }],
        ["fin avant début", { plan_heure_debut: "10:00", plan_heure_fin: "09:00" }],
        ["durée nulle", { plan_heure_debut: "09:00", plan_heure_fin: "09:00" }],
        ["matiere_id non numérique", { matiere_id: "abc" }],
        ["salle_id négatif", { salle_id: -1 }],
    ])("400 : %s", async (_nom, surcharge) => {
        const res = await post(corps(surcharge));
        expect(res.status).toBe(400);
    });

    test.each(["code_classe", "matiere_id", "enseignant_id", "salle_id", "plan_jour", "plan_heure_debut", "plan_heure_fin"])(
        "400 si le champ %s est absent",
        async (champ) => {
            const body = corps();
            delete body[champ];
            expect((await post(body)).status).toBe(400);
        }
    );

    test("le statut ne peut pas être imposé à la création (toujours 'actif')", async () => {
        const res = await post({ ...corps(), plan_statut: "annule" });
        expect(res.status).toBe(201);
        expect(res.body.data.plan_statut).toBe("actif");
    });

    test("RBAC : enseignant et élève refusés (403), sans token (401)", async () => {
        expect((await post(corps(), tokenFor("enseignant"))).status).toBe(403);
        expect((await post(corps(), tokenFor("élève"))).status).toBe(403);
        expect((await request(app).post("/api/v1/creneaux").send(corps())).status).toBe(401);
    });

    test("le rôle personnel peut créer un créneau", async () => {
        expect((await post(corps(), tokenFor("personnel"))).status).toBe(201);
    });
});