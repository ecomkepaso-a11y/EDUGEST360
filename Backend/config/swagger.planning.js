
const bearer = [{ bearerAuth: [] }];

const rep = (codes) => {
    const textes = {
        200: "Succès", 201: "Créé", 400: "Données ou paramètres invalides", 401: "Token manquant ou invalide",
        403: "Rôle non autorisé, ou ressource d'un autre établissement / qui ne vous concerne pas",
        404: "Ressource introuvable", 409: "Conflit", 422: "Règle métier violée", 500: "Erreur serveur",
    };
    return Object.fromEntries(codes.map((c) => [c, { description: textes[c] }]));
};

const param = (name, example, description, type = "string") => ({
    name, in: "path", required: true, description, schema: { type }, example,
});
const query = (name, example, description, required = false, type = "string") => ({
    name, in: "query", required, description, schema: { type }, example,
});

const idCreneau = param("id", 12, "Identifiant du créneau (plan_id)", "integer");

export const planningTags = [
    { name: "Salles", description: "Salles d'un établissement (nom unique par établissement)" },
    { name: "Matières", description: "Matières et habilitations des enseignants" },
    { name: "Créneaux", description: "Créneaux hebdomadaires récurrents : création, modification, annulation, simulation (RG-PLAN-01 à 08)" },
    { name: "Planning", description: "Vues de planning par acteur, contrôle d'accès « propriétaire », salles libres" },
    { name: "Congés", description: "Impact d'un congé sur les créneaux d'un enseignant (RG-PLAN-06, calculé, jamais stocké)" },
];

const corpsCreneau = {
    type: "object",
    required: ["code_classe", "matiere_id", "enseignant_id", "salle_id", "plan_jour", "plan_heure_debut", "plan_heure_fin"],
    properties: {
        code_classe: { type: "string", example: "CLS-INFO-1" },
        matiere_id: { type: "integer", example: 1 },
        enseignant_id: { type: "integer", example: 1 },
        salle_id: { type: "integer", example: 1 },
        plan_jour: { type: "string", enum: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"], example: "lundi" },
        plan_heure_debut: { type: "string", example: "08:00", description: "HH:MM ou HH:MM:SS" },
        plan_heure_fin: { type: "string", example: "10:00", description: "Strictement après l'heure de début" },
    },
};

export const planningSchemas = {
    LigneCreneau: {
        type: "object",
        properties: {
            plan_id: { type: "integer", example: 12 },
            heure_debut: { type: "string", example: "08:00" },
            heure_fin: { type: "string", example: "10:00" },
            matiere: { type: "object", properties: { id: { type: "integer" }, libelle: { type: "string", example: "Informatique" } } },
            enseignant: { type: "object", properties: { id: { type: "integer" }, nom: { type: "string", example: "Enseignant Manga" } } },
            salle: { type: "object", properties: { id: { type: "integer" }, nom: { type: "string", example: "Salle 1" } } },
            classe: { type: "object", properties: { code: { type: "string", example: "CLS-INFO-1" }, libelle: { type: "string" } } },
            en_conge: { type: "boolean", description: "Présent seulement si ?du et ?au sont fournis (vue enseignant)" },
            dates_en_conge: { type: "array", items: { type: "string", example: "2026-11-09" } },
        },
    },
    GrilleSemaine: {
        type: "array",
        description: "Toujours 7 jours, dans l'ordre de la semaine ; créneaux triés par heure ; créneaux annulés exclus",
        items: {
            type: "object",
            properties: {
                jour: { type: "string", example: "lundi" },
                creneaux: { type: "array", items: { $ref: "#/components/schemas/LigneCreneau" } },
            },
        },
    },
    CreneauCorps: corpsCreneau,
    ErreurConflit: {
        type: "object",
        properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "La salle est déjà prise(e) le lundi de 08:00 à 10:00 (...)" },
            details: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        type: { type: "string", enum: ["enseignant", "salle", "classe"] },
                        regle: { type: "string", example: "RG-PLAN-03" },
                        plan_id: { type: "integer" },
                        plan_jour: { type: "string" },
                        plan_heure_debut: { type: "string" },
                        plan_heure_fin: { type: "string" },
                    },
                },
            },
        },
    },
};

const enveloppe = (data, exemple) => ({
    "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string" }, data } }, ...(exemple && { example: exemple }) },
});

