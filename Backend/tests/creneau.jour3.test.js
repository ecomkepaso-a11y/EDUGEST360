/*
 * SEMAINE 7 — JOUR 3 : modification et annulation d'un créneau.
 * Couvre : mêmes contrôles qu'à la création, exclusion du créneau lui-même,
 * annulation (statut, pas de suppression), libération des ressources,
 * et courses critiques (modifications simultanées, modification + annulation,
 * échange de ressources dans les deux sens).
 *
 * ATTENTION : écrit dans la base pointée par .env. Tout est préfixé "t7j3b"
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

const ETA_A = "t7j3b-eta-a";
const ETA_B = "t7j3b-eta-b";
const ANNEE = "T7J3B-AS";
const NIVEAU = "T7J3B-NIV";
const NB = 10; // classes et salles disponibles pour les courses

const tokenFor = (role, eta_id = ETA_A) =>
    jwt.sign({ usr_id: randomUUID(), usr_login: `t7j3b.${role}`, usr_role: role, eta_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

const direction = tokenFor("direction");
const avec = (req, token) => req.set({ Authorization: `Bearer ${token}` });
const post = (body, token = direction) => avec(request(app).post("/api/v1/creneaux"), token).send(body);
const put = (id, body, token = direction) => avec(request(app).put(`/api/v1/creneaux/${id}`), token).send(body);
const del = (id, token = direction) => avec(request(app).delete(`/api/v1/creneaux/${id}`), token);

let classes = [];
let salles = [];
let profs = [];
let salleSmall, matMath, matFr, classeB, salleB;

const nettoyer = async () => {
    const users = await Utilisateur.findAll({ where: { usr_login: { [Op.like]: "t7j3b.%" } } });
    const ids = (await EnseignantFormateur.findAll({ where: { usr_id: users.map((u) => u.usr_id) } })).map((p) => p.enseignant_id);
    const mats = await Matiere.findAll({ where: { matiere_code: { [Op.like]: "T7J3B-%" } } });

    await CreneauPlanning.destroy({ where: { [Op.or]: [{ code_classe: { [Op.like]: "T7J3B-%" } }, { enseignant_id: ids }] } });
    await Enseign.destroy({ where: { [Op.or]: [{ matiere_id: mats.map((m) => m.matiere_id) }, { enseignant_id: ids }] } });
    await Classe.destroy({ where: { code_classe: { [Op.like]: "T7J3B-%" } } });
    await AnneeScolaire.destroy({ where: { code_annee_scolaire: ANNEE } });
    await Niveau.destroy({ where: { code_niveau: NIVEAU } });
    await Salle.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
    await Matiere.destroy({ where: { matiere_code: { [Op.like]: "T7J3B-%" } } });
    await EnseignantFormateur.destroy({ where: { usr_id: users.map((u) => u.usr_id) } });
    await Utilisateur.destroy({ where: { usr_login: { [Op.like]: "t7j3b.%" } } });
    await Etablissement.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
};

const etablissement = (eta_id, n) =>
    Etablissement.create({
        eta_id, eta_code: `T7J3B-${n}`, eta_nom: `Établissement ${n}`, eta_type: "secondaire",
        eta_adresse: "Douala", eta_ville: "Douala", eta_pays: "Cameroun", eta_tel: "690000000", eta_email: `t7j3b.${n}@test.local`,
    });

const classe = (code, effectif, eta_id = ETA_A) =>
    Classe.create({ code_classe: code, libelle_classe: code, effectif_classe: effectif, eta_id, code_annee_scolaire: ANNEE, code_niveau: NIVEAU });

const enseignant = async (suffixe, habilites) => {
    const user = await Utilisateur.create({
        usr_id: randomUUID(), usr_nom: `Nom${suffixe}`, usr_prenom: "Prof", usr_email: `t7j3b.${suffixe}@test.local`,
        usr_login: `t7j3b.ens.${suffixe}`, usr_mdp_hash: "x", usr_role: "enseignant", usr_statut: "actif",
        usr_date_creation: new Date(), eta_id: ETA_A,
    });
    const prof = await EnseignantFormateur.create({ usr_id: user.usr_id });
    for (const m of habilites) await Enseign.create({ matiere_id: m.matiere_id, enseignant_id: prof.enseignant_id });
    return prof;
};

// Crée directement un créneau en base (hors API) : indices dans classes[] / salles[] / profs[]
const creer = ({ classe: c = 0, salle: s = 0, prof: p = 0, jour = "lundi", debut = "08:00:00", fin = "10:00:00", statut = "actif" } = {}) =>
    CreneauPlanning.create({
        plan_jour: jour, plan_heure_debut: debut, plan_heure_fin: fin, plan_statut: statut,
        code_classe: classes[c].code_classe, matiere_id: matMath.matiere_id,
        enseignant_id: profs[p].enseignant_id, salle_id: salles[s].salle_id,
    });

const recharger = (plan_id) => CreneauPlanning.findByPk(plan_id, { raw: true });
const viderCreneaux = () =>
    CreneauPlanning.destroy({
        where: { [Op.or]: [{ code_classe: { [Op.like]: "T7J3B-%" } }, { enseignant_id: profs.map((p) => p.enseignant_id) }] },
    });

beforeAll(async () => {
    await nettoyer();
    await etablissement(ETA_A, "A");
    await etablissement(ETA_B, "B");
    await AnneeScolaire.create({ code_annee_scolaire: ANNEE, date_debut_annee: "2026-09-01", date_fin_annee: "2027-07-31", eta_id: ETA_A });
    await Niveau.create({ code_niveau: NIVEAU, libelle_niveau: "Niveau test" });

    matMath = await Matiere.create({ matiere_code: "T7J3B-MATH", matiere_libelle: "Mathématiques" });
    matFr = await Matiere.create({ matiere_code: "T7J3B-FR", matiere_libelle: "Français" });

    for (let i = 0; i < NB; i++) {
        classes.push(await classe(`T7J3B-C${i}`, 20));
        salles.push(await Salle.create({ salle_nom: `Salle ${i}`, eta_id: ETA_A, capacite: 50 }));
    }
    salleSmall = await Salle.create({ salle_nom: "Petite", eta_id: ETA_A, capacite: 10 });
    classeB = await classe("T7J3B-CB", 10, ETA_B);
    salleB = await Salle.create({ salle_nom: "Salle B", eta_id: ETA_B, capacite: 50 });

    for (let i = 0; i < 3; i++) profs.push(await enseignant(String(i), [matMath]));
});

afterAll(async () => {
    await nettoyer();
    await sequelize.close();
});

beforeEach(viderCreneaux);

describe("PUT /creneaux/:id — modification", () => {
    test("modifie les heures et enregistre le changement", async () => {
        const c = await creer();
        const res = await put(c.plan_id, { plan_heure_debut: "09:00", plan_heure_fin: "11:00" });

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({ plan_id: c.plan_id, plan_heure_debut: "09:00:00", plan_heure_fin: "11:00:00" });
        expect(await recharger(c.plan_id)).toMatchObject({ plan_heure_debut: "09:00:00", plan_heure_fin: "11:00:00" });
    });

    test("modification partielle : les champs non envoyés sont conservés", async () => {
        const c = await creer();
        const res = await put(c.plan_id, { salle_id: salles[1].salle_id });

        expect(res.status).toBe(200);
        expect(await recharger(c.plan_id)).toMatchObject({
            salle_id: salles[1].salle_id,
            code_classe: c.code_classe,
            enseignant_id: c.enseignant_id,
            plan_jour: "lundi",
            plan_heure_debut: "08:00:00",
        });
    });

    test("normalise le jour envoyé", async () => {
        const c = await creer();
        const res = await put(c.plan_id, { plan_jour: " Mardi " });
        expect(res.status).toBe(200);
        expect(res.body.data.plan_jour).toBe("mardi");
    });

    test("un créneau n'entre pas en conflit avec LUI-MÊME (décalage de 30 min dans sa propre plage)", async () => {
        const c = await creer({ debut: "08:00:00", fin: "10:00:00" });
        const res = await put(c.plan_id, { plan_heure_debut: "08:30", plan_heure_fin: "10:30" });
        expect(res.status).toBe(200);
    });

    test("renvoyer exactement les mêmes valeurs est accepté", async () => {
        const c = await creer();
        const res = await put(c.plan_id, { plan_heure_debut: "08:00", plan_heure_fin: "10:00" });
        expect(res.status).toBe(200);
    });

    test("conflit ENSEIGNANT avec un autre créneau : 409 + détail", async () => {
        const autre = await creer({ classe: 1, salle: 1, prof: 0, debut: "10:00:00", fin: "12:00:00" });
        const c = await creer({ classe: 0, salle: 0, prof: 0, debut: "08:00:00", fin: "09:00:00" });

        const res = await put(c.plan_id, { plan_heure_debut: "11:00", plan_heure_fin: "12:00" });

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["enseignant"]);
        expect(res.body.details[0].plan_id).toBe(autre.plan_id);
        expect((await recharger(c.plan_id)).plan_heure_debut).toBe("08:00:00"); // rien n'a changé
    });

    test("conflit SALLE : changer de salle vers une salle déjà occupée : 409", async () => {
        await creer({ classe: 1, salle: 1, prof: 1 });
        const c = await creer({ classe: 0, salle: 0, prof: 0 });

        const res = await put(c.plan_id, { salle_id: salles[1].salle_id });

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["salle"]);
    });

    test("conflit ENSEIGNANT : changer d'enseignant vers un enseignant déjà occupé : 409", async () => {
        await creer({ classe: 1, salle: 1, prof: 1 });
        const c = await creer({ classe: 0, salle: 0, prof: 0 });

        const res = await put(c.plan_id, { enseignant_id: profs[1].enseignant_id });

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["enseignant"]);
    });

    test("conflit CLASSE : changer de classe vers une classe déjà occupée : 409", async () => {
        await creer({ classe: 1, salle: 1, prof: 1 });
        const c = await creer({ classe: 0, salle: 0, prof: 0 });

        const res = await put(c.plan_id, { code_classe: classes[1].code_classe });

        expect(res.status).toBe(409);
        expect(res.body.details.map((d) => d.type)).toEqual(["classe"]);
    });

    test("un créneau ANNULÉ ne bloque pas la modification", async () => {
        await creer({ classe: 1, salle: 1, prof: 1, statut: "annule" });
        const c = await creer({ classe: 0, salle: 0, prof: 0 });

        const res = await put(c.plan_id, { enseignant_id: profs[1].enseignant_id, salle_id: salles[1].salle_id, code_classe: classes[1].code_classe });
        expect(res.status).toBe(200);
    });

    test("des créneaux consécutifs sont acceptés après modification", async () => {
        await creer({ classe: 1, salle: 1, prof: 0, debut: "10:00:00", fin: "12:00:00" });
        const c = await creer({ classe: 0, salle: 0, prof: 0, debut: "08:00:00", fin: "09:00:00" });

        const res = await put(c.plan_id, { plan_heure_debut: "08:00", plan_heure_fin: "10:00" });
        expect(res.status).toBe(200);
    });

    test("RG-PLAN-05 : refuse (422) une modification hors plage horaire", async () => {
        const c = await creer();
        const res = await put(c.plan_id, { plan_heure_debut: "17:00", plan_heure_fin: "19:00" });
        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/plage horaire/);
    });

    test("RG-PLAN-07 : refuse (422) une matière pour laquelle l'enseignant n'est pas habilité", async () => {
        const c = await creer();
        const res = await put(c.plan_id, { matiere_id: matFr.matiere_id });
        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/n'est pas habilité/);
    });

    test("RG-PLAN-08 : refuse (422) une salle trop petite", async () => {
        const c = await creer();
        const res = await put(c.plan_id, { salle_id: salleSmall.salle_id });
        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/trop petite/);
    });

    test("refuse un créneau annulé (422)", async () => {
        const c = await creer({ statut: "annule" });
        const res = await put(c.plan_id, { plan_heure_debut: "09:00", plan_heure_fin: "11:00" });
        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/annulé/);
    });

    test.each([
        ["corps vide", {}],
        ["fin avant début (les deux envoyées)", { plan_heure_debut: "10:00", plan_heure_fin: "09:00" }],
        ["jour invalide", { plan_jour: "lundis" }],
        ["heure mal formée", { plan_heure_debut: "8h" }],
        ["salle_id négatif", { salle_id: -3 }],
    ])("400 : %s", async (_nom, corps) => {
        const c = await creer();
        expect((await put(c.plan_id, corps)).status).toBe(400);
    });

    test("400 si une seule heure est envoyée et rend la plage invalide (fin ≤ début existant)", async () => {
        const c = await creer({ debut: "08:00:00", fin: "10:00:00" });
        const res = await put(c.plan_id, { plan_heure_fin: "07:30" });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/strictement après/);
    });

    test("404 créneau inconnu ; 400 identifiant invalide", async () => {
        expect((await put(99999999, { salle_id: salles[0].salle_id })).status).toBe(404);
        expect((await put("abc", { salle_id: salles[0].salle_id })).status).toBe(400);
    });

    test("404 si la nouvelle classe, matière, enseignant ou salle n'existent pas", async () => {
        const c = await creer();
        expect((await put(c.plan_id, { code_classe: "T7J3B-INCONNUE" })).status).toBe(404);
        expect((await put(c.plan_id, { matiere_id: 99999999 })).status).toBe(404);
        expect((await put(c.plan_id, { enseignant_id: 99999999 })).status).toBe(404);
        expect((await put(c.plan_id, { salle_id: 99999999 })).status).toBe(404);
    });

    test("403 : créneau d'un autre établissement ; 403 : vers une classe d'un autre établissement", async () => {
        const c = await creer();
        expect((await put(c.plan_id, { plan_jour: "mardi" }, tokenFor("direction", ETA_B))).status).toBe(403);
        expect((await put(c.plan_id, { code_classe: classeB.code_classe, salle_id: salleB.salle_id })).status).toBe(403);
    });

    test("RBAC : enseignant refusé (403), sans token (401), personnel accepté", async () => {
        const c = await creer();
        expect((await put(c.plan_id, { plan_jour: "mardi" }, tokenFor("enseignant"))).status).toBe(403);
        expect((await request(app).put(`/api/v1/creneaux/${c.plan_id}`).send({ plan_jour: "mardi" })).status).toBe(401);
        expect((await put(c.plan_id, { plan_jour: "mardi" }, tokenFor("personnel"))).status).toBe(200);
    });
});

describe("DELETE /creneaux/:id — annulation", () => {
    test("passe le statut à 'annule' sans supprimer la ligne", async () => {
        const c = await creer();
        const res = await del(c.plan_id);

        expect(res.status).toBe(200);
        expect(res.body.data.plan_statut).toBe("annule");
        expect(await recharger(c.plan_id)).toMatchObject({ plan_id: c.plan_id, plan_statut: "annule" });
    });

    test("libère l'enseignant, la salle ET la classe : un créneau identique peut être recréé", async () => {
        const c = await creer();
        const corps = {
            code_classe: c.code_classe, matiere_id: c.matiere_id, enseignant_id: c.enseignant_id,
            salle_id: c.salle_id, plan_jour: "lundi", plan_heure_debut: "08:00", plan_heure_fin: "10:00",
        };

        expect((await post(corps)).status).toBe(409); // occupé avant l'annulation
        expect((await del(c.plan_id)).status).toBe(200);
        expect((await post(corps)).status).toBe(201); // libre après l'annulation
    });

    test("annuler deux fois est idempotent (200, message explicite)", async () => {
        const c = await creer();
        await del(c.plan_id);
        const res = await del(c.plan_id);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/déjà annulé/);
    });

    test("404 inconnu ; 400 identifiant invalide ; 403 autre établissement ; RBAC", async () => {
        const c = await creer();
        expect((await del(99999999)).status).toBe(404);
        expect((await del("abc")).status).toBe(400);
        expect((await del(c.plan_id, tokenFor("direction", ETA_B))).status).toBe(403);
        expect((await del(c.plan_id, tokenFor("enseignant"))).status).toBe(403);
        expect((await request(app).delete(`/api/v1/creneaux/${c.plan_id}`)).status).toBe(401);
        expect((await recharger(c.plan_id)).plan_statut).toBe("actif"); // rien n'a été annulé
    });
});

describe("Concurrence sur la modification", () => {
    test(`${NB} modifications simultanées vers la même plage libre, même enseignant : une seule aboutit`, async () => {
        // 10 créneaux consécutifs de 30 min (07:00–07:30, 07:30–08:00, …), même enseignant : valides
        const creneaux = [];
        for (let i = 0; i < NB; i++) {
            const debut = 7 * 60 + i * 30;
            const h = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00`;
            creneaux.push(await creer({ classe: i, salle: i, prof: 0, debut: h(debut), fin: h(debut + 30) }));
        }

        // Tous veulent aller dans l'après-midi sur des plages qui se chevauchent (14:00–15:00, 14:05–15:05, …)
        const h = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
        const reponses = await Promise.all(
            creneaux.map((c, i) => put(c.plan_id, { plan_heure_debut: h(14 * 60 + i * 5), plan_heure_fin: h(15 * 60 + i * 5) }))
        );

        const statuts = reponses.map((r) => r.status);
        expect(statuts.filter((s) => s === 200)).toHaveLength(1);
        expect(statuts.filter((s) => s === 409)).toHaveLength(NB - 1);

        const apresMidi = await CreneauPlanning.count({ where: { enseignant_id: profs[0].enseignant_id, plan_heure_debut: { [Op.gte]: "14:00:00" } } });
        expect(apresMidi).toBe(1);
    });

    test("modification et annulation simultanées du même créneau : cohérent, jamais d'erreur serveur", async () => {
        for (let essai = 0; essai < 5; essai++) {
            await viderCreneaux();
            const c = await creer();

            const [rPut, rDel] = await Promise.all([put(c.plan_id, { plan_heure_debut: "09:00", plan_heure_fin: "11:00" }), del(c.plan_id)]);

            expect([200, 409, 422]).toContain(rPut.status);
            expect(rDel.status).toBe(200);
            expect((await recharger(c.plan_id)).plan_statut).toBe("annule"); // l'annulation l'emporte toujours
        }
    });

    test("deux modifications simultanées du MÊME créneau : l'une aboutit, l'autre est refusée proprement", async () => {
        for (let essai = 0; essai < 5; essai++) {
            await viderCreneaux();
            const c = await creer();

            const reponses = await Promise.all([
                put(c.plan_id, { plan_heure_debut: "09:00", plan_heure_fin: "10:00" }),
                put(c.plan_id, { plan_heure_debut: "11:00", plan_heure_fin: "12:00" }),
            ]);

            const statuts = reponses.map((r) => r.status);
            expect(statuts.every((s) => [200, 409].includes(s))).toBe(true);
            expect(statuts).toContain(200);
        }
    });

    test("échange d'enseignants dans les deux sens en parallèle : pas d'interblocage (ordre de verrouillage déterministe)", async () => {
        for (let essai = 0; essai < 10; essai++) {
            await viderCreneaux();
            // X : prof 0, 08–09 ; Y : prof 1, 10–11 ; plages disjointes, l'échange est valide
            const x = await creer({ classe: 0, salle: 0, prof: 0, debut: "08:00:00", fin: "09:00:00" });
            const y = await creer({ classe: 1, salle: 1, prof: 1, debut: "10:00:00", fin: "11:00:00" });

            const [rx, ry] = await Promise.all([
                put(x.plan_id, { enseignant_id: profs[1].enseignant_id }),
                put(y.plan_id, { enseignant_id: profs[0].enseignant_id }),
            ]);

            expect([rx.status, ry.status]).toEqual([200, 200]);
        }
    });

    test("échange de salles et de classes croisées en parallèle : pas d'interblocage", async () => {
        for (let essai = 0; essai < 10; essai++) {
            await viderCreneaux();
            const x = await creer({ classe: 0, salle: 0, prof: 0, debut: "08:00:00", fin: "09:00:00" });
            const y = await creer({ classe: 1, salle: 1, prof: 1, debut: "10:00:00", fin: "11:00:00" });

            const [rx, ry] = await Promise.all([
                put(x.plan_id, { salle_id: salles[1].salle_id, code_classe: classes[1].code_classe }),
                put(y.plan_id, { salle_id: salles[0].salle_id, code_classe: classes[0].code_classe }),
            ]);

            expect([rx.status, ry.status]).toEqual([200, 200]);
        }
    });
});