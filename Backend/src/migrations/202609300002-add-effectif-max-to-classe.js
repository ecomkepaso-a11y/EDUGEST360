export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn("classe", "effectif_max", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn("classe", "effectif_max");
}