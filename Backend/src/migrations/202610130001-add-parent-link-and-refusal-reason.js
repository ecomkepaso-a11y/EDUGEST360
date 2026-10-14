export async function up(queryInterface, Sequelize) {
    // Relie un compte parent authentifié à son profil parent_tuteur.
    await queryInterface.addColumn("parent_tuteur", "usr_id", {
        type: Sequelize.STRING(36),
        allowNull: true,
        unique: true,
    });
    await queryInterface.addConstraint("parent_tuteur", {
        fields: ["usr_id"],
        type: "foreign key",
        references: { table: "utilisateur", field: "usr_id" },
        name: "fk_parent_utilisateur",
    });

    // Le motif de refus est conservé avec le dossier d'inscription.
    await queryInterface.addColumn("inscription", "motif_refus", {
        type: Sequelize.STRING(500),
        allowNull: true,
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn("inscription", "motif_refus");
    await queryInterface.removeConstraint("parent_tuteur", "fk_parent_utilisateur");
    await queryInterface.removeColumn("parent_tuteur", "usr_id");
}
