const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const STATUTS = ["actif", "annule"];
const inList = (values) => values.map((v) => `'${v}'`).join(",");

export async function up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);
    const scalar = async (sql) => {
        const [rows] = await q(sql);
        return Number(Object.values(rows[0])[0]);
    };

    /* 0. PRÉ-CONTRÔLES (aucun DDL ici) */
    const nbSalles = await scalar("SELECT COUNT(*) FROM salle");
    const nbEtablissements = await scalar("SELECT COUNT(*) FROM etablissement");
    if (nbSalles > 0 && nbEtablissements === 0) {
        throw new Error("Des salles existent mais aucun établissement pour les rattacher.");
    }

    // Normalise 'Lundi', ' mardi ' etc. avant d'ajouter les CHECK
    await q("UPDATE creneau_planning SET plan_jour = LOWER(TRIM(plan_jour)), plan_statut = LOWER(TRIM(plan_statut))");

    const [joursInvalides] = await q(
        `SELECT DISTINCT plan_jour AS valeur FROM creneau_planning WHERE plan_jour NOT IN (${inList(JOURS)})`
    );
    if (joursInvalides.length > 0) {
        throw new Error("Jours non reconnus : " + joursInvalides.map((r) => `'${r.valeur}'`).join(", "));
    }

    const [statutsInvalides] = await q(
        `SELECT DISTINCT plan_statut AS valeur FROM creneau_planning WHERE plan_statut NOT IN (${inList(STATUTS)})`
    );
    if (statutsInvalides.length > 0) {
        throw new Error("Statuts non reconnus : " + statutsInvalides.map((r) => `'${r.valeur}'`).join(", "));
    }

    /* 1. SALLE : clé de substitution, établissement, capacité */
    await q("ALTER TABLE creneau_planning DROP FOREIGN KEY fk_creneau_salle");
    await q("ALTER TABLE salle DROP PRIMARY KEY");
    await q(`
        ALTER TABLE salle
            CHANGE COLUMN plan_salle salle_nom VARCHAR(50) NOT NULL,
            ADD COLUMN salle_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
            ADD COLUMN eta_id VARCHAR(36) NULL AFTER salle_nom,
            ADD COLUMN capacite INT UNSIGNED NULL
    `);

    // Reprise des données (simplifiée : 1er établissement)
    await q(`
        UPDATE salle
           SET eta_id = (SELECT eta_id FROM etablissement ORDER BY eta_id LIMIT 1)
         WHERE eta_id IS NULL
    `);

    await q(`
        ALTER TABLE salle
            MODIFY COLUMN eta_id VARCHAR(36) NOT NULL,
            ADD CONSTRAINT fk_salle_etablissement FOREIGN KEY (eta_id) REFERENCES etablissement(eta_id),
            ADD CONSTRAINT uq_salle_eta_nom UNIQUE (eta_id, salle_nom),
            ADD CONSTRAINT chk_salle_capacite CHECK (capacite IS NULL OR capacite > 0)
    `);

    await q("ALTER TABLE creneau_planning ADD COLUMN salle_id INT UNSIGNED NULL");
    await q(`
        UPDATE creneau_planning c
          JOIN salle s ON s.salle_nom = c.plan_salle
           SET c.salle_id = s.salle_id
    `);

    // Garde-fou avant de supprimer plan_salle
    const orphelins = await scalar("SELECT COUNT(*) FROM creneau_planning WHERE salle_id IS NULL");
    if (orphelins > 0) {
        throw new Error(`${orphelins} créneau(x) sans salle_id : plan_salle n'a PAS été supprimée.`);
    }

    await q(`
        ALTER TABLE creneau_planning
            MODIFY COLUMN salle_id INT UNSIGNED NOT NULL,
            DROP COLUMN plan_salle,
            ADD CONSTRAINT fk_creneau_salle FOREIGN KEY (salle_id) REFERENCES salle(salle_id)
    `);

    /* 2. JOURS ET STATUTS VALIDES */
    await q(`
        ALTER TABLE creneau_planning
            ADD CONSTRAINT chk_creneau_jour CHECK (plan_jour IN (${inList(JOURS)})),
            ADD CONSTRAINT chk_creneau_statut CHECK (plan_statut IN (${inList(STATUTS)}))
    `);

    /* 3. PLAGES HORAIRES OFFICIELLES */
    await q(`
        ALTER TABLE etablissement
            ADD COLUMN eta_heure_ouverture TIME NOT NULL DEFAULT '07:00:00',
            ADD COLUMN eta_heure_fermeture TIME NOT NULL DEFAULT '18:00:00',
            ADD CONSTRAINT chk_eta_horaires CHECK (eta_heure_fermeture > eta_heure_ouverture)
    `);

    /* 4. INDEX DE DÉTECTION DE CONFLITS */
    await q(`CREATE INDEX idx_creneau_ens_jour ON creneau_planning
                 (enseignant_id, plan_jour, plan_heure_debut, plan_heure_fin)`);
    await q(`CREATE INDEX idx_creneau_salle_jour ON creneau_planning
                 (salle_id, plan_jour, plan_heure_debut, plan_heure_fin)`);
    await q(`CREATE INDEX idx_creneau_classe_jour ON creneau_planning
                 (code_classe, plan_jour, plan_heure_debut, plan_heure_fin)`);
}

