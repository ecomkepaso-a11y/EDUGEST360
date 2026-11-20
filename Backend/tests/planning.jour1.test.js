/*
 * SEMAINE 7 — JOUR 1 : tests d'intégration (salles, matières, habilitations).
 *
 * ATTENTION : ces tests écrivent dans la base pointée par .env.
 * Ils utilisent des identifiants préfixés "t7j1" et nettoient avant/après
 * (les comptes demo.* ne sont jamais touchés).
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Op } from "sequelize";

import app from "../src/app.js";
import sequelize from "../config/database.js";
import {
    Etablissement,
    Utilisateur,
    EnseignantFormateur,
    Salle,
    Matiere,
    Enseign,
} from "../src/models/index.js";

sequelize.options.logging = false; // sinon chaque requête SQL pollue la sortie

const ETA_A = "t7j1-eta-a";
const ETA_B = "t7j1-eta-b";
const CODE_MATIERE = "T7J1-MATH";

const tokenFor = (role, eta_id = ETA_A) =>
    jwt.sign(
        { usr_id: randomUUID(), usr_login: `t7j1.${role}`, usr_role: role, eta_id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

const auth = (token) => ({ Authorization: `Bearer ${token}` });

let direction, personnel, enseignant, eleve, directionB;
let enseignantRow, enseignantInactifRow;

const nettoyer = async () => {
    const etas = [ETA_A, ETA_B];
    const matieres = await Matiere.findAll({ where: { matiere_code: { [Op.like]: "T7J1-%" } } });
    const users = await Utilisateur.findAll({ where: { usr_login: { [Op.like]: "t7j1.%" } } });
    const ens = await EnseignantFormateur.findAll({ where: { usr_id: users.map((u) => u.usr_id) } });

    await Enseign.destroy({
        where: {
            [Op.or]: [
                { matiere_id: matieres.map((m) => m.matiere_id) },
                { enseignant_id: ens.map((e) => e.enseignant_id) },
            ],
        },
    });
    await Matiere.destroy({ where: { matiere_code: { [Op.like]: "T7J1-%" } } });
    await Salle.destroy({ where: { eta_id: etas } });
    await EnseignantFormateur.destroy({ where: { usr_id: users.map((u) => u.usr_id) } });
    await Utilisateur.destroy({ where: { usr_login: { [Op.like]: "t7j1.%" } } });
    await Etablissement.destroy({ where: { eta_id: etas } });
};

const creerEtablissement = (eta_id, n) =>
    Etablissement.create({
        eta_id,
        eta_code: `T7J1-${n}`,
        eta_nom: `Établissement test ${n}`,
        eta_type: "secondaire",
        eta_adresse: "Douala",
        eta_ville: "Douala",
        eta_pays: "Cameroun",
        eta_tel: "690000000",
        eta_email: `t7j1.${n}@test.local`,
    });

const creerEnseignant = async (suffixe, actif = true) => {
    const user = await Utilisateur.create({
        usr_id: randomUUID(),
        usr_nom: "Test",
        usr_prenom: suffixe,
        usr_email: `t7j1.${suffixe}@test.local`,
        usr_login: `t7j1.ens.${suffixe}`,
        usr_mdp_hash: "x",
        usr_role: "enseignant",
        usr_statut: "actif",
        usr_date_creation: new Date(),
        eta_id: ETA_A,
    });
    return EnseignantFormateur.create({ usr_id: user.usr_id, enseignant_statut: actif });
};

beforeAll(async () => {
    await nettoyer();
    await creerEtablissement(ETA_A, "A");
    await creerEtablissement(ETA_B, "B");

    direction = tokenFor("direction");
    personnel = tokenFor("personnel");
    enseignant = tokenFor("enseignant");
    eleve = tokenFor("élève");
    directionB = tokenFor("direction", ETA_B);

    enseignantRow = await creerEnseignant("actif", true);
    enseignantInactifRow = await creerEnseignant("inactif", false);
});

afterAll(async () => {
    await nettoyer();
    await sequelize.close();
});

describe("Salles — création et contrainte UNIQUE (eta_id, salle_nom)", () => {
    test("crée une salle rattachée à l'établissement du compte", async () => {
        const res = await request(app)
            .post("/api/v1/salles")
            .set(auth(direction))
            .send({ salle_nom: "Salle 1", capacite: 40 });

        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({ salle_nom: "Salle 1", capacite: 40, eta_id: ETA_A });
        expect(res.body.data.salle_id).toEqual(expect.any(Number));
    });

    test("refuse (409) le même nom deux fois dans le MÊME établissement", async () => {
        const res = await request(app).post("/api/v1/salles").set(auth(direction)).send({ salle_nom: "Salle 1" });

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/existe déjà/);
    });

    test("accepte « Salle 1 » dans un AUTRE établissement", async () => {
        const res = await request(app)
            .post("/api/v1/salles")
            .set(auth(directionB))
            .send({ salle_nom: "Salle 1", capacite: 20 });

        expect(res.status).toBe(201);
        expect(res.body.data.eta_id).toBe(ETA_B);
    });

    test("capacité facultative : NULL accepté", async () => {
        const res = await request(app)
            .post("/api/v1/salles")
            .set(auth(personnel))
            .send({ salle_nom: "Salle sans capacité" });

        expect(res.status).toBe(201);
        expect(res.body.data.capacite).toBeNull();
    });

    test.each([
        ["capacité = 0", { salle_nom: "X", capacite: 0 }],
        ["capacité négative", { salle_nom: "X", capacite: -5 }],
        ["capacité décimale", { salle_nom: "X", capacite: 12.5 }],
        ["nom manquant", { capacite: 10 }],
        ["nom vide", { salle_nom: "   ", capacite: 10 }],
    ])("rejette (400) : %s", async (_label, body) => {
        const res = await request(app).post("/api/v1/salles").set(auth(direction)).send(body);
        expect(res.status).toBe(400);
    });

    test("un compte ne peut pas créer une salle dans un autre établissement (403)", async () => {
        const res = await request(app)
            .post("/api/v1/salles")
            .set(auth(direction))
            .send({ salle_nom: "Intruse", eta_id: ETA_B });

        expect(res.status).toBe(403);
    });
});

describe("Salles — lecture, modification, RBAC", () => {
    test("liste uniquement les salles de l'établissement du compte, triées par nom", async () => {
        const res = await request(app).get("/api/v1/salles").set(auth(enseignant));

        expect(res.status).toBe(200);
        expect(res.body.data.every((s) => s.eta_id === ETA_A)).toBe(true);
        const noms = res.body.data.map((s) => s.salle_nom);
        expect(noms).toEqual([...noms].sort((a, b) => a.localeCompare(b)));
    });

    test("modifie une salle (capacité)", async () => {
        const salle = await Salle.findOne({ where: { eta_id: ETA_A, salle_nom: "Salle 1" } });

        const res = await request(app)
            .put(`/api/v1/salles/${salle.salle_id}`)
            .set(auth(direction))
            .send({ capacite: 45 });

        expect(res.status).toBe(200);
        expect(res.body.data.capacite).toBe(45);
    });

    test("renommer vers un nom déjà pris dans l'établissement : 409", async () => {
        const salle = await Salle.findOne({ where: { eta_id: ETA_A, salle_nom: "Salle sans capacité" } });

        const res = await request(app)
            .put(`/api/v1/salles/${salle.salle_id}`)
            .set(auth(direction))
            .send({ salle_nom: "Salle 1" });

        expect(res.status).toBe(409);
    });

    test("ne peut pas modifier la salle d'un autre établissement (403)", async () => {
        const salleB = await Salle.findOne({ where: { eta_id: ETA_B, salle_nom: "Salle 1" } });

        const res = await request(app)
            .put(`/api/v1/salles/${salleB.salle_id}`)
            .set(auth(direction))
            .send({ capacite: 99 });

        expect(res.status).toBe(403);
    });

    test("eta_id n'est pas modifiable (champ ignoré, la salle reste dans son établissement)", async () => {
        const salle = await Salle.findOne({ where: { eta_id: ETA_A, salle_nom: "Salle 1" } });

        const res = await request(app)
            .put(`/api/v1/salles/${salle.salle_id}`)
            .set(auth(direction))
            .send({ capacite: 46, eta_id: ETA_B });

        expect(res.status).toBe(200);
        expect(res.body.data.eta_id).toBe(ETA_A);
    });

    test("salle inconnue : 404 ; identifiant invalide : 400 ; corps vide : 400", async () => {
        expect((await request(app).put("/api/v1/salles/99999999").set(auth(direction)).send({ capacite: 5 })).status).toBe(404);
        expect((await request(app).put("/api/v1/salles/abc").set(auth(direction)).send({ capacite: 5 })).status).toBe(400);
        expect((await request(app).put("/api/v1/salles/1").set(auth(direction)).send({})).status).toBe(400);
    });

    test("RBAC : enseignant et élève ne peuvent pas créer/modifier (403), sans token : 401", async () => {
        expect((await request(app).post("/api/v1/salles").set(auth(enseignant)).send({ salle_nom: "Z" })).status).toBe(403);
        expect((await request(app).post("/api/v1/salles").set(auth(eleve)).send({ salle_nom: "Z" })).status).toBe(403);
        expect((await request(app).put("/api/v1/salles/1").set(auth(enseignant)).send({ capacite: 5 })).status).toBe(403);
        expect((await request(app).get("/api/v1/salles").set(auth(eleve))).status).toBe(403);
        expect((await request(app).get("/api/v1/salles")).status).toBe(401);
    });
});

describe("Matières et habilitations (RG-PLAN-07)", () => {
    let matiereId;

    test("crée une matière (code normalisé en majuscules)", async () => {
        const res = await request(app)
            .post("/api/v1/matieres")
            .set(auth(direction))
            .send({ matiere_code: ` ${CODE_MATIERE.toLowerCase()} `, matiere_libelle: "Mathématiques test" });

        expect(res.status).toBe(201);
        expect(res.body.data.matiere_code).toBe(CODE_MATIERE);
        matiereId = res.body.data.matiere_id;
    });

    test("code de matière en double : 409", async () => {
        const res = await request(app)
            .post("/api/v1/matieres")
            .set(auth(direction))
            .send({ matiere_code: CODE_MATIERE, matiere_libelle: "Doublon" });

        expect(res.status).toBe(409);
    });

    test("code invalide (caractères interdits) : 400", async () => {
        const res = await request(app)
            .post("/api/v1/matieres")
            .set(auth(direction))
            .send({ matiere_code: "MA TH!", matiere_libelle: "X" });

        expect(res.status).toBe(400);
    });

    test("habilite un enseignant : 201, puis 200 si déjà habilité (idempotent, pas de doublon)", async () => {
        const url = `/api/v1/matieres/${matiereId}/enseignants/${enseignantRow.enseignant_id}`;

        const premier = await request(app).post(url).set(auth(personnel));
        expect(premier.status).toBe(201);

        const second = await request(app).post(url).set(auth(personnel));
        expect(second.status).toBe(200);

        const nb = await Enseign.count({ where: { matiere_id: matiereId, enseignant_id: enseignantRow.enseignant_id } });
        expect(nb).toBe(1);
    });

    test("matière ou enseignant inconnus : 404 ; identifiants invalides : 400", async () => {
        expect((await request(app).post(`/api/v1/matieres/99999999/enseignants/${enseignantRow.enseignant_id}`).set(auth(direction))).status).toBe(404);
        expect((await request(app).post(`/api/v1/matieres/${matiereId}/enseignants/99999999`).set(auth(direction))).status).toBe(404);
        expect((await request(app).post(`/api/v1/matieres/abc/enseignants/1`).set(auth(direction))).status).toBe(400);
    });

    test("enseignant inactif : 409", async () => {
        const res = await request(app)
            .post(`/api/v1/matieres/${matiereId}/enseignants/${enseignantInactifRow.enseignant_id}`)
            .set(auth(direction));

        expect(res.status).toBe(409);
    });

    test("direction d'un autre établissement ne peut pas habiliter cet enseignant (403)", async () => {
        const res = await request(app)
            .post(`/api/v1/matieres/${matiereId}/enseignants/${enseignantRow.enseignant_id}`)
            .set(auth(directionB));

        expect(res.status).toBe(403);
    });

    test("RBAC : un enseignant ne peut ni créer de matière ni habiliter (403)", async () => {
        expect((await request(app).post("/api/v1/matieres").set(auth(enseignant)).send({ matiere_code: "T7J1-X", matiere_libelle: "X" })).status).toBe(403);
        expect((await request(app).post(`/api/v1/matieres/${matiereId}/enseignants/${enseignantRow.enseignant_id}`).set(auth(enseignant))).status).toBe(403);
    });
});