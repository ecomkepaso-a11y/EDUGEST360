/*
 * SEMAINE 7 — JOUR 3 : tests de concurrence sur la création de créneau.
 *
 * Principe : lancer plusieurs créations EN MÊME TEMPS (Promise.all) qui se
 * chevauchent sur une ressource commune, et vérifier qu'UNE SEULE aboutit.
 * Sans verrous, plusieurs passeraient (voir l'expérience à deux sessions MySQL).
 *
 * ATTENTION : écrit dans la base pointée par .env. Tout est préfixé "t7j3"
 * et supprimé avant et après les tests.
 */
import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Op } from "sequelize";

import app from "../src/app.js";
import sequelize from "../config/database.js";
import { seChevauchent } from "../src/utils/chevauchement.js";
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

const ETA = "t7j3-eta";
const ANNEE = "T7J3-AS";
const NIVEAU = "T7J3-NIV";
const N = 20;

const token = jwt.sign({ usr_id: randomUUID(), usr_login: "t7j3.dir", usr_role: "direction", eta_id: ETA }, process.env.JWT_SECRET, {
    expiresIn: "1h",
});
const post = (body) => request(app).post("/api/v1/creneaux").set({ Authorization: `Bearer ${token}` }).send(body);

let classes = [];
let salles = [];
let profs = [];
let matiere;

const pad = (n) => String(n).padStart(2, "0");
const hhmm = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const nettoyer = async () => {
    const users = await Utilisateur.findAll({ where: { usr_login: { [Op.like]: "t7j3.%" } } });
    const ids = (await EnseignantFormateur.findAll({ where: { usr_id: users.map((u) => u.usr_id) } })).map((p) => p.enseignant_id);
    const mats = await Matiere.findAll({ where: { matiere_code: "T7J3-MATH" } });

    await CreneauPlanning.destroy({ where: { [Op.or]: [{ code_classe: { [Op.like]: "T7J3-%" } }, { enseignant_id: ids }] } });
    await Enseign.destroy({ where: { [Op.or]: [{ matiere_id: mats.map((m) => m.matiere_id) }, { enseignant_id: ids }] } });
    await Classe.destroy({ where: { code_classe: { [Op.like]: "T7J3-%" } } });
    await AnneeScolaire.destroy({ where: { code_annee_scolaire: ANNEE } });
    await Niveau.destroy({ where: { code_niveau: NIVEAU } });
    await Salle.destroy({ where: { eta_id: ETA } });
    await Matiere.destroy({ where: { matiere_code: "T7J3-MATH" } });
    await EnseignantFormateur.destroy({ where: { usr_id: users.map((u) => u.usr_id) } });
    await Utilisateur.destroy({ where: { usr_login: { [Op.like]: "t7j3.%" } } });
    await Etablissement.destroy({ where: { eta_id: ETA } });
};

beforeAll(async () => {
    await nettoyer();

    await Etablissement.create({
        eta_id: ETA, eta_code: "T7J3", eta_nom: "Établissement test", eta_type: "secondaire",
        eta_adresse: "Douala", eta_ville: "Douala", eta_pays: "Cameroun", eta_tel: "690000000", eta_email: "t7j3@test.local",
    });
    await AnneeScolaire.create({ code_annee_scolaire: ANNEE, date_debut_annee: "2026-09-01", date_fin_annee: "2027-07-31", eta_id: ETA });
    await Niveau.create({ code_niveau: NIVEAU, libelle_niveau: "Niveau test" });
    matiere = await Matiere.create({ matiere_code: "T7J3-MATH", matiere_libelle: "Mathématiques" });

    for (let i = 0; i < N; i++) {
        const n = pad(i);
        classes.push(
            await Classe.create({
                code_classe: `T7J3-C${n}`, libelle_classe: `Classe ${n}`, effectif_classe: 20,
                eta_id: ETA, code_annee_scolaire: ANNEE, code_niveau: NIVEAU,
            })
        );
        salles.push(await Salle.create({ salle_nom: `Salle ${n}`, eta_id: ETA, capacite: 50 }));

        const user = await Utilisateur.create({
            usr_id: randomUUID(), usr_nom: `Nom${n}`, usr_prenom: "Prof", usr_email: `t7j3.${n}@test.local`,
            usr_login: `t7j3.ens.${n}`, usr_mdp_hash: "x", usr_role: "enseignant", usr_statut: "actif",
            usr_date_creation: new Date(), eta_id: ETA,
        });
        const prof = await EnseignantFormateur.create({ usr_id: user.usr_id });
        await Enseign.create({ matiere_id: matiere.matiere_id, enseignant_id: prof.enseignant_id });
        profs.push(prof);
    }
});

afterAll(async () => {
    await nettoyer();
    await sequelize.close();
});

beforeEach(() => CreneauPlanning.destroy({ where: { code_classe: { [Op.like]: "T7J3-%" } } }));

const demande = (i, { classe = i, salle = i, prof = i, jour = "lundi", debut, fin }) => ({
    code_classe: classes[classe].code_classe,
    matiere_id: matiere.matiere_id,
    enseignant_id: profs[prof].enseignant_id,
    salle_id: salles[salle].salle_id,
    plan_jour: jour,
    plan_heure_debut: debut,
    plan_heure_fin: fin,
});

// 20 plages de 2 h décalées de 5 min : 08:00–10:00, 08:05–10:05 … toutes se chevauchent (09:35–10:00 commun).
const plageQuiSeChevauche = (i) => ({ debut: hhmm(8 * 60 + i * 5), fin: hhmm(10 * 60 + i * 5) });

