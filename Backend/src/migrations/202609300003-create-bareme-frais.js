export async function up(queryInterface, Sequelize) {
    /*
     * ============================================================
     * Création de la table bareme_frais
     * ============================================================
     */

    await queryInterface.createTable(
    "bareme_frais",
    {
        bareme_id: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },

        code_annee_scolaire: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },

        code_niveau: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },

        code_filiere: {
            type: Sequelize.STRING(20),
            allowNull: true,
        },

        montant: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
        },
    },
    {
        engine: "InnoDB",
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
    }
);

    /*
     * ============================================================
     * Contrainte : le montant ne peut pas être négatif
     * ============================================================
     */

    await queryInterface.addConstraint("bareme_frais", {
        fields: ["montant"],
        type: "check",
        where: {
            montant: {
                [Sequelize.Op.gte]: 0,
            },
        },
        name: "chk_bareme_montant",
    });

    /*
     * ============================================================
     * Clé étrangère : année scolaire
     * ============================================================
     */

    await queryInterface.addConstraint("bareme_frais", {
        fields: ["code_annee_scolaire"],
        type: "foreign key",
        references: {
            table: "annee_scolaire",
            field: "code_annee_scolaire",
        },
        name: "fk_bareme_anneescolaire",
    });

    /*
     * ============================================================
     * Clé étrangère : niveau
     * ============================================================
     */

    await queryInterface.addConstraint("bareme_frais", {
        fields: ["code_niveau"],
        type: "foreign key",
        references: {
            table: "niveau",
            field: "code_niveau",
        },
        name: "fk_bareme_niveau",
    });

    /*
     * ============================================================
     * Clé étrangère : filière
     * ============================================================
     */

    await queryInterface.addConstraint("bareme_frais", {
        fields: ["code_filiere"],
        type: "foreign key",
        references: {
            table: "filiere",
            field: "code_filiere",
        },
        name: "fk_bareme_filiere",
    });

    /*
     * ============================================================
     * UNICITÉ DU BARÈME
     *
     * Problème MySQL :
     * un UNIQUE classique autorise plusieurs NULL.
     *
     * Exemple interdit fonctionnellement :
     *
     * 2026-2027 | NIV-1 | NULL
     * 2026-2027 | NIV-1 | NULL
     *
     * Pour éviter cela, NULL est traité comme une valeur vide
     * dans l'index fonctionnel.
     * ============================================================
     */

    await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX uq_bareme
        ON bareme_frais (
            code_annee_scolaire,
            code_niveau,
            (COALESCE(code_filiere, ''))
        )
    `);
}

export async function down(queryInterface) {
    /*
     * Suppression dans l'ordre inverse de la création.
     */

    await queryInterface.sequelize.query(`
        DROP INDEX uq_bareme ON bareme_frais
    `);

    await queryInterface.removeConstraint(
        "bareme_frais",
        "fk_bareme_filiere"
    );

    await queryInterface.removeConstraint(
        "bareme_frais",
        "fk_bareme_niveau"
    );

    await queryInterface.removeConstraint(
        "bareme_frais",
        "fk_bareme_anneescolaire"
    );

    await queryInterface.removeConstraint(
        "bareme_frais",
        "chk_bareme_montant"
    );

    await queryInterface.dropTable("bareme_frais");
}