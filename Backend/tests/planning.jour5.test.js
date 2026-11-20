
import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Op } from "sequelize";

import app from "../src/app.js";
import sequelize from "../config/database.js";
import {
    Etablissement, AnneeScolaire, Niveau, Classe, Utilisateur, EnseignantFormateur, Personnel,
    Salle, Matiere, CreneauPlanning, Conge,
} from "../src/models/index.js";
import { datesParJour, intersection, jourDeLaSemaine, nombreDeJours, parseDate } from "../src/utils/conges.js";

sequelize.options.logging = false;
jest.setTimeout(60000);

const ETA_A = "t7j5-eta-a";
const ETA_B = "t7j5-eta-b";
const ANNEE = "T7J5-AS";
const NIVEAU = "T7J5-NIV";

const jeton = (user, role, eta_id = ETA_A) =>
    jwt.sign({ usr_id: user?.usr_id ?? randomUUID(), usr_login: `t7j5.${role}`, usr_role: role, eta_id }, process.env.JWT_SECRET, { expiresIn: "1h" });
const get = (url, token) => request(app).get(url).set({ Authorization: `Bearer ${token}` });

let profA, profB, userProfA, userProfB, rh, matMath, salle;
let tDirection, tDirectionB, tProfA, tProfB;

const nettoyer = async () => {
    const users = await Utilisateur.findAll({ where: { usr_login: { [Op.like]: "t7j5.%" } } });
    const usrIds = users.map((u) => u.usr_id);

    await Conge.destroy({ where: { conge_id: { [Op.like]: "t7j5-%" } } });
    await CreneauPlanning.destroy({ where: { code_classe: { [Op.like]: "T7J5-%" } } });
    await Classe.destroy({ where: { code_classe: { [Op.like]: "T7J5-%" } } });
    await AnneeScolaire.destroy({ where: { code_annee_scolaire: ANNEE } });
    await Niveau.destroy({ where: { code_niveau: NIVEAU } });
    await Salle.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
    await Matiere.destroy({ where: { matiere_code: { [Op.like]: "T7J5-%" } } });
    await Personnel.destroy({ where: { usr_id: usrIds } });
    await EnseignantFormateur.destroy({ where: { usr_id: usrIds } });
    await Utilisateur.destroy({ where: { usr_login: { [Op.like]: "t7j5.%" } } });
    await Etablissement.destroy({ where: { eta_id: [ETA_A, ETA_B] } });
};

const etablissement = (eta_id, n) =>
    Etablissement.create({
        eta_id, eta_code: `T7J5-${n}`, eta_nom: `Établissement ${n}`, eta_type: "secondaire",
        eta_adresse: "Douala", eta_ville: "Douala", eta_pays: "Cameroun", eta_tel: "690000000", eta_email: `t7j5.${n}@test.local`,
    });

const utilisateur = (suffixe, role, eta_id = ETA_A) =>
    Utilisateur.create({
        usr_id: randomUUID(), usr_nom: `Nom${suffixe}`, usr_prenom: "Test", usr_email: `t7j5.${suffixe}@test.local`,
        usr_login: `t7j5.${suffixe}`, usr_mdp_hash: "x", usr_role: role, usr_statut: "actif",
        usr_date_creation: new Date(), eta_id,
    });

const creneau = (prof, o) =>
    CreneauPlanning.create({
        code_classe: "T7J5-C1", matiere_id: matMath.matiere_id, enseignant_id: prof.enseignant_id, salle_id: salle.salle_id,
        plan_statut: "actif", plan_jour: "lundi", plan_heure_debut: "08:00:00", plan_heure_fin: "10:00:00", ...o,
    });

const conge = (id, debut, fin, usr_id, statut = "valide") =>
    Conge.create({
        conge_id: `t7j5-${id}`, conge_date_debut: debut, conge_date_fin: fin, conge_motif: "Congé de test",
        rh_statut_conge: statut, rh_id: rh.rh_id, usr_id,
    });

