export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn("necessite", "fournie", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    });

    await queryInterface.addColumn("necessite", "date_depot", {
        type: Sequelize.DATEONLY,
        allowNull: true,
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn("necessite", "date_depot");
    await queryInterface.removeColumn("necessite", "fournie");
}