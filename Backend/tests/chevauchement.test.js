/*
 * test de la fonction de chevauchement (sans base de données).
 * Un test par ligne du tableau de la section 3.1, plus les cas d'erreur.
 */
import { heureEnSecondes, seChevauchent, trouverConflits } from "../src/utils/chevauchement.js";

describe("heureEnSecondes", () => {
    test.each([
        ["00:00", 0],
        ["08:00", 28800],
        ["08:00:00", 28800],
        ["08:30:15", 30615],
        ["23:59:59", 86399],
    ])("convertit %s en %i secondes", (heure, attendu) => {
        expect(heureEnSecondes(heure)).toBe(attendu);
    });

    test.each(["", "8h", "24:00", "12:60", "12:00:60", "abc", null, undefined, 800])(
        "refuse l'heure invalide %p",
        (valeur) => {
            expect(() => heureEnSecondes(valeur)).toThrow(/Heure invalide/);
        }
    );
});

describe("seChevauchent — tableau de la section 3.1 (existant : 08:00–10:00)", () => {
    const cas = [
        ["Chevauchement partiel", "08:00", "10:00", "09:00", "11:00", true],
        ["Créneaux consécutifs", "08:00", "10:00", "10:00", "12:00", false],
        ["Se termine au début de l'autre", "08:00", "10:00", "07:00", "08:00", false],
        ["Nouveau contenu dans l'existant", "08:00", "10:00", "08:00", "09:00", true],
        ["Nouveau englobant", "08:00", "10:00", "07:00", "11:00", true],
        ["Créneau identique", "08:00", "10:00", "08:00", "10:00", true],
    ];

    test.each(cas)("%s : [%s-%s] vs [%s-%s] → conflit : %s", (_nom, dA, fA, dB, fB, attendu) => {
        expect(seChevauchent({ debut: dA, fin: fA }, { debut: dB, fin: fB })).toBe(attendu);
    });

    test.each(cas)("symétrie — %s : [%s-%s] vs [%s-%s]", (_nom, dA, fA, dB, fB, attendu) => {
        // Le résultat ne doit pas dépendre de l'ordre des deux plages
        expect(seChevauchent({ debut: dB, fin: fB }, { debut: dA, fin: fA })).toBe(attendu);
    });

    test("accepte un mélange de formats HH:MM et HH:MM:SS", () => {
        expect(seChevauchent({ debut: "08:00:00", fin: "10:00:00" }, { debut: "09:00", fin: "11:00" })).toBe(true);
        expect(seChevauchent({ debut: "08:00:00", fin: "10:00:00" }, { debut: "10:00", fin: "12:00:00" })).toBe(false);
    });

    test("une seconde de recouvrement suffit à créer un conflit", () => {
        expect(seChevauchent({ debut: "08:00:00", fin: "10:00:01" }, { debut: "10:00:00", fin: "12:00:00" })).toBe(true);
    });

    test.each([
        ["fin avant début", { debut: "10:00", fin: "08:00" }],
        ["début = fin (durée nulle)", { debut: "09:00", fin: "09:00" }],
    ])("refuse une plage invalide : %s", (_nom, plageInvalide) => {
        expect(() => seChevauchent(plageInvalide, { debut: "08:00", fin: "10:00" })).toThrow(/Plage invalide/);
        expect(() => seChevauchent({ debut: "08:00", fin: "10:00" }, plageInvalide)).toThrow(/Plage invalide/);
    });
});

describe("trouverConflits — avec jour, statut et exclusion", () => {
    const existant = (surcharge = {}) => ({
        plan_id: 1,
        plan_jour: "lundi",
        plan_heure_debut: "08:00:00",
        plan_heure_fin: "10:00:00",
        plan_statut: "actif",
        ...surcharge,
    });

    const nouveau = (surcharge = {}) => ({
        plan_jour: "lundi",
        plan_heure_debut: "09:00:00",
        plan_heure_fin: "11:00:00",
        ...surcharge,
    });

    test("retourne le créneau existant qui chevauche", () => {
        const conflits = trouverConflits(nouveau(), [existant()]);
        expect(conflits).toHaveLength(1);
        expect(conflits[0].plan_id).toBe(1);
    });

    test("ignore un créneau annulé (ligne « annulé » du tableau 3.1)", () => {
        const conflits = trouverConflits(
            nouveau({ plan_heure_debut: "09:00:00", plan_heure_fin: "10:00:00" }),
            [existant({ plan_statut: "annule" })]
        );
        expect(conflits).toEqual([]);
    });

    test("ignore un créneau d'un autre jour", () => {
        expect(trouverConflits(nouveau(), [existant({ plan_jour: "mardi" })])).toEqual([]);
    });

    test("des créneaux consécutifs ne sont pas en conflit", () => {
        const conflits = trouverConflits(
            nouveau({ plan_heure_debut: "10:00:00", plan_heure_fin: "12:00:00" }),
            [existant()]
        );
        expect(conflits).toEqual([]);
    });

    test("ignorerPlanId exclut le créneau en cours de modification", () => {
        expect(trouverConflits(nouveau(), [existant({ plan_id: 7 })], 7)).toEqual([]);
        expect(trouverConflits(nouveau(), [existant({ plan_id: 7 })], 8)).toHaveLength(1);
    });

    test("retourne tous les conflits, pas seulement le premier", () => {
        const conflits = trouverConflits(nouveau({ plan_heure_debut: "08:30:00", plan_heure_fin: "11:30:00" }), [
            existant({ plan_id: 1, plan_heure_debut: "08:00:00", plan_heure_fin: "09:00:00" }),
            existant({ plan_id: 2, plan_heure_debut: "10:00:00", plan_heure_fin: "12:00:00" }),
            existant({ plan_id: 3, plan_heure_debut: "13:00:00", plan_heure_fin: "14:00:00" }),
        ]);
        expect(conflits.map((c) => c.plan_id)).toEqual([1, 2]);
    });

    test("liste vide : aucun conflit", () => {
        expect(trouverConflits(nouveau(), [])).toEqual([]);
    });
});