beforeAll(async () => {
    await nettoyer();
    await etablissement(ETA_A, "A");
    await etablissement(ETA_B, "B");
    await AnneeScolaire.create({ code_annee_scolaire: ANNEE, date_debut_annee: "2026-09-01", date_fin_annee: "2027-07-31", eta_id: ETA_A });
    await Niveau.create({ code_niveau: NIVEAU, libelle_niveau: "Niveau test" });
    await Classe.create({ code_classe: "T7J5-C1", libelle_classe: "C1", effectif_classe: 20, eta_id: ETA_A, code_annee_scolaire: ANNEE, code_niveau: NIVEAU });
    matMath = await Matiere.create({ matiere_code: "T7J5-MATH", matiere_libelle: "Mathématiques" });
    salle = await Salle.create({ salle_nom: "S1", eta_id: ETA_A, capacite: 40 });

    userProfA = await utilisateur("profa", "enseignant");
    userProfB = await utilisateur("profb", "enseignant");
    profA = await EnseignantFormateur.create({ usr_id: userProfA.usr_id });
    profB = await EnseignantFormateur.create({ usr_id: userProfB.usr_id });

    const userRh = await utilisateur("rh", "personnel");
    rh = await Personnel.create({
        rh_id: randomUUID(), usr_id: userRh.usr_id, rh_matricule: `T7J5-RH-${Date.now()}`,
        rh_fonction: "RH", rh_date_embauche: "2026-01-01", rh_salaire_base: 100000,
    });

    // Prof A : lundi 8-10, lundi 10-12, mercredi 8-10, vendredi 8-10 (+ un créneau ANNULÉ le mardi)
    await creneau(profA, {});
    await creneau(profA, { plan_heure_debut: "10:00:00", plan_heure_fin: "12:00:00" });
    await creneau(profA, { plan_jour: "mercredi" });
    await creneau(profA, { plan_jour: "vendredi" });
    await creneau(profA, { plan_jour: "mardi", plan_statut: "annule" });
    // Prof B : un créneau le lundi (son congé ne doit pas toucher prof A)
    await creneau(profB, { plan_heure_debut: "14:00:00", plan_heure_fin: "16:00:00" });

    // 9 nov 2026 = lundi. Congé de A : lundi → mercredi. Congé de B : même période.
    await conge("a-valide", "2026-11-09", "2026-11-11", userProfA.usr_id, "valide");
    await conge("a-attente", "2026-11-23", "2026-11-27", userProfA.usr_id, "en_attente");
    await conge("a-refuse", "2026-12-07", "2026-12-11", userProfA.usr_id, "refuse");
    await conge("a-long", "2027-01-04", "2027-01-17", userProfA.usr_id, "valide"); // 2 semaines : 2 lundis
    await conge("b-valide", "2026-11-09", "2026-11-11", userProfB.usr_id, "valide");
    await conge("rh-lui-meme", "2026-11-09", "2026-11-11", userRh.usr_id, "valide"); // pas un enseignant

    tDirection = jeton(null, "direction");
    tDirectionB = jeton(null, "direction", ETA_B);
    tProfA = jeton(userProfA, "enseignant");
    tProfB = jeton(userProfB, "enseignant");
});

afterAll(async () => {
    await nettoyer();
    await sequelize.close();
});

describe("Utilitaires de dates (purs, sans base)", () => {
    test("jour de la semaine, indépendant du fuseau horaire", () => {
        expect(jourDeLaSemaine("2026-11-09")).toBe("lundi");
        expect(jourDeLaSemaine("2026-11-15")).toBe("dimanche");
        expect(jourDeLaSemaine("2028-02-29")).toBe("mardi"); // année bissextile
    });

    test("une période courte ne couvre que certains jours", () => {
        expect(datesParJour("2026-11-09", "2026-11-11")).toEqual({
            lundi: ["2026-11-09"], mardi: ["2026-11-10"], mercredi: ["2026-11-11"],
        });
    });

    test("une période de 8 jours couvre tous les jours, le premier jour deux fois", () => {
        const r = datesParJour("2026-11-09", "2026-11-16");
        expect(Object.keys(r)).toHaveLength(7);
        expect(r.lundi).toEqual(["2026-11-09", "2026-11-16"]);
    });

    test("un congé d'un seul jour", () => {
        expect(datesParJour("2026-11-13", "2026-11-13")).toEqual({ vendredi: ["2026-11-13"] });
        expect(nombreDeJours("2026-11-13", "2026-11-13")).toBe(1);
    });

    test("passage de fin d'année et dates inexistantes", () => {
        expect(datesParJour("2026-12-31", "2027-01-01")).toEqual({ jeudi: ["2026-12-31"], vendredi: ["2027-01-01"] });
        expect(() => parseDate("2026-02-31")).toThrow();
        expect(() => parseDate("09/11/2026")).toThrow();
    });

    test("intersection de périodes", () => {
        expect(intersection({ debut: "2026-11-01", fin: "2026-11-10" }, { debut: "2026-11-09", fin: "2026-11-30" })).toEqual({ debut: "2026-11-09", fin: "2026-11-10" });
        expect(intersection({ debut: "2026-11-01", fin: "2026-11-02" }, { debut: "2026-11-09", fin: "2026-11-30" })).toBeNull();
    });
});