export async function down(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // Deux salles de même nom dans deux établissements : impossible de revenir à PK = nom
    const [doublons] = await q("SELECT salle_nom FROM salle GROUP BY salle_nom HAVING COUNT(*) > 1");
    if (doublons.length > 0) {
        throw new Error(
            "Retour arrière impossible, noms en double : " + doublons.map((d) => `'${d.salle_nom}'`).join(", ")
        );
    }

    // Les index composites ont remplacé les index implicites des FK :
    // on recrée un index simple par FK avant de les supprimer 
    await q("CREATE INDEX idx_down_creneau_enseignant ON creneau_planning (enseignant_id)");
    await q("CREATE INDEX idx_down_creneau_classe ON creneau_planning (code_classe)");
    await q("DROP INDEX idx_creneau_ens_jour ON creneau_planning");
    await q("DROP INDEX idx_creneau_classe_jour ON creneau_planning");

    await q("ALTER TABLE etablissement DROP CONSTRAINT chk_eta_horaires");
    await q("ALTER TABLE etablissement DROP COLUMN eta_heure_ouverture, DROP COLUMN eta_heure_fermeture");

    await q("ALTER TABLE creneau_planning DROP CONSTRAINT chk_creneau_jour");
    await q("ALTER TABLE creneau_planning DROP CONSTRAINT chk_creneau_statut");

    await q("ALTER TABLE creneau_planning DROP FOREIGN KEY fk_creneau_salle");
    await q("DROP INDEX idx_creneau_salle_jour ON creneau_planning");
    await q("ALTER TABLE creneau_planning ADD COLUMN plan_salle VARCHAR(50) NULL");
    await q(`
        UPDATE creneau_planning c
          JOIN salle s ON s.salle_id = c.salle_id
           SET c.plan_salle = s.salle_nom
    `);
    await q(`
        ALTER TABLE creneau_planning
            MODIFY COLUMN plan_salle VARCHAR(50) NOT NULL,
            DROP COLUMN salle_id
    `);

    await q("ALTER TABLE salle DROP FOREIGN KEY fk_salle_etablissement");
    await q("ALTER TABLE salle DROP CONSTRAINT chk_salle_capacite");
    await q("ALTER TABLE salle DROP INDEX uq_salle_eta_nom");
    // Supprimer salle_id retire aussi la PK AUTO_INCREMENT ;
    // un DROP PRIMARY KEY séparé serait refusé par MySQL.
    await q(`
        ALTER TABLE salle
            DROP COLUMN salle_id,
            DROP COLUMN eta_id,
            DROP COLUMN capacite,
            CHANGE COLUMN salle_nom plan_salle VARCHAR(50) NOT NULL,
            ADD PRIMARY KEY (plan_salle)
    `);

    await q(`
        ALTER TABLE creneau_planning
            ADD CONSTRAINT fk_creneau_salle FOREIGN KEY (plan_salle) REFERENCES salle(plan_salle)
    `);
}