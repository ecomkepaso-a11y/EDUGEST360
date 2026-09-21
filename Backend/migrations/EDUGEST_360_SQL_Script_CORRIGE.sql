-- ============================================================
-- EDUGEST 360 — Script de création de la base de données
-- Version CORRIGÉE — MySQL 8.0+
-- Voir le document "EDUGEST360_Corrections_Script_SQL.docx"
-- pour le détail et la justification de chaque correction.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. ÉTABLISSEMENTS & STRUCTURE SCOLAIRE
-- ------------------------------------------------------------

CREATE TABLE etablissement (
  eta_id      VARCHAR(36)  NOT NULL,
  eta_code    VARCHAR(50)  NOT NULL,
  eta_nom     VARCHAR(255) NOT NULL,
  eta_type    VARCHAR(50)  NOT NULL,
  eta_adresse VARCHAR(255) NOT NULL,
  eta_ville   VARCHAR(100) NOT NULL,
  eta_pays    VARCHAR(100) NOT NULL,
  eta_tel     VARCHAR(20)  NOT NULL,
  eta_email   VARCHAR(255) NOT NULL,
  eta_statut  VARCHAR(20)  NOT NULL DEFAULT 'actif',
  PRIMARY KEY (eta_id),
  UNIQUE KEY uq_etablissement_code (eta_code),
  UNIQUE KEY uq_etablissement_email (eta_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE annee_scolaire (
  code_annee_scolaire VARCHAR(20) NOT NULL,
  date_debut_annee    DATE NOT NULL,
  date_fin_annee      DATE NOT NULL,
  eta_id              VARCHAR(36) NOT NULL,
  PRIMARY KEY (code_annee_scolaire),
  CONSTRAINT chk_anneescolaire_dates CHECK (date_fin_annee > date_debut_annee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE niveau (
  code_niveau    VARCHAR(20)  NOT NULL,
  libelle_niveau VARCHAR(100) NOT NULL,
  PRIMARY KEY (code_niveau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE filiere (
  code_filiere    VARCHAR(20)  NOT NULL,
  libelle_filiere VARCHAR(100) NOT NULL,
  PRIMARY KEY (code_filiere)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classe (
  code_classe         VARCHAR(50)  NOT NULL,
  libelle_classe      VARCHAR(100) NOT NULL,
  effectif_classe     INT UNSIGNED NOT NULL,
  statut_classe       BOOLEAN NOT NULL DEFAULT TRUE,
  eta_id              VARCHAR(36) NOT NULL,
  code_annee_scolaire VARCHAR(20) NOT NULL,
  code_niveau         VARCHAR(20) NOT NULL,
  code_filiere        VARCHAR(20) NULL,
  PRIMARY KEY (code_classe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. UTILISATEURS & RÔLES
-- ------------------------------------------------------------

CREATE TABLE utilisateur (
  usr_id            VARCHAR(36)  NOT NULL,
  usr_nom           VARCHAR(100) NOT NULL,
  usr_prenom        VARCHAR(100) NOT NULL,
  usr_email         VARCHAR(255) NOT NULL,
  usr_tel           VARCHAR(20),
  usr_login         VARCHAR(100) NOT NULL,
  usr_mdp_hash      VARCHAR(255) NOT NULL,
  usr_role          VARCHAR(30)  NOT NULL,
  usr_statut        VARCHAR(20)  NOT NULL DEFAULT 'actif',
  usr_date_creation DATE NOT NULL,
  eta_id            VARCHAR(36),
  PRIMARY KEY (usr_id),
  UNIQUE KEY uq_utilisateur_email (usr_email),
  UNIQUE KEY uq_utilisateur_login (usr_login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE eleve_apprenant (
  mat_eleve    VARCHAR(50)  NOT NULL,
  usr_id       VARCHAR(36)  NULL,
  nom_eleve    VARCHAR(100) NOT NULL,
  prenom_eleve VARCHAR(100) NOT NULL,
  sexe_eleve   VARCHAR(10)  NOT NULL,
  date_naiss   DATE NOT NULL,
  lieu_naiss   VARCHAR(100),
  nationalite  VARCHAR(100),
  PRIMARY KEY (mat_eleve),
  UNIQUE KEY uq_eleve_usr (usr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enseignant_formateur (
  enseignant_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usr_id                VARCHAR(36) NULL,
  enseignant_specialite VARCHAR(150),
  enseignant_statut     BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (enseignant_id),
  UNIQUE KEY uq_enseignant_usr (usr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE personnel (
  rh_id            VARCHAR(36)  NOT NULL,
  usr_id           VARCHAR(36)  NULL,
  rh_matricule     VARCHAR(50)  NOT NULL,
  rh_fonction      VARCHAR(100) NOT NULL,
  rh_date_embauche DATE NOT NULL,
  rh_salaire_base  DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (rh_id),
  UNIQUE KEY uq_personnel_matricule (rh_matricule),
  UNIQUE KEY uq_personnel_usr (usr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE parent_tuteur (
  com_id     VARCHAR(36) NOT NULL,
  com_canal  VARCHAR(20) NOT NULL,
  com_statut VARCHAR(20) NOT NULL DEFAULT 'actif',
  PRIMARY KEY (com_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE est_responsable_de (
  mat_eleve    VARCHAR(50) NOT NULL,
  com_id       VARCHAR(36) NOT NULL,
  lien_parente VARCHAR(30) NOT NULL,
  PRIMARY KEY (mat_eleve, com_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. PLANNING
-- ------------------------------------------------------------

CREATE TABLE matiere (
  matiere_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  matiere_code        VARCHAR(30)  NOT NULL,
  matiere_libelle     VARCHAR(150) NOT NULL,
  matiere_description VARCHAR(255),
  PRIMARY KEY (matiere_id),
  UNIQUE KEY uq_matiere_code (matiere_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE salle (
  plan_salle VARCHAR(50) NOT NULL,
  PRIMARY KEY (plan_salle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enseign (
  matiere_id    INT UNSIGNED NOT NULL,
  enseignant_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (matiere_id, enseignant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE creneau_planning (
  plan_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_jour        VARCHAR(10) NOT NULL,
  plan_heure_debut TIME NOT NULL,
  plan_heure_fin   TIME NOT NULL,
  plan_statut      VARCHAR(20) NOT NULL DEFAULT 'actif',
  code_classe      VARCHAR(50) NOT NULL,
  matiere_id       INT UNSIGNED NOT NULL,
  enseignant_id    INT UNSIGNED NOT NULL,
  plan_salle       VARCHAR(50) NOT NULL,
  PRIMARY KEY (plan_id),
  CONSTRAINT chk_creneau_horaires CHECK (plan_heure_fin > plan_heure_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. ÉVALUATIONS & BULLETINS
-- ------------------------------------------------------------

CREATE TABLE evaluation (
  eval_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  eval_libelle     VARCHAR(150) NOT NULL,
  eval_type        VARCHAR(50)  NOT NULL,
  eval_note_max    INT UNSIGNED NOT NULL,
  eval_coefficient INT UNSIGNED NOT NULL,
  eval_periode     VARCHAR(20)  NOT NULL,
  code_classe      VARCHAR(50)  NOT NULL,
  matiere_id       INT UNSIGNED NOT NULL,
  PRIMARY KEY (eval_id),
  CONSTRAINT chk_eval_notemax CHECK (eval_note_max > 0),
  CONSTRAINT chk_eval_coefficient CHECK (eval_coefficient > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE note (
  note_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  note_valeur      DECIMAL(5,2) NOT NULL,
  note_observation VARCHAR(255),
  eval_id          INT UNSIGNED NOT NULL,
  mat_eleve        VARCHAR(50) NOT NULL,
  PRIMARY KEY (note_id),
  UNIQUE KEY uq_note_eval_eleve (eval_id, mat_eleve),
  CONSTRAINT chk_note_valeur CHECK (note_valeur >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bulletin (
  bulletin_id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  bulletin_periode          VARCHAR(20) NOT NULL,
  bulletin_moyenne_generale DECIMAL(5,2) NOT NULL,
  bulletin_date_publication DATE NOT NULL,
  bulletin_statut           VARCHAR(20) NOT NULL DEFAULT 'brouillon',
  bulletin_version          INT UNSIGNED NOT NULL DEFAULT 1,
  mat_eleve                 VARCHAR(50) NOT NULL,
  PRIMARY KEY (bulletin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. STAGES & FORMATIONS
-- ------------------------------------------------------------

CREATE TABLE stage (
  stg_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  stg_structure  VARCHAR(255) NOT NULL,
  stg_date_debut DATE NOT NULL,
  stg_date_fin   DATE NOT NULL,
  stg_statut     BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (stg_id),
  CONSTRAINT chk_stage_dates CHECK (stg_date_fin >= stg_date_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE effectue (
  mat_eleve VARCHAR(50) NOT NULL,
  stg_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (mat_eleve, stg_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE formation (
  formation_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  formation_libelle     VARCHAR(150) NOT NULL,
  formation_date_debut  DATE NOT NULL,
  formation_date_fin    DATE NOT NULL,
  formation_description VARCHAR(255),
  formation_statut      BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (formation_id),
  CONSTRAINT chk_formation_dates CHECK (formation_date_fin >= formation_date_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE participer (
  mat_eleve    VARCHAR(50) NOT NULL,
  formation_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (mat_eleve, formation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE animer (
  enseignant_id INT UNSIGNED NOT NULL,
  formation_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (enseignant_id, formation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. TRÉSORERIE & PAIEMENTS
-- ------------------------------------------------------------

CREATE TABLE facture_echeance (
  fact_id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  fin_montant_frais DECIMAL(12,2) NOT NULL,
  fin_date_echeance DATE NOT NULL,
  fin_statut        VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  mat_eleve         VARCHAR(50) NOT NULL,
  PRIMARY KEY (fact_id),
  CONSTRAINT chk_facture_montant CHECK (fin_montant_frais >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE paiement (
  pay_id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  fin_montant_paye  DECIMAL(12,2) NOT NULL,
  fin_date_paiement DATE NOT NULL,
  fin_mode_paiement VARCHAR(30) NOT NULL,
  fact_id           INT UNSIGNED NOT NULL,
  PRIMARY KEY (pay_id),
  CONSTRAINT chk_paiement_montant CHECK (fin_montant_paye >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. RESSOURCES HUMAINES
-- ------------------------------------------------------------

CREATE TABLE salaire (
  salaire_id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  salaire_montant_base       DECIMAL(12,2) NOT NULL,
  salaire_mois               TINYINT UNSIGNED NOT NULL,
  salaire_annee               SMALLINT UNSIGNED NOT NULL,
  salaire_elements_variables VARCHAR(255),
  salaire_montant_net        DECIMAL(12,2) NOT NULL,
  salaire_statut             VARCHAR(20) NOT NULL DEFAULT 'genere',
  rh_id                      VARCHAR(36) NOT NULL,
  PRIMARY KEY (salaire_id),
  UNIQUE KEY uq_salaire_periode (rh_id, salaire_mois, salaire_annee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conge (
  conge_id         VARCHAR(36) NOT NULL,
  conge_date_debut DATE NOT NULL,
  conge_date_fin   DATE NOT NULL,
  conge_motif      VARCHAR(255) NOT NULL,
  rh_statut_conge  ENUM('en_attente','valide','refuse') NOT NULL DEFAULT 'en_attente',
  rh_id            VARCHAR(36) NOT NULL,
  usr_id           VARCHAR(36) NOT NULL,
  PRIMARY KEY (conge_id),
  CONSTRAINT chk_conge_dates CHECK (conge_date_fin >= conge_date_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE avance_salaire (
  avance_id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  avance_montant         DECIMAL(12,2) NOT NULL,
  avance_date_demande    DATE NOT NULL,
  avance_motif           VARCHAR(250),
  avance_statut          ENUM('en_attente','validee','refusee') NOT NULL DEFAULT 'en_attente',
  avance_date_validation DATE,
  rh_id                  VARCHAR(36) NOT NULL,
  PRIMARY KEY (avance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. COMMUNICATION & ALERTES
-- ------------------------------------------------------------

CREATE TABLE alerte_notification (
  com_id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  com_canal           VARCHAR(20) NOT NULL,
  com_statut          BOOLEAN NOT NULL DEFAULT FALSE,
  com_contenu         VARCHAR(500) NOT NULL,
  com_date_envoi      DATETIME,
  com_date_lecture    DATETIME,
  usr_id_destinataire VARCHAR(36) NOT NULL,
  usr_id_emetteur     VARCHAR(36),
  PRIMARY KEY (com_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE concerner (
  mat_eleve VARCHAR(50) NOT NULL,
  com_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (mat_eleve, com_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE signalement (
  usr_id VARCHAR(36) NOT NULL,
  abs_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (usr_id, abs_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. INSCRIPTIONS
-- ------------------------------------------------------------

CREATE TABLE piece_requise (
  piece_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  piece_nom         VARCHAR(200) NOT NULL,
  piece_description VARCHAR(500),
  piece_quantite    INT UNSIGNED NOT NULL DEFAULT 1,
  piece_obligatoire BOOLEAN NOT NULL DEFAULT TRUE,
  piece_statut      VARCHAR(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (piece_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inscription (
  ins_id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mat_eleve           VARCHAR(50) NOT NULL,
  date_inscription    DATE NOT NULL,
  statut_inscription  VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  code_annee_scolaire VARCHAR(20) NOT NULL,
  code_classe         VARCHAR(50) NOT NULL,
  fact_id             INT UNSIGNED,
  PRIMARY KEY (ins_id),
  UNIQUE KEY uq_inscription_eleve_annee (mat_eleve, code_annee_scolaire)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE necessite (
  ins_id   INT UNSIGNED NOT NULL,
  piece_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (ins_id, piece_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. VIE SCOLAIRE : ABSENCES, DISCIPLINE, ACTIVITÉS, BIBLIOTHÈQUE
-- ------------------------------------------------------------

CREATE TABLE absence (
  abs_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  abs_date        DATE NOT NULL,
  abs_heure_debut TIME NOT NULL,
  abs_heure_fin   TIME NOT NULL,
  abs_motif       VARCHAR(255),
  abs_justifiee   BOOLEAN NOT NULL DEFAULT FALSE,
  abs_statut      BOOLEAN NOT NULL DEFAULT TRUE,
  mat_eleve       VARCHAR(50) NOT NULL,
  PRIMARY KEY (abs_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incident_disciplinaire (
  dis_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  dis_type        VARCHAR(100) NOT NULL,
  dis_description VARCHAR(500) NOT NULL,
  dis_date        DATE NOT NULL,
  dis_sanction    VARCHAR(255),
  dis_statut      BOOLEAN NOT NULL DEFAULT TRUE,
  mat_eleve       VARCHAR(50) NOT NULL,
  usr_id          VARCHAR(36) NOT NULL,
  PRIMARY KEY (dis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activite_parascolaire (
  act_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  eta_id          VARCHAR(36) NOT NULL,
  act_nom         VARCHAR(255) NOT NULL,
  act_description VARCHAR(500),
  act_type        VARCHAR(50) NOT NULL,
  act_date_debut  DATE NOT NULL,
  act_date_fin    DATE NOT NULL,
  act_statut      VARCHAR(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (act_id),
  CONSTRAINT chk_activite_dates CHECK (act_date_fin >= act_date_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE participation_activite (
  participation_id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  participation_date_inscription DATE NOT NULL,
  participation_statut           VARCHAR(20) NOT NULL DEFAULT 'inscrit',
  participation_observation      VARCHAR(500),
  mat_eleve                      VARCHAR(50) NOT NULL,
  act_id                         INT UNSIGNED NOT NULL,
  PRIMARY KEY (participation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bibliotheque (
  bibliotheque_id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  bibliotheque_nom          VARCHAR(150) NOT NULL,
  bibliotheque_localisation VARCHAR(255) NOT NULL,
  bibliotheque_statut       VARCHAR(20) NOT NULL DEFAULT 'active',
  eta_id                    VARCHAR(36) NOT NULL,
  PRIMARY KEY (bibliotheque_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE livre (
  livre_id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  livre_isbn               VARCHAR(20) NOT NULL,
  livre_titre              VARCHAR(200) NOT NULL,
  livre_auteur             VARCHAR(200) NOT NULL,
  livre_categorie          VARCHAR(100) NOT NULL,
  livre_annee_publication  YEAR,
  livre_quantite           INT UNSIGNED NOT NULL DEFAULT 1,
  livre_quantite_disponible INT UNSIGNED NOT NULL DEFAULT 1,
  livre_statut             BOOLEAN NOT NULL DEFAULT TRUE,
  bibliotheque_id          INT UNSIGNED NOT NULL,
  PRIMARY KEY (livre_id),
  UNIQUE KEY uq_livre_isbn (livre_isbn),
  CONSTRAINT chk_livre_quantite CHECK (livre_quantite_disponible <= livre_quantite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE emprunt (
  emprunt_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  emprunt_date        DATETIME NOT NULL,
  emprunt_date_retour DATE NOT NULL,
  emprunt_statut      VARCHAR(20) NOT NULL DEFAULT 'en_cours',
  mat_eleve           VARCHAR(50) NOT NULL,
  livre_id            INT UNSIGNED NOT NULL,
  PRIMARY KEY (emprunt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CLÉS ÉTRANGÈRES
-- Chaque nom de contrainte est préfixé par la table d'origine
-- afin de garantir une unicité globale (exigence MySQL).
-- ============================================================

ALTER TABLE annee_scolaire
  ADD CONSTRAINT fk_anneescolaire_etablissement FOREIGN KEY (eta_id) REFERENCES etablissement(eta_id);

ALTER TABLE classe
  ADD CONSTRAINT fk_classe_etablissement FOREIGN KEY (eta_id) REFERENCES etablissement(eta_id),
  ADD CONSTRAINT fk_classe_anneescolaire FOREIGN KEY (code_annee_scolaire) REFERENCES annee_scolaire(code_annee_scolaire),
  ADD CONSTRAINT fk_classe_niveau FOREIGN KEY (code_niveau) REFERENCES niveau(code_niveau),
  ADD CONSTRAINT fk_classe_filiere FOREIGN KEY (code_filiere) REFERENCES filiere(code_filiere);

ALTER TABLE utilisateur
  ADD CONSTRAINT fk_utilisateur_etablissement FOREIGN KEY (eta_id) REFERENCES etablissement(eta_id);

ALTER TABLE eleve_apprenant
  ADD CONSTRAINT fk_eleve_utilisateur FOREIGN KEY (usr_id) REFERENCES utilisateur(usr_id);

ALTER TABLE enseignant_formateur
  ADD CONSTRAINT fk_enseignant_utilisateur FOREIGN KEY (usr_id) REFERENCES utilisateur(usr_id);

ALTER TABLE personnel
  ADD CONSTRAINT fk_personnel_utilisateur FOREIGN KEY (usr_id) REFERENCES utilisateur(usr_id);

ALTER TABLE est_responsable_de
  ADD CONSTRAINT fk_responsable_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_responsable_parent FOREIGN KEY (com_id) REFERENCES parent_tuteur(com_id);

ALTER TABLE enseign
  ADD CONSTRAINT fk_enseign_matiere FOREIGN KEY (matiere_id) REFERENCES matiere(matiere_id),
  ADD CONSTRAINT fk_enseign_enseignant FOREIGN KEY (enseignant_id) REFERENCES enseignant_formateur(enseignant_id);

ALTER TABLE creneau_planning
  ADD CONSTRAINT fk_creneau_classe FOREIGN KEY (code_classe) REFERENCES classe(code_classe),
  ADD CONSTRAINT fk_creneau_matiere FOREIGN KEY (matiere_id) REFERENCES matiere(matiere_id),
  ADD CONSTRAINT fk_creneau_enseignant FOREIGN KEY (enseignant_id) REFERENCES enseignant_formateur(enseignant_id),
  ADD CONSTRAINT fk_creneau_salle FOREIGN KEY (plan_salle) REFERENCES salle(plan_salle);

ALTER TABLE evaluation
  ADD CONSTRAINT fk_evaluation_classe FOREIGN KEY (code_classe) REFERENCES classe(code_classe),
  ADD CONSTRAINT fk_evaluation_matiere FOREIGN KEY (matiere_id) REFERENCES matiere(matiere_id);

ALTER TABLE note
  ADD CONSTRAINT fk_note_evaluation FOREIGN KEY (eval_id) REFERENCES evaluation(eval_id),
  ADD CONSTRAINT fk_note_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve);

ALTER TABLE bulletin
  ADD CONSTRAINT fk_bulletin_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve);

ALTER TABLE effectue
  ADD CONSTRAINT fk_effectue_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_effectue_stage FOREIGN KEY (stg_id) REFERENCES stage(stg_id);

ALTER TABLE participer
  ADD CONSTRAINT fk_participer_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_participer_formation FOREIGN KEY (formation_id) REFERENCES formation(formation_id);

ALTER TABLE animer
  ADD CONSTRAINT fk_animer_enseignant FOREIGN KEY (enseignant_id) REFERENCES enseignant_formateur(enseignant_id),
  ADD CONSTRAINT fk_animer_formation FOREIGN KEY (formation_id) REFERENCES formation(formation_id);

ALTER TABLE facture_echeance
  ADD CONSTRAINT fk_facture_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve);

ALTER TABLE paiement
  ADD CONSTRAINT fk_paiement_facture FOREIGN KEY (fact_id) REFERENCES facture_echeance(fact_id);

ALTER TABLE salaire
  ADD CONSTRAINT fk_salaire_personnel FOREIGN KEY (rh_id) REFERENCES personnel(rh_id);

ALTER TABLE conge
  ADD CONSTRAINT fk_conge_personnel FOREIGN KEY (rh_id) REFERENCES personnel(rh_id),
  ADD CONSTRAINT fk_conge_utilisateur FOREIGN KEY (usr_id) REFERENCES utilisateur(usr_id);

ALTER TABLE avance_salaire
  ADD CONSTRAINT fk_avance_personnel FOREIGN KEY (rh_id) REFERENCES personnel(rh_id);

ALTER TABLE alerte_notification
  ADD CONSTRAINT fk_alerte_destinataire FOREIGN KEY (usr_id_destinataire) REFERENCES utilisateur(usr_id),
  ADD CONSTRAINT fk_alerte_emetteur FOREIGN KEY (usr_id_emetteur) REFERENCES utilisateur(usr_id);

ALTER TABLE concerner
  ADD CONSTRAINT fk_concerner_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_concerner_alerte FOREIGN KEY (com_id) REFERENCES alerte_notification(com_id);

ALTER TABLE signalement
  ADD CONSTRAINT fk_signal_utilisateur FOREIGN KEY (usr_id) REFERENCES utilisateur(usr_id),
  ADD CONSTRAINT fk_signal_absence FOREIGN KEY (abs_id) REFERENCES absence(abs_id);

ALTER TABLE inscription
  ADD CONSTRAINT fk_inscription_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_inscription_anneescolaire FOREIGN KEY (code_annee_scolaire) REFERENCES annee_scolaire(code_annee_scolaire),
  ADD CONSTRAINT fk_inscription_classe FOREIGN KEY (code_classe) REFERENCES classe(code_classe),
  ADD CONSTRAINT fk_inscription_facture FOREIGN KEY (fact_id) REFERENCES facture_echeance(fact_id);

ALTER TABLE necessite
  ADD CONSTRAINT fk_necessite_inscription FOREIGN KEY (ins_id) REFERENCES inscription(ins_id),
  ADD CONSTRAINT fk_necessite_piece FOREIGN KEY (piece_id) REFERENCES piece_requise(piece_id);

ALTER TABLE absence
  ADD CONSTRAINT fk_absence_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve);

ALTER TABLE incident_disciplinaire
  ADD CONSTRAINT fk_incident_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_incident_utilisateur FOREIGN KEY (usr_id) REFERENCES utilisateur(usr_id);

ALTER TABLE activite_parascolaire
  ADD CONSTRAINT fk_activite_etablissement FOREIGN KEY (eta_id) REFERENCES etablissement(eta_id);

ALTER TABLE participation_activite
  ADD CONSTRAINT fk_participation_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_participation_activite FOREIGN KEY (act_id) REFERENCES activite_parascolaire(act_id);

ALTER TABLE bibliotheque
  ADD CONSTRAINT fk_bibliotheque_etablissement FOREIGN KEY (eta_id) REFERENCES etablissement(eta_id);

ALTER TABLE livre
  ADD CONSTRAINT fk_livre_bibliotheque FOREIGN KEY (bibliotheque_id) REFERENCES bibliotheque(bibliotheque_id);

ALTER TABLE emprunt
  ADD CONSTRAINT fk_emprunt_eleve FOREIGN KEY (mat_eleve) REFERENCES eleve_apprenant(mat_eleve),
  ADD CONSTRAINT fk_emprunt_livre FOREIGN KEY (livre_id) REFERENCES livre(livre_id);

SET FOREIGN_KEY_CHECKS = 1;