describe("GET /conges/:id/creneaux-impactes", () => {
    const impact = (id, token = tDirection) => get(`/api/v1/conges/t7j5-${id}/creneaux-impactes`, token);

    test("congé lundi→mercredi : les créneaux du lundi et du mercredi, pas ceux du vendredi", async () => {
        const res = await impact("a-valide");
        expect(res.status).toBe(200);

        const { data } = res.body;
        expect(data.impact_effectif).toBe(true);
        expect(data.jours_concernes).toEqual(["lundi", "mardi", "mercredi"]);
        expect(data.total).toBe(3);
        expect(data.creneaux.map((c) => `${c.jour} ${c.heure_debut}`)).toEqual(["lundi 08:00", "lundi 10:00", "mercredi 08:00"]);
        expect(data.creneaux[0].dates_impactees).toEqual(["2026-11-09"]);
        expect(data.creneaux[2].dates_impactees).toEqual(["2026-11-11"]);
        expect(data.enseignant.id).toBe(profA.enseignant_id);
    });

    test("le créneau ANNULÉ du mardi n'est pas impacté, et les créneaux d'un autre enseignant non plus", async () => {
        const res = await impact("a-valide");
        const jours = res.body.data.creneaux.map((c) => c.jour);
        expect(jours).not.toContain("mardi");
        expect(res.body.data.creneaux.every((c) => c.enseignant.id === profA.enseignant_id)).toBe(true);
    });

    test("congé de deux semaines : les dates de chaque occurrence sont listées", async () => {
        const res = await impact("a-long");
        const lundi = res.body.data.creneaux.find((c) => c.jour === "lundi");
        expect(lundi.dates_impactees).toEqual(["2027-01-04", "2027-01-11"]);
        expect(res.body.data.total).toBe(4); // 2 créneaux lundi + mercredi + vendredi
    });

    test("congé en attente ou refusé : aperçu, impact_effectif=false", async () => {
        for (const id of ["a-attente", "a-refuse"]) {
            const res = await impact(id);
            expect(res.status).toBe(200);
            expect(res.body.data.impact_effectif).toBe(false);
            expect(res.body.data.total).toBeGreaterThan(0);
        }
    });

    test("congé inconnu : 404 ; congé d'un non-enseignant : 422", async () => {
        expect((await impact("inconnu")).status).toBe(404);
        expect((await impact("rh-lui-meme")).status).toBe(422);
    });

    test("droits : enseignant 403, autre établissement 403, sans jeton 401", async () => {
        expect((await impact("a-valide", tProfA)).status).toBe(403);
        expect((await impact("a-valide", tDirectionB)).status).toBe(403);
        expect((await request(app).get("/api/v1/conges/t7j5-a-valide/creneaux-impactes")).status).toBe(401);
    });

    test("rien n'est stocké : les créneaux restent inchangés après le calcul", async () => {
        const avant = await CreneauPlanning.count({ where: { enseignant_id: profA.enseignant_id, plan_statut: "actif" } });
        await impact("a-valide");
        expect(await CreneauPlanning.count({ where: { enseignant_id: profA.enseignant_id, plan_statut: "actif" } })).toBe(avant);
    });
});