const lancer = (corps) => Promise.all(corps.map((c) => post(c)));
const statuts = (reponses) => reponses.map((r) => r.status);
const compter = (reponses, code) => reponses.filter((r) => r.status === code).length;

describe("Concurrence : une seule création aboutit quand tout se chevauche", () => {
    test(`${N} créations simultanées pour le MÊME ENSEIGNANT (classes et salles différentes)`, async () => {
        const reponses = await lancer(Array.from({ length: N }, (_, i) => demande(i, { prof: 0, ...plageQuiSeChevauche(i) })));

        expect(compter(reponses, 201)).toBe(1);
        expect(compter(reponses, 409)).toBe(N - 1);
        expect(await CreneauPlanning.count({ where: { enseignant_id: profs[0].enseignant_id } })).toBe(1);
    });

    test(`${N} créations simultanées pour la MÊME SALLE (classes et enseignants différents)`, async () => {
        const reponses = await lancer(Array.from({ length: N }, (_, i) => demande(i, { salle: 0, ...plageQuiSeChevauche(i) })));

        expect(compter(reponses, 201)).toBe(1);
        expect(compter(reponses, 409)).toBe(N - 1);
        expect(await CreneauPlanning.count({ where: { salle_id: salles[0].salle_id } })).toBe(1);
    });

    test(`${N} créations simultanées pour la MÊME CLASSE (enseignants et salles différents)`, async () => {
        const reponses = await lancer(Array.from({ length: N }, (_, i) => demande(i, { classe: 0, ...plageQuiSeChevauche(i) })));

        expect(compter(reponses, 201)).toBe(1);
        expect(compter(reponses, 409)).toBe(N - 1);
        expect(await CreneauPlanning.count({ where: { code_classe: classes[0].code_classe } })).toBe(1);
    });
});

describe("Concurrence : les verrous ne rejettent pas les demandes valides", () => {
    test(`${N} créneaux de 30 min consécutifs, même enseignant, en parallèle : tous acceptés`, async () => {
        // 07:00–07:30, 07:30–08:00, … : jamais de chevauchement (bornes strictes)
        const reponses = await lancer(
            Array.from({ length: N }, (_, i) => demande(i, { prof: 0, debut: hhmm(7 * 60 + i * 30), fin: hhmm(7 * 60 + (i + 1) * 30) }))
        );

        expect(statuts(reponses).every((s) => s === 201)).toBe(true);
        expect(await CreneauPlanning.count({ where: { enseignant_id: profs[0].enseignant_id } })).toBe(N);
    });

    test("le même créneau demandé à des jours différents en parallèle : tous acceptés", async () => {
        const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        const reponses = await lancer(jours.map((jour, i) => demande(i, { prof: 0, salle: 0, classe: 0, jour, debut: "08:00", fin: "10:00" })));

        expect(statuts(reponses).every((s) => s === 201)).toBe(true);
    });
});

describe("Concurrence : charge mixte aléatoire", () => {
    test("60 créations simultanées sur 4 enseignants / 4 salles / 4 classes : jamais d'erreur serveur, jamais de chevauchement en base", async () => {
        // Générateur pseudo-aléatoire déterministe : le test est reproductible
        let graine = 12345;
        const alea = (max) => {
            graine = (graine * 1103515245 + 12345) % 2147483648;
            return graine % max;
        };

        const corps = Array.from({ length: 60 }, () => {
            const debut = 7 * 60 + alea(9) * 60 + alea(2) * 30; // 07:00 … 15:30
            return demande(0, {
                prof: alea(4),
                salle: alea(4),
                classe: alea(4),
                jour: ["lundi", "mardi"][alea(2)],
                debut: hhmm(debut),
                fin: hhmm(debut + 60 + alea(3) * 30), // durée 1 h, 1 h 30 ou 2 h
            });
        });

        const reponses = await lancer(corps);

        // Seuls 201 (créé) et 409 (conflit) sont acceptables : un 500 = interblocage ou bug
        const inattendus = reponses.filter((r) => ![201, 409].includes(r.status));
        expect(inattendus.map((r) => `${r.status} ${r.body.message}`)).toEqual([]);
        expect(compter(reponses, 201)).toBeGreaterThan(0);

        // Invariant : pour chaque ressource et chaque jour, aucun couple de créneaux actifs ne se chevauche
        const creneaux = await CreneauPlanning.findAll({ where: { code_classe: { [Op.like]: "T7J3-%" }, plan_statut: "actif" }, raw: true });
        expect(creneaux).toHaveLength(compter(reponses, 201));

        for (const cle of ["enseignant_id", "salle_id", "code_classe"]) {
            for (let a = 0; a < creneaux.length; a++) {
                for (let b = a + 1; b < creneaux.length; b++) {
                    const x = creneaux[a];
                    const y = creneaux[b];
                    if (x[cle] === y[cle] && x.plan_jour === y.plan_jour) {
                        const chevauchement = seChevauchent(
                            { debut: x.plan_heure_debut, fin: x.plan_heure_fin },
                            { debut: y.plan_heure_debut, fin: y.plan_heure_fin }
                        );
                        expect({ cle, a: x.plan_id, b: y.plan_id, chevauchement }).toEqual({ cle, a: x.plan_id, b: y.plan_id, chevauchement: false });
                    }
                }
            }
        }
    });
});