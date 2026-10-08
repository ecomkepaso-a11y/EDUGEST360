import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.3",

    info: {
        title: "EDUGEST 360 API",
        version: "1.0.0",
        description:
            "API REST de gestion scolaire EDUGEST 360. " +
            "Cette documentation présente les endpoints, les règles RBAC, " +
            "les paramètres, les données de démonstration et les réponses HTTP.",
    },

    servers: [
        {
            url: "http://localhost:3000",
            description: "Serveur local de développement",
        },
    ],

    tags: [
        {
            name: "Authentification",
            description: "Connexion et authentification des utilisateurs",
        },
        {
            name: "Établissements",
            description: "Gestion des établissements scolaires",
        },
        {
            name: "Classes",
            description: "Gestion des classes",
        },
        {
            name: "Utilisateurs",
            description: "Gestion des comptes utilisateurs",
        },
        {
            name: "Élèves",
            description: "Gestion des profils élèves/apprenants",
        },
        {
            name: "Enseignants",
            description: "Gestion des profils enseignants/formateurs",
        },
        {
            name: "Personnel",
            description: "Gestion du personnel administratif",
        },
        {
            name: "Parents",
            description: "Gestion des parents/tuteurs et relations avec les élèves",
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description:
                    "Entrez le JWT obtenu lors de la connexion. Exemple : Bearer eyJhbGciOiJIUzI1NiIs...",
            },
        },

        schemas: {
            LoginRequest: {
                type: "object",
                required: ["login", "password"],
                properties: {
                    login: {
                        type: "string",
                        example: "demo.direction",
                    },
                    password: {
                        type: "string",
                        example: "Demo@12345",
                    },
                },
            },

            Etablissement: {
                type: "object",
                required: [
                    "eta_id",
                    "eta_code",
                    "eta_nom",
                    "eta_type",
                    "eta_adresse",
                    "eta_ville",
                    "eta_pays",
                    "eta_tel",
                    "eta_email",
                ],
                properties: {
                    eta_id: {
                        type: "string",
                        example: "demo-eta-001",
                    },
                    eta_code: {
                        type: "string",
                        example: "EDU360-CM",
                    },
                    eta_nom: {
                        type: "string",
                        example: "EDUGEST 360 Demo",
                    },
                    eta_type: {
                        type: "string",
                        example: "secondaire",
                    },
                    eta_adresse: {
                        type: "string",
                        example: "Douala",
                    },
                    eta_ville: {
                        type: "string",
                        example: "Douala",
                    },
                    eta_pays: {
                        type: "string",
                        example: "Cameroun",
                    },
                    eta_tel: {
                        type: "string",
                        example: "+237600000000",
                    },
                    eta_email: {
                        type: "string",
                        format: "email",
                        example: "demo@edugest360.com",
                    },
                    eta_statut: {
                        type: "string",
                        example: "actif",
                    },
                },
            },

            Classe: {
                type: "object",
                required: [
                    "code_classe",
                    "libelle_classe",
                    "effectif_classe",
                    "eta_id",
                    "code_annee_scolaire",
                    "code_niveau",
                ],
                properties: {
                    code_classe: {
                        type: "string",
                        example: "CLS-INFO-1",
                    },
                    libelle_classe: {
                        type: "string",
                        example: "Informatique 1",
                    },
                    effectif_classe: {
                        type: "integer",
                        example: 35,
                    },
                    statut_classe: {
                        type: "boolean",
                        example: true,
                    },
                    eta_id: {
                        type: "string",
                        example: "demo-eta-001",
                    },
                    code_annee_scolaire: {
                        type: "string",
                        example: "2026-2027",
                    },
                    code_niveau: {
                        type: "string",
                        example: "NIV-1",
                    },
                    code_filiere: {
                        type: "string",
                        nullable: true,
                        example: "FIL-INFO",
                    },
                },
            },

            Utilisateur: {
                type: "object",
                properties: {
                    usr_id: {
                        type: "string",
                        example: "user-demo-direction",
                    },
                    usr_nom: {
                        type: "string",
                        example: "EDUGEST",
                    },
                    usr_prenom: {
                        type: "string",
                        example: "Direction",
                    },
                    usr_email: {
                        type: "string",
                        format: "email",
                        example: "direction@edugest360.com",
                    },
                    usr_tel: {
                        type: "string",
                        example: "+237600000000",
                    },
                    usr_login: {
                        type: "string",
                        example: "demo.direction",
                    },
                    usr_role: {
                        type: "string",
                        example: "direction",
                    },
                    usr_statut: {
                        type: "string",
                        example: "actif",
                    },
                    usr_date_creation: {
                        type: "string",
                        format: "date",
                        example: "2026-09-01",
                    },
                    eta_id: {
                        type: "string",
                        nullable: true,
                        example: "demo-eta-001",
                    },
                },
            },

            Eleve: {
                type: "object",
                properties: {
                    mat_eleve: {
                        type: "string",
                        example: "ELEVE-DEMO-001",
                    },
                    usr_id: {
                        type: "string",
                        nullable: true,
                        example: "user-demo-eleve",
                    },
                    nom_eleve: {
                        type: "string",
                        example: "Demo",
                    },
                    prenom_eleve: {
                        type: "string",
                        example: "Eleve",
                    },
                    sexe_eleve: {
                        type: "string",
                        example: "M",
                    },
                    date_naiss: {
                        type: "string",
                        format: "date",
                        example: "2008-05-15",
                    },
                    lieu_naiss: {
                        type: "string",
                        example: "Douala",
                    },
                    nationalite: {
                        type: "string",
                        example: "Camerounaise",
                    },
                },
            },

            ErrorResponse: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: false,
                    },
                    message: {
                        type: "string",
                        example: "Accès refusé",
                    },
                },
            },
        },

        responses: {
            Unauthorized: {
                description: "Authentification requise ou token invalide",
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },

            Forbidden: {
                description:
                    "Utilisateur authentifié mais rôle insuffisant",
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },

            NotFound: {
                description: "Ressource introuvable",
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },

            Conflict: {
                description: "Conflit avec une donnée unique existante",
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ErrorResponse",
                        },
                    },
                },
            },
        },
    },

    paths: {
        "/api/v1/auth/login": {
            post: {
                tags: ["Authentification"],
                summary: "Connexion utilisateur",
                description:
                    "Authentifie un utilisateur et retourne un JWT. " +
                    "Le token doit ensuite être utilisé avec Bearer Authentication.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LoginRequest",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Connexion réussie",
                    },
                    400: {
                        description: "Données de connexion invalides",
                    },
                    401: {
                        description: "Identifiants invalides",
                    },
                    403: {
                        description: "Compte utilisateur inactif",
                    },
                },
            },
        },

        "/api/v1/etablissements": {
            post: {
                tags: ["Établissements"],
                security: [{ bearerAuth: [] }],
                summary: "Créer un établissement",
                description:
                    "Accessible uniquement au rôle direction.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Etablissement",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Établissement créé",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    409: {
                        $ref: "#/components/responses/Conflict",
                    },
                },
            },

            get: {
                tags: ["Établissements"],
                security: [{ bearerAuth: [] }],
                summary: "Lister les établissements",
                description: "Accessible au rôle direction.",
                responses: {
                    200: {
                        description: "Liste des établissements",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/etablissements/{eta_id}": {
            get: {
                tags: ["Établissements"],
                security: [{ bearerAuth: [] }],
                summary: "Consulter un établissement",
                parameters: [
                    {
                        name: "eta_id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "demo-eta-001",
                    },
                ],
                responses: {
                    200: {
                        description: "Établissement trouvé",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },

            put: {
                tags: ["Établissements"],
                security: [{ bearerAuth: [] }],
                summary: "Modifier un établissement",
                description: "Accessible au rôle direction.",
                parameters: [
                    {
                        name: "eta_id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "demo-eta-001",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Etablissement",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Établissement modifié",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Établissements"],
                security: [{ bearerAuth: [] }],
                summary: "Désactiver un établissement",
                description:
                    "Effectue un soft delete en passant eta_statut à inactif.",
                parameters: [
                    {
                        name: "eta_id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "demo-eta-001",
                    },
                ],
                responses: {
                    200: {
                        description: "Établissement désactivé",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/classes": {
            post: {
                tags: ["Classes"],
                security: [{ bearerAuth: [] }],
                summary: "Créer une classe",
                description:
                    "Accessible aux rôles direction et personnel.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Classe",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Classe créée",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                    409: {
                        $ref: "#/components/responses/Conflict",
                    },
                },
            },

            get: {
                tags: ["Classes"],
                security: [{ bearerAuth: [] }],
                summary: "Lister les classes",
                description:
                    "Accessible aux rôles direction, personnel et enseignant. " +
                    "Les filtres annee_scolaire et niveau sont optionnels.",
                parameters: [
                    {
                        name: "annee_scolaire",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                        },
                        example: "2026-2027",
                    },
                    {
                        name: "niveau",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                        },
                        example: "NIV-1",
                    },
                ],
                responses: {
                    200: {
                        description: "Liste des classes",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/classes/{code_classe}": {
            get: {
                tags: ["Classes"],
                security: [{ bearerAuth: [] }],
                summary: "Consulter une classe",
                parameters: [
                    {
                        name: "code_classe",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "CLS-INFO-1",
                    },
                ],
                responses: {
                    200: {
                        description: "Classe trouvée",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },

            put: {
                tags: ["Classes"],
                security: [{ bearerAuth: [] }],
                summary: "Modifier une classe",
                description:
                    "Accessible aux rôles direction et personnel.",
                parameters: [
                    {
                        name: "code_classe",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "CLS-INFO-1",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Classe",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Classe modifiée",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Classes"],
                security: [{ bearerAuth: [] }],
                summary: "Désactiver une classe",
                description:
                    "Effectue un soft delete en passant statut_classe à false.",
                parameters: [
                    {
                        name: "code_classe",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "CLS-INFO-1",
                    },
                ],
                responses: {
                    200: {
                        description: "Classe désactivée",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/utilisateurs": {
            post: {
                tags: ["Utilisateurs"],
                security: [{ bearerAuth: [] }],
                summary: "Créer un compte utilisateur",
                description:
                    "Accessible aux rôles direction et personnel.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Utilisateur",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Utilisateur créé",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    409: {
                        $ref: "#/components/responses/Conflict",
                    },
                },
            },
        },

        "/api/v1/utilisateurs/{usr_id}": {
            get: {
                tags: ["Utilisateurs"],
                security: [{ bearerAuth: [] }],
                summary: "Consulter un compte utilisateur",
                description:
                    "Accessible à direction, personnel ou à l'utilisateur lui-même.",
                parameters: [
                    {
                        name: "usr_id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Utilisateur trouvé",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },

            put: {
                tags: ["Utilisateurs"],
                security: [{ bearerAuth: [] }],
                summary: "Modifier un compte utilisateur",
                description:
                    "Direction et personnel peuvent modifier les comptes autorisés. " +
                    "Un utilisateur peut modifier certains champs de son propre compte, " +
                    "mais ne peut pas modifier son rôle, son statut ou son établissement.",
                parameters: [
                    {
                        name: "usr_id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Utilisateur",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Utilisateur modifié",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                    409: {
                        $ref: "#/components/responses/Conflict",
                    },
                },
            },
        },

        "/api/v1/eleves": {
            post: {
                tags: ["Élèves"],
                security: [{ bearerAuth: [] }],
                summary: "Créer un profil élève/apprenant",
                description:
                    "Accessible aux rôles direction et personnel.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Eleve",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Profil élève créé",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    409: {
                        $ref: "#/components/responses/Conflict",
                    },
                },
            },

            get: {
                tags: ["Élèves"],
                security: [{ bearerAuth: [] }],
                summary: "Lister les élèves",
                description:
                    "Accessible aux rôles direction et personnel.",
                responses: {
                    200: {
                        description: "Liste des élèves",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/eleves/{mat_eleve}": {
            get: {
                tags: ["Élèves"],
                security: [{ bearerAuth: [] }],
                summary: "Consulter un élève",
                parameters: [
                    {
                        name: "mat_eleve",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "ELEVE-DEMO-001",
                    },
                ],
                responses: {
                    200: {
                        description: "Élève trouvé",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },

            put: {
                tags: ["Élèves"],
                security: [{ bearerAuth: [] }],
                summary: "Modifier un élève",
                parameters: [
                    {
                        name: "mat_eleve",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "ELEVE-DEMO-001",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Eleve",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Élève modifié",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },

            delete: {
                tags: ["Élèves"],
                security: [{ bearerAuth: [] }],
                summary: "Supprimer un élève",
                parameters: [
                    {
                        name: "mat_eleve",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "ELEVE-DEMO-001",
                    },
                ],
                responses: {
                    200: {
                        description: "Élève supprimé",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/eleves/{mat_eleve}/rattacher-utilisateur": {
            patch: {
                tags: ["Élèves"],
                security: [{ bearerAuth: [] }],
                summary: "Rattacher un compte utilisateur à un élève",
                parameters: [
                    {
                        name: "mat_eleve",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "ELEVE-DEMO-001",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["usr_id"],
                                properties: {
                                    usr_id: {
                                        type: "string",
                                        example: "user-demo-eleve",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Compte rattaché",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                },
            },
        },

        "/api/v1/enseignants": {
            post: {
                tags: ["Enseignants"],
                security: [{ bearerAuth: [] }],
                summary: "Créer un profil enseignant/formateur",
                description:
                    "Accessible aux rôles direction et personnel.",
                responses: {
                    201: {
                        description: "Profil enseignant créé",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },

            get: {
                tags: ["Enseignants"],
                security: [{ bearerAuth: [] }],
                summary: "Lister les enseignants",
                responses: {
                    200: {
                        description: "Liste des enseignants",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/personnels": {
            post: {
                tags: ["Personnel"],
                security: [{ bearerAuth: [] }],
                summary: "Créer un membre du personnel",
                description:
                    "Endpoint sensible réservé au rôle direction.",
                responses: {
                    201: {
                        description: "Personnel créé",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },

            get: {
                tags: ["Personnel"],
                security: [{ bearerAuth: [] }],
                summary: "Lister le personnel",
                responses: {
                    200: {
                        description: "Liste du personnel",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/parents": {
            post: {
                tags: ["Parents"],
                security: [{ bearerAuth: [] }],
                summary: "Créer un parent/tuteur",
                description:
                    "Accessible aux rôles direction et personnel.",
                responses: {
                    201: {
                        description: "Parent créé",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },

            get: {
                tags: ["Parents"],
                security: [{ bearerAuth: [] }],
                summary: "Lister les parents/tuteurs",
                responses: {
                    200: {
                        description: "Liste des parents",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                },
            },
        },

        "/api/v1/parents/{com_id}/enfants/{mat_eleve}": {
            post: {
                tags: ["Parents"],
                security: [{ bearerAuth: [] }],
                summary: "Rattacher un parent à un élève",
                description:
                    "Crée une relation dans est_responsable_de.",
                parameters: [
                    {
                        name: "com_id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "demo-parent-001",
                    },
                    {
                        name: "mat_eleve",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                        },
                        example: "ELEVE-DEMO-001",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["lien_parente"],
                                properties: {
                                    lien_parente: {
                                        type: "string",
                                        example: "père",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Relation parent/élève créée",
                    },
                    400: {
                        description: "Données invalides",
                    },
                    401: {
                        $ref: "#/components/responses/Unauthorized",
                    },
                    403: {
                        $ref: "#/components/responses/Forbidden",
                    },
                    404: {
                        $ref: "#/components/responses/NotFound",
                    },
                    409: {
                        $ref: "#/components/responses/Conflict",
                    },
                },
            },
        },
    },
};

const swaggerOptions = {
    definition: swaggerDefinition,

    // defining the API documentation directly
    // inside swaggerDefinition.paths.
    apis: [],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;