describe("Indicateur « en congé » dans le planning enseignant", () => {
    const planning = (id, q, token = tDirection) =>
        get(`/api/v1/planning/enseignants/${id}${q ? `?${new URLSearchParams(q)}` : ""}`, token);

    test("sans période : aucun indicateur (réponse inchangée)", async () => {
        const res = await planning(profA.enseignant_id);
        expect(res.status).toBe(200);
        expect(res.body.data.periode).toBeUndefined();
        expect(res.body.data.semaine[0].creneaux[0].en_conge).toBeUndefined();
    });

    test("semaine du 9 au 15 nov : lundi et mercredi en congé, vendredi non", async () => {
        const res = await planning(profA.enseignant_id, { du: "2026-11-09", au: "2026-11-15" });
        expect(res.status).toBe(200);

        const [lundi, , mercredi, , vendredi] = res.body.data.semaine;
        expect(lundi.creneaux.every((c) => c.en_conge === true)).toBe(true);
        expect(lundi.creneaux[0].dates_en_conge).toEqual(["2026-11-09"]);
        expect(mercredi.creneaux[0].en_conge).toBe(true);
        expect(vendredi.creneaux[0].en_conge).toBe(false);
        expect(res.body.data.conges).toHaveLength(1);
        expect(res.body.data.conges[0]).not.toHaveProperty("motif"); // donnée RH non exposée
        expect(JSON.stringify(res.body)).not.toMatch(/Congé de test/);
    });

    test("période qui ne touche aucun congé : tout à false", async () => {
        const res = await planning(profA.enseignant_id, { du: "2026-10-05", au: "2026-10-11" });
        expect(res.body.data.semaine.flatMap((j) => j.creneaux).every((c) => c.en_conge === false)).toBe(true);
        expect(res.body.data.conges).toEqual([]);
    });

    test("seuls les congés VALIDÉS comptent (en attente / refusé ignorés)", async () => {
        const attente = await planning(profA.enseignant_id, { du: "2026-11-23", au: "2026-11-27" });
        const refuse = await planning(profA.enseignant_id, { du: "2026-12-07", au: "2026-12-11" });
        for (const res of [attente, refuse]) {
            expect(res.body.data.semaine.flatMap((j) => j.creneaux).every((c) => c.en_conge === false)).toBe(true);
        }
    });

    test("la période n'est qu'une fenêtre : le congé est tronqué à [du, au]", async () => {
        // congé 9→11 nov ; fenêtre 10→12 nov : le lundi 9 est hors fenêtre, le mercredi 11 dedans
        const res = await planning(profA.enseignant_id, { du: "2026-11-10", au: "2026-11-12" });
        const [lundi, , mercredi] = res.body.data.semaine;
        expect(lundi.creneaux[0].en_conge).toBe(false);
        expect(mercredi.creneaux[0].dates_en_conge).toEqual(["2026-11-11"]);
    });

    test("le congé d'un enseignant n'affecte pas son collègue", async () => {
        const res = await planning(profB.enseignant_id, { du: "2026-11-09", au: "2026-11-15" });
        expect(res.body.data.semaine[0].creneaux[0].en_conge).toBe(true); // son propre congé (b-valide)

        // 4→10 janv. 2027 : seul A a un congé validé (a-long) ; B n'est pas concerné
        const hors = await planning(profB.enseignant_id, { du: "2027-01-04", au: "2027-01-10" });
        expect(hors.body.data.semaine[0].creneaux[0].en_conge).toBe(false);
        expect((await planning(profA.enseignant_id, { du: "2027-01-04", au: "2027-01-10" })).body.data.semaine[0].creneaux[0].en_conge).toBe(true);
    });

    test("l'enseignant voit son indicateur, mais toujours pas le planning d'un collègue", async () => {
        const q = { du: "2026-11-09", au: "2026-11-15" };
        expect((await planning(profA.enseignant_id, q, tProfA)).status).toBe(200);
        expect((await planning(profB.enseignant_id, q, tProfA)).status).toBe(403);
    });

    test("validation de la période (400)", async () => {
        expect((await planning(profA.enseignant_id, { du: "2026-11-09" })).status).toBe(400); // au manquant
        expect((await planning(profA.enseignant_id, { du: "2026-11-15", au: "2026-11-09" })).status).toBe(400); // inversée
        expect((await planning(profA.enseignant_id, { du: "2026-02-31", au: "2026-03-05" })).status).toBe(400); // inexistante
        expect((await planning(profA.enseignant_id, { du: "09/11/2026", au: "15/11/2026" })).status).toBe(400); // format
        expect((await planning(profA.enseignant_id, { du: "2026-01-01", au: "2028-01-01" })).status).toBe(400); // > 366 jours
    });
});