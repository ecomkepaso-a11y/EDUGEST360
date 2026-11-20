/*
 * SEMAINE 7 — JOUR 3 : simulation de créneau (POST /api/v1/creneaux/verifier).
 * La simulation explique TOUS les problèmes et conflits, sans rien enregistrer,
 * et ne doit jamais contredire la création réelle.
 *
 * ATTENTION : écrit dans la base pointée par .env. Tout est préfixé "t7j3s"
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
jest.setTimeout(60000);

const ETA_A = "t7j3s-eta-a";
const ETA_B = "t7j3s-eta-b";
const ANNEE = "T7J3S-AS";
const NIVEAU = "T7J3S-NIV";

const tokenFor = (role, eta_id = ETA_A) =>
    jwt.sign({ usr_id: randomUUID(), usr_login: `t7j3s.${role}`, usr_role: role, eta_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

const direction = tokenFor("direction");
const avec = (req, token) => req.set({ Authorization: `Bearer ${token}` });
const verifier = (body, token = direction) => avec(request(app).post("/api/v1/creneaux/verifier"), token).send(body);
const creer = (body, token = direction) => avec(request(app).post("/api/v1/creneaux"), token).send(body);

let ens1, ens2, ensInactif;
let salle1, salle2, salleSmall;
let matMath, matFr;

const nettoyer = async () => {
    const users = await Utilisateur.findAll({ where: { usr_login: { [Op.like]: "t7j3s.%" } } });
    const ids = (await EnseignantFormateur.findAll({ where: { usr_id: users.map((u) => u.usr_id) } })).map((p) => p.enseignant_id);
    const mats = await Matiere.findAll({ where: { matiere_code: { [Op.like]: "T7J3S-%" } } });

    await CreneauPlanning.destroy({ where: { [Op.or]: [{ code_classe: { [Op.like]: "T7J3S-%" } }, { enseignant_id: ids }] } });
    await Enseign.destroy({ where: { [Op.or]: [{ matiere_id: mats.map((m) => m.matiere_id) }, { enseignant_id: ids }] } });
    await Classe.destroy({ where: { code_classe: { [Op.like]: "T7J3S-%" } } });
    await AnneeScolaire.destroy({ where: { code_annee_scolaire: ANNEE } });
    await Niveau.destroy({ where: { code_niveau: NIVEAU } });
    await Salle.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
    await Matiere.destroy({ where: { matiere_code: { [Op.like]: "T7J3S-%" } } });
    await EnseignantFormateur.destroy({ where: { usr_id: users.map((u) => u.usr_id) } });
    await Utilisateur.destroy({ where: { usr_login: { [Op.like]: "t7j3s.%" } } });
    await Etablissement.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
};

const etablissement = (eta_id, n) =>
    Etablissement.create({
        eta_id, eta_code: `T7J3S-${n}`, eta_nom: `Établissement ${n}`, eta_type: "secondaire",
        eta_adresse: "Douala", eta_ville: "Douala", eta_pays: "Cameroun", eta_tel: "690000000", eta_email: `t7j3s.${n}@test.local`,
    });

const classe = (code, effectif, eta_id = ETA_A) =>
    Classe.create({ code_classe: code, libelle_classe: code, effectif_classe: effectif, eta_id, code_annee_scolaire: ANNEE, code_niveau: NIVEAU });

const enseignant = async (suffixe, { actif = true, habilites = [] } = {}) => {
    const user = await Utilisateur.create({
        usr_id: randomUUID(), usr_nom: `Nom${suffixe}`, usr_prenom: "Prof", usr_email: `t7j3s.${suffixe}@test.local`,
        usr_login: `t7j3s.ens.${suffixe}`, usr_mdp_hash: "x", usr_role: "enseignant", usr_statut: "actif",
        usr_date_creation: new Date(), eta_id: ETA_A,
    });
    const prof = await EnseignantFormateur.create({ usr_id: user.usr_id, enseignant_statut: actif });
    for (const m of habilites) await Enseign.create({ matiere_id: m.matiere_id, enseignant_id: prof.enseignant_id });
    return prof;
};

// Demande valide par défaut : lundi 08:00–10:00, classe C1, prof 1, salle 1
const corps = (surcharge = {}) => ({
    code_classe: "T7J3S-C1",
    matiere_id: matMath.matiere_id,
    enseignant_id: ens1.enseignant_id,
    salle_id: salle1.salle_id,
    plan_jour: "lundi",
    plan_heure_debut: "08:00",
    plan_heure_fin: "10:00",
    ...surcharge,
});

// Crée un créneau existant directement en base
const existant = ({ classe: c = "T7J3S-C1", prof = ens1, salle = salle1, jour = "lundi", debut = "08:00:00", fin = "10:00:00", statut = "actif" } = {}) =>
    CreneauPlanning.create({
        plan_jour: jour, plan_heure_debut: debut, plan_heure_fin: fin, plan_statut: statut,
        code_classe: c, matiere_id: matMath.matiere_id, enseignant_id: prof.enseignant_id, salle_id: salle.salle_id,
    });

const compterCreneaux = () => CreneauPlanning.count({ where: { code_classe: { [Op.like]: "T7J3S-%" } } });
const viderCreneaux = () => CreneauPlanning.destroy({ where: { code_classe: { [Op.like]: "T7J3S-%" } } });

beforeAll(async () => {
    await nettoyer();
    await etablissement(ETA_A, "A");
    await etablissement(ETA_B, "B");
    await AnneeScolaire.create({ code_annee_scolaire: ANNEE, date_debut_annee: "2026-09-01", date_fin_annee: "2027-07-31", eta_id: ETA_A });
    await Niveau.create({ code_niveau: NIVEAU, libelle_niveau: "Niveau test" });

    await classe("T7J3S-C1", 20);
    await classe("T7J3S-C2", 20);
    await classe("T7J3S-BIG", 40);
    await classe("T7J3S-CB", 10, ETA_B);

    salle1 = await Salle.create({ salle_nom: "Salle 1", eta_id: ETA_A, capacite: 50 });
    salle2 = await Salle.create({ salle_nom: "Salle 2", eta_id: ETA_A, capacite: 50 });
    salleSmall = await Salle.create({ salle_nom: "Petite", eta_id: ETA_A, capacite: 30 });

    matMath = await Matiere.create({ matiere_code: "T7J3S-MATH", matiere_libelle: "Mathématiques" });
    matFr = await Matiere.create({ matiere_code: "T7J3S-FR", matiere_libelle: "Français" });

    ens1 = await enseignant("1", { habilites: [matMath] });
    ens2 = await enseignant("2", { habilites: [matMath] });
    ensInactif = await enseignant("inactif", { actif: false, habilites: [matMath] });
});

afterAll(async () => {
    await nettoyer();
    await sequelize.close();
});

beforeEach(viderCreneaux);

describe("Simulation — créneau possible", () => {
    test("un créneau libre est déclaré possible, sans problème ni conflit", async () => {
        const res = await verifier(corps());

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/est possible/);
        expect(res.body.data).toEqual({ valide: true, problemes: [], conflits: [] });
    });

    test("n'ENREGISTRE RIEN, même quand le créneau est valide", async () => {
        const avant = await compterCreneaux();

        await verifier(corps());
        await verifier(corps({ plan_jour: "mardi" }));

        expect(await compterCreneaux()).toBe(avant);
    });

    test("n'enregistre rien non plus quand il y a des conflits", async () => {
        await existant();
        const avant = await compterCreneaux();

        await verifier(corps());

        expect(await compterCreneaux()).toBe(avant);
    });

    test("des créneaux consécutifs ne sont pas en conflit", async () => {
        await existant({ debut: "08:00:00", fin: "10:00:00" });
        const res = await verifier(corps({ plan_heure_debut: "10:00", plan_heure_fin: "12:00" }));

        expect(res.body.data.valide).toBe(true);
    });

    test("un créneau ANNULÉ ne génère aucun conflit", async () => {
        await existant({ statut: "annule" });
        const res = await verifier(corps());

        expect(res.body.data.valide).toBe(true);
    });

    test("accepte les heures au format HH:MM et normalise le jour", async () => {
        const res = await verifier(corps({ plan_jour: " Lundi ", plan_heure_debut: "08:00", plan_heure_fin: "09:30:00" }));

        expect(res.status).toBe(200);
        expect(res.body.data.valide).toBe(true);
    });
});

describe("Simulation — conflits horaires", () => {
    test("conflit ENSEIGNANT : réponse 200, valide=false, créneau bloquant détaillé", async () => {
        const bloquant = await existant({ classe: "T7J3S-C2", salle: salle2, prof: ens1 });
        const res = await verifier(corps({ plan_heure_debut: "09:00", plan_heure_fin: "11:00" }));

        expect(res.status).toBe(200); // la simulation a réussi : le RÉSULTAT est « impossible »
        expect(res.body.message).toMatch(/n'est pas possible \(1 problème\)/);
        expect(res.body.data.valide).toBe(false);
        expect(res.body.data.problemes).toEqual([]);
        expect(res.body.data.conflits).toHaveLength(1);
        expect(res.body.data.conflits[0]).toMatchObject({
            type: "enseignant",
            regle: "RG-PLAN-02",
            plan_id: bloquant.plan_id,
            plan_jour: "lundi",
            plan_heure_debut: "08:00:00",
            plan_heure_fin: "10:00:00",
            code_classe: "T7J3S-C2",
            matiere: "Mathématiques",
            salle: "Salle 2",
        });
        expect(res.body.data.conflits[0].message).toMatch(/lundi de 08:00 à 10:00/);
    });

    test("conflit SALLE seul", async () => {
        await existant({ classe: "T7J3S-C2", prof: ens2, salle: salle1 });
        const res = await verifier(corps());

        expect(res.body.data.conflits.map((c) => [c.type, c.regle])).toEqual([["salle", "RG-PLAN-03"]]);
    });

    test("conflit CLASSE seul", async () => {
        await existant({ classe: "T7J3S-C1", prof: ens2, salle: salle2 });
        const res = await verifier(corps());

        expect(res.body.data.conflits.map((c) => [c.type, c.regle])).toEqual([["classe", "RG-PLAN-04"]]);
    });

    test("les trois conflits sont listés ensemble, dans l'ordre enseignant, salle, classe", async () => {
        await existant();
        const res = await verifier(corps());

        expect(res.body.message).toMatch(/\(3 problèmes\)/);
        expect(res.body.data.conflits.map((c) => c.type)).toEqual(["enseignant", "salle", "classe"]);
    });

    test("plusieurs créneaux bloquants différents sont tous listés", async () => {
        await existant({ classe: "T7J3S-C2", prof: ens1, salle: salle2, debut: "08:00:00", fin: "09:00:00" });
        await existant({ classe: "T7J3S-BIG", prof: ens2, salle: salle1, debut: "09:00:00", fin: "10:00:00" });

        const res = await verifier(corps());
        const types = res.body.data.conflits.map((c) => c.type);

        expect(types).toContain("enseignant");
        expect(types).toContain("salle");
    });
});

describe("Simulation — règles métier violées, tout est expliqué d'un coup", () => {
    test("RG-PLAN-05 : hors plage horaire", async () => {
        const res = await verifier(corps({ plan_heure_debut: "17:00", plan_heure_fin: "19:00" }));

        expect(res.status).toBe(200);
        expect(res.body.data.valide).toBe(false);
        expect(res.body.data.problemes).toEqual([
            expect.objectContaining({ code: "HORS_PLAGE_HORAIRE", regle: "RG-PLAN-05" }),
        ]);
    });

    test("RG-PLAN-07 : enseignant non habilité", async () => {
        const res = await verifier(corps({ matiere_id: matFr.matiere_id }));

        expect(res.body.data.problemes.map((p) => [p.code, p.regle])).toEqual([["ENSEIGNANT_NON_HABILITE", "RG-PLAN-07"]]);
        expect(res.body.data.problemes[0].message).toMatch(/Français/);
    });

    test("RG-PLAN-08 : salle trop petite", async () => {
        const res = await verifier(corps({ code_classe: "T7J3S-BIG", salle_id: salleSmall.salle_id }));

        expect(res.body.data.problemes.map((p) => [p.code, p.regle])).toEqual([["SALLE_TROP_PETITE", "RG-PLAN-08"]]);
    });

    test("enseignant inactif", async () => {
        const res = await verifier(corps({ enseignant_id: ensInactif.enseignant_id }));
        expect(res.body.data.problemes.map((p) => p.code)).toEqual(["ENSEIGNANT_INACTIF"]);
    });

    test("TOUT EN MÊME TEMPS : hors plage + non habilité + salle trop petite + conflit enseignant", async () => {
        // Le professeur est déjà pris de 17:00 à 18:00 ; on demande 17:00–19:00 en Français, classe de 40, salle de 30
        await existant({ classe: "T7J3S-C2", prof: ens1, salle: salle2, debut: "17:00:00", fin: "18:00:00" });

        const res = await verifier(
            corps({
                code_classe: "T7J3S-BIG",
                matiere_id: matFr.matiere_id,
                salle_id: salleSmall.salle_id,
                plan_heure_debut: "17:00",
                plan_heure_fin: "19:00",
            })
        );

        expect(res.status).toBe(200);
        expect(res.body.data.valide).toBe(false);
        expect(res.body.data.problemes.map((p) => p.code).sort()).toEqual(
            ["ENSEIGNANT_NON_HABILITE", "HORS_PLAGE_HORAIRE", "SALLE_TROP_PETITE"].sort()
        );
        expect(res.body.data.conflits.map((c) => c.type)).toEqual(["enseignant"]);
        expect(res.body.message).toMatch(/\(4 problèmes\)/);
    });

    test("références introuvables : toutes signalées, sans lever d'erreur 404", async () => {
        const res = await verifier(corps({ code_classe: "T7J3S-INCONNUE", salle_id: 99999999 }));

        expect(res.status).toBe(200);
        expect(res.body.data.valide).toBe(false);
        expect(res.body.data.problemes.map((p) => p.code).sort()).toEqual(["CLASSE_INTROUVABLE", "SALLE_INTROUVABLE"]);
        expect(res.body.data.conflits).toEqual([]); // pas de recherche de conflits sans références valides
    });
});

describe("Simulation — modification d'un créneau existant (plan_id)", () => {
    test("sans plan_id, un créneau déplacé dans sa propre plage entre en conflit avec lui-même", async () => {
        await existant();
        const res = await verifier(corps({ plan_heure_debut: "08:30", plan_heure_fin: "10:30" }));

        expect(res.body.data.valide).toBe(false);
    });

    test("avec plan_id, le créneau est exclu de la détection : la modification est possible", async () => {
        const c = await existant();
        const res = await verifier(corps({ plan_id: c.plan_id, plan_heure_debut: "08:30", plan_heure_fin: "10:30" }));

        expect(res.body.data).toEqual({ valide: true, problemes: [], conflits: [] });
    });

    test("avec plan_id, les AUTRES créneaux restent bloquants", async () => {
        const c = await existant({ classe: "T7J3S-C1", prof: ens1, salle: salle1, debut: "08:00:00", fin: "09:00:00" });
        await existant({ classe: "T7J3S-C2", prof: ens1, salle: salle2, debut: "10:00:00", fin: "11:00:00" });

        const res = await verifier(corps({ plan_id: c.plan_id, plan_heure_debut: "10:00", plan_heure_fin: "11:00" }));

        expect(res.body.data.valide).toBe(false);
        expect(res.body.data.conflits.map((x) => x.type)).toEqual(["enseignant"]);
    });
});

describe("Simulation — cohérence avec la création réelle", () => {
    test.each([
        ["créneau libre", async () => {}, {}, 201],
        ["conflit enseignant", async () => existant({ classe: "T7J3S-C2", salle: salle2, prof: ens1 }), {}, 409],
        ["conflit salle", async () => existant({ classe: "T7J3S-C2", salle: salle1, prof: ens2 }), {}, 409],
        ["conflit classe", async () => existant({ classe: "T7J3S-C1", salle: salle2, prof: ens2 }), {}, 409],
        ["hors plage", async () => {}, { plan_heure_debut: "06:00", plan_heure_fin: "08:00" }, 422],
        ["non habilité", async () => {}, { matiere_id: "FR" }, 422],
        ["salle trop petite", async () => {}, { code_classe: "T7J3S-BIG", salle_id: "SMALL" }, 422],
        ["enseignant inactif", async () => {}, { enseignant_id: "INACTIF" }, 422],
        ["classe inconnue", async () => {}, { code_classe: "T7J3S-INCONNUE" }, 404],
    ])("%s : la simulation et la création sont d'accord", async (_nom, preparer, surcharge, statutAttendu) => {
        await preparer();

        const demande = corps(surcharge);
        if (demande.matiere_id === "FR") demande.matiere_id = matFr.matiere_id;
        if (demande.salle_id === "SMALL") demande.salle_id = salleSmall.salle_id;
        if (demande.enseignant_id === "INACTIF") demande.enseignant_id = ensInactif.enseignant_id;

        const simulation = await verifier(demande);
        const reelle = await creer(demande);

        expect(reelle.status).toBe(statutAttendu);
        expect(simulation.body.data.valide).toBe(statutAttendu === 201);
    });
});

describe("Simulation — validation, accès et charge", () => {
    test.each([
        ["jour invalide", { plan_jour: "lundis" }],
        ["heure mal formée", { plan_heure_debut: "8h" }],
        ["fin avant début", { plan_heure_debut: "10:00", plan_heure_fin: "09:00" }],
        ["matiere_id non numérique", { matiere_id: "abc" }],
        ["plan_id négatif", { plan_id: -1 }],
    ])("400 : %s", async (_nom, surcharge) => {
        expect((await verifier(corps(surcharge))).status).toBe(400);
    });

    test.each(["code_classe", "matiere_id", "enseignant_id", "salle_id", "plan_jour", "plan_heure_debut", "plan_heure_fin"])(
        "400 si le champ %s est absent",
        async (champ) => {
            const body = corps();
            delete body[champ];
            expect((await verifier(body)).status).toBe(400);
        }
    );

    test("403 si la classe appartient à un autre établissement", async () => {
        expect((await verifier(corps({ code_classe: "T7J3S-CB" }))).status).toBe(403);
    });

    test("RBAC : enseignant et élève refusés (403), sans token (401), personnel accepté", async () => {
        expect((await verifier(corps(), tokenFor("enseignant"))).status).toBe(403);
        expect((await verifier(corps(), tokenFor("élève"))).status).toBe(403);
        expect((await request(app).post("/api/v1/creneaux/verifier").send(corps())).status).toBe(401);
        expect((await verifier(corps(), tokenFor("personnel"))).status).toBe(200);
    });

    test("30 simulations en parallèle pendant des créations : aucune erreur serveur, aucun interblocage", async () => {
        const demandes = [];
        for (let i = 0; i < 30; i++) demandes.push(verifier(corps({ plan_heure_debut: "08:00", plan_heure_fin: "10:00" })));
        for (let i = 0; i < 5; i++) demandes.push(creer(corps({ plan_heure_debut: `1${i}:00`, plan_heure_fin: `1${i}:30` })));

        const reponses = await Promise.all(demandes);

        expect(reponses.filter((r) => r.status >= 500)).toEqual([]);
        expect(reponses.slice(0, 30).every((r) => r.status === 200)).toBe(true);
    });
});