export const planningPaths = {
    /* ------------------------------ SALLES (3) ------------------------------ */
    "/api/v1/salles": {
        post: {
            tags: ["Salles"], security: bearer, summary: "Créer une salle",
            description: "Rôles : direction, personnel. La salle est rattachée à l'établissement du compte. Nom unique par établissement.",
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["salle_nom"], properties: { salle_nom: { type: "string", example: "Salle 1" }, capacite: { type: "integer", nullable: true, example: 40, description: "Optionnelle : si NULL, RG-PLAN-08 n'est pas appliquée" } } } } } },
            responses: { ...rep([201, 400, 401, 403, 404, 409, 500]), 409: { description: "Une salle de ce nom existe déjà dans cet établissement" } },
        },
        get: {
            tags: ["Salles"], security: bearer, summary: "Lister les salles de l'établissement",
            description: "Rôles : direction, personnel, enseignant.",
            responses: rep([200, 401, 403, 500]),
        },
    },
    "/api/v1/salles/{id}": {
        put: {
            tags: ["Salles"], security: bearer, summary: "Modifier une salle (nom ou capacité)",
            description: "Rôles : direction, personnel. Au moins un champ.",
            parameters: [param("id", 1, "Identifiant de la salle", "integer")],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { salle_nom: { type: "string", example: "Salle 1 bis" }, capacite: { type: "integer", nullable: true, example: 45 } } } } } },
            responses: rep([200, 400, 401, 403, 404, 409, 500]),
        },
    },

    /* ----------------------------- MATIÈRES (2) ----------------------------- */
    "/api/v1/matieres": {
        post: {
            tags: ["Matières"], security: bearer, summary: "Créer une matière",
            description: "Rôles : direction, personnel. Code unique, normalisé en majuscules.",
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["matiere_code", "matiere_libelle"], properties: { matiere_code: { type: "string", example: "MATH" }, matiere_libelle: { type: "string", example: "Mathématiques" }, matiere_description: { type: "string", nullable: true } } } } } },
            responses: rep([201, 400, 401, 403, 409, 500]),
        },
    },
    "/api/v1/matieres/{id}/enseignants/{ens_id}": {
        post: {
            tags: ["Matières"], security: bearer, summary: "Habiliter un enseignant à une matière",
            description: "Rôles : direction, personnel. Idempotent. Condition de RG-PLAN-07 : sans habilitation, aucun créneau ne peut être créé.",
            parameters: [param("id", 1, "Identifiant de la matière", "integer"), param("ens_id", 1, "Identifiant de l'enseignant", "integer")],
            responses: { ...rep([200, 201, 400, 401, 403, 404, 500]), 409: { description: "Enseignant inactif : il ne peut pas être habilité" } },
        },
    },

    /* ----------------------------- CRÉNEAUX (4) ----------------------------- */
    "/api/v1/creneaux": {
        post: {
            tags: ["Créneaux"], security: bearer, summary: "Créer un créneau",
            description:
                "Rôles : direction, personnel. Contrôles : références (RG-PLAN-01), conflit enseignant (RG-PLAN-02), salle (03), classe (04), " +
                "plage horaire de l'établissement (05), habilitation (07), capacité de la salle (08). " +
                "Les verrous de ligne rendent la création sûre en cas de requêtes simultanées : une seule des deux réussit.",
            requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreneauCorps" } } } },
            responses: {
                ...rep([201, 400, 401, 403, 404, 422, 500]),
                409: { description: "Conflit : enseignant, salle ou classe déjà pris(e). Détails dans `details`.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErreurConflit" } } } },
            },
        },
    },
    "/api/v1/creneaux/verifier": {
        post: {
            tags: ["Créneaux"], security: bearer, summary: "Simuler un créneau (rien n'est enregistré)",
            description:
                "Rôles : direction, personnel. Retourne TOUS les problèmes d'un coup (règles violées + conflits). " +
                "`plan_id` optionnel pour simuler la modification d'un créneau existant.",
            requestBody: { required: true, content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/CreneauCorps" }, { type: "object", properties: { plan_id: { type: "integer", example: 12 } } }] } } } },
            responses: { ...rep([200, 400, 401, 403, 500]), 200: { description: "`data.valide` indique si le créneau est possible ; sinon `problemes` et `conflits` détaillent pourquoi" } },
        },
    },
    "/api/v1/creneaux/{id}": {
        put: {
            tags: ["Créneaux"], security: bearer, summary: "Modifier un créneau (modification partielle)",
            description: "Rôles : direction, personnel. Mêmes contrôles qu'à la création ; le créneau n’entre pas en conflit avec lui-même. Un créneau annulé ne peut pas être modifié.",
            parameters: [idCreneau],
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", description: "Au moins un champ du créneau", properties: corpsCreneau.properties } } } },
            responses: { ...rep([200, 400, 401, 403, 404, 422, 500]), 409: { description: "Conflit de ressources, ou créneau modifié/annulé par un autre utilisateur entre-temps" } },
        },
        delete: {
            tags: ["Créneaux"], security: bearer, summary: "Annuler un créneau",
            description: "Rôles : direction, personnel. Pas de suppression : `plan_statut` passe à `annule`, ce qui libère l'enseignant, la salle et la classe. Idempotent.",
            parameters: [idCreneau],
            responses: rep([200, 400, 401, 403, 404, 500]),
        },
    },

    /* ------------------------ VUES DE PLANNING (5) -------------------------- */
    "/api/v1/planning/classes/{code_classe}": {
        get: {
            tags: ["Planning"], security: bearer, summary: "Planning d'une classe (grille hebdomadaire)",
            description:
                "Direction et personnel (leur établissement) ; enseignant : une classe où il a au moins un créneau actif ; " +
                "élève : sa classe (inscription validée) ; parent : la classe d'un de ses enfants. Sinon 403.",
            parameters: [param("code_classe", "CLS-INFO-1", "Code de la classe")],
            responses: { ...rep([200, 401, 403, 404, 500]), 200: { description: "Grille de 7 jours", content: enveloppe({ type: "object", properties: { classe: { type: "object" }, semaine: { $ref: "#/components/schemas/GrilleSemaine" } } }) } },
        },
    },
    "/api/v1/planning/enseignants/{id}": {
        get: {
            tags: ["Planning"], security: bearer, summary: "Planning d'un enseignant, avec indicateur « en congé » facultatif",
            description:
                "Direction et personnel ; enseignant : le sien uniquement (jamais celui d'un collègue). " +
                "Avec `du` et `au`, chaque créneau reçoit `en_conge` et `dates_en_conge` (congés VALIDÉS seulement, calculé à la volée, motif non exposé).",
            parameters: [
                param("id", 1, "Identifiant de l'enseignant", "integer"),
                query("du", "2026-11-09", "Début de période (AAAA-MM-JJ) — à fournir avec `au`"),
                query("au", "2026-11-15", "Fin de période (AAAA-MM-JJ), 366 jours maximum"),
            ],
            responses: { ...rep([200, 400, 401, 403, 404, 500]), 200: { description: "Grille de 7 jours (+ `periode` et `conges` si du/au fournis)", content: enveloppe({ type: "object", properties: { enseignant: { type: "object" }, semaine: { $ref: "#/components/schemas/GrilleSemaine" }, periode: { type: "object" }, conges: { type: "array", items: { type: "object" } } } }) } },
        },
    },
    "/api/v1/planning/eleves/{mat_eleve}": {
        get: {
            tags: ["Planning"], security: bearer, summary: "Planning d'un élève",
            description:
                "Déduit de : inscription validée → classe → créneaux actifs. Direction et personnel ; élève : le sien ; parent : ceux de ses enfants " +
                "(table est_responsable_de). Un élève sans inscription validée reçoit une grille vide (`classe: null`).",
            parameters: [param("mat_eleve", "ELEVE-DEMO-PLAN", "Matricule de l'élève")],
            responses: rep([200, 401, 403, 404, 500]),
        },
    },
    "/api/v1/planning/salles/{id}": {
        get: {
            tags: ["Planning"], security: bearer, summary: "Planning d'une salle",
            description: "Direction et personnel uniquement (la vue révèle les créneaux de plusieurs enseignants).",
            parameters: [param("id", 1, "Identifiant de la salle", "integer")],
            responses: rep([200, 400, 401, 403, 404, 500]),
        },
    },
    "/api/v1/planning/salles/libres": {
        get: {
            tags: ["Planning"], security: bearer, summary: "Salles libres sur une plage horaire",
            description:
                "Direction et personnel. Toutes les salles de l'établissement moins celles ayant un créneau ACTIF qui chevauche la plage " +
                "(bornes strictes : une salle libérée à 10:00 est libre de 10:00 à 12:00). Un créneau annulé libère la salle.",
            parameters: [
                query("jour", "lundi", "Jour de la semaine", true),
                query("debut", "08:00", "Heure de début (HH:MM)", true),
                query("fin", "10:00", "Heure de fin (HH:MM), après le début", true),
                query("capacite_min", 30, "Capacité minimale (les salles sans capacité renseignée sont exclues)", false, "integer"),
                query("eta_id", "demo-eta-001", "Uniquement pour un compte sans établissement"),
            ],
            responses: rep([200, 400, 401, 403, 500]),
        },
    },

    /* ----------------------------- CONGÉS (1) ------------------------------- */
    "/api/v1/conges/{conge_id}/creneaux-impactes": {
        get: {
            tags: ["Congés"], security: bearer, summary: "Créneaux d'un enseignant touchés par un congé (RG-PLAN-06)",
            description:
                "Direction et personnel. La période du congé est convertie en jours de la semaine, puis croisée avec les créneaux actifs de l'enseignant " +
                "(lien congé.usr_id → enseignant, congé.rh_id → personnel RH). L'indisponibilité est CALCULÉE à chaque appel, jamais stockée. " +
                "Pour un congé non validé, le résultat est un simple aperçu (`impact_effectif: false`). " +
                "Le déclenchement automatique à la validation d'un congé sera branché en semaine 10 (module RH).",
            parameters: [param("conge_id", "demo-conge-001", "Identifiant du congé")],
            responses: { ...rep([200, 400, 401, 403, 404, 500]), 422: { description: "Le congé ne concerne pas un enseignant" } },
        },
    },
};