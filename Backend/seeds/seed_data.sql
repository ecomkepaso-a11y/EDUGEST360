USE edugest360;

INSERT INTO etablissement
(eta_id, eta_code, eta_nom, eta_type, eta_adresse, eta_ville, eta_pays, eta_tel, eta_email, eta_statut)
VALUES
(1, 'EDU001', 'EDUGEST 360', 'secondaire', 'Logbessou', 'Douala', 'Cameroun',
 '+237690000001', 'contact@edugest360.cm', 'actif');


INSERT INTO annee_scolaire
(code_anne_scolaire, date_debut_annee, date_fin_annee, eta_id)
VALUES
('2025-2026', '2025-09-01', '2026-07-31', 1);


INSERT INTO filiere
(code_filiere, libelle_filiere)
VALUES
('GEN', 'Enseignement Général'),
('INFO', 'Informatique');


INSERT INTO niveau
(code_niveau, libelle_niveau)
VALUES
('3EME', 'Troisième'),
('2NDE', 'Seconde'),
('1ERE', 'Première');


INSERT INTO classe
(code_classe, libelle_classe, effectif_classe, statut_classe,
 eta_id, code_anne_scolaire, code_niveau, code_filiere)
VALUES
('3A', 'Troisième A', 30, 'active', 1, '2025-2026', '3EME', 'GEN'),
('2INFO', 'Seconde Informatique', 25, 'active', 1, '2025-2026', '2NDE', 'INFO'),
('1INFO', 'Première Informatique', 20, 'active', 1, '2025-2026', '1ERE', 'INFO');


INSERT INTO salle
(plan_salle)
VALUES
('S101'),
('S102'),
('LAB01');


INSERT INTO matiere
(matiere_id, matiere_code, matiere_libelle, matiere_description)
VALUES
(1, 'MATH', 'Mathématiques', 'Cours de mathématiques'),
(2, 'INFO', 'Informatique', 'Cours d informatique'),
(3, 'FR', 'Français', 'Cours de français'),
(4, 'ANG', 'Anglais', 'Cours d anglais');


INSERT INTO enseignant_formateur
(enseignant_id, enseignant_specialite, enseignant_statut)
VALUES
(1, 'Mathématiques', 'actif'),
(2, 'Informatique', 'actif'),
(3, 'Français', 'actif');


INSERT INTO eleve_apprenant
(mat_eleve, nom_eleve, prenom_eleve, sexe_eleve, date_naiss, lieu_naiss, nationalite)
VALUES
('ELV000001', 'FOUDA', 'Kevin', 'M', '2010-04-15', 'Douala', 'Cameroun'),
('ELV000002', 'NGUEMA', 'Sarah', 'F', '2010-09-21', 'Douala', 'Cameroun'),
('ELV000003', 'ESSONO', 'David', 'M', '2011-02-11', 'Bafoussam', 'Cameroun'),
('ELV000004', 'MANGA', 'Grace', 'F', '2010-07-18', 'Douala', 'Cameroun');


INSERT INTO utilisateur
(usr_id, usr_nom, usr_prenom, usr_email, usr_tel, usr_login,
 usr_role, usr_statut, usr_date_creation, usr_mdp_hash, eta_id)
VALUES
(1, 'KAMGA', 'Paul', 'paul@edugest360.cm', '+237690000010',
 'pkamga', 'direction', 'actif', '2025-09-01', 'HASH_TEST_001', 1),

(2, 'MBOG', 'Jean', 'jean@edugest360.cm', '+237690000011',
 'jmbog', 'admin', 'actif', '2025-09-01', 'HASH_TEST_002', 1),

(3, 'NGONO', 'Marc', 'marc@edugest360.cm', '+237690000012',
 'mngono', 'enseignant', 'actif', '2025-09-01', 'HASH_TEST_003', 1),

(4, 'ESSAMA', 'Claire', 'claire@edugest360.cm', '+237690000013',
 'cessama', 'enseignant', 'actif', '2025-09-01', 'HASH_TEST_004', 1),

(5, 'FOUDA', 'Alain', 'alain@edugest360.cm', '+237690000014',
 'afouda', 'parent', 'actif', '2025-09-01', 'HASH_TEST_005', 1),

(6, 'FOUDA', 'Kevin', 'kevin@edugest360.cm', '+237690000015',
 'k fouda', 'élève', 'actif', '2025-09-01', 'HASH_TEST_006', 1);


INSERT INTO inscription
(ins_id, date_inscription, statut_inscription, mat_eleve,
 code_anne_scolaire, code_classe)
VALUES
(1, '2025-09-05', 'active', 'ELV000001', '2025-2026', '3A'),
(2, '2025-09-05', 'active', 'ELV000002', '2025-2026', '3A'),
(3, '2025-09-06', 'active', 'ELV000003', '2025-2026', '2INFO'),
(4, '2025-09-06', 'active', 'ELV000004', '2025-2026', '2INFO');


INSERT INTO matiere_enseignant
(matiere_id, enseignant_id)
VALUES
(1, 1),
(2, 2),
(3, 3);


INSERT INTO enseignant_eleve
(enseignant_id, mat_eleve)
VALUES
(1, 'ELV000001'),
(1, 'ELV000002'),
(2, 'ELV000003'),
(2, 'ELV000004');


INSERT INTO utilisateur_enseignant
(enseignant_id, usr_id)
VALUES
(1, 3),
(2, 4);


INSERT INTO utilisateur_eleve
(usr_id, mat_eleve)
VALUES
(6, 'ELV000001');


INSERT INTO parent_tuteur
(parent_id, parent_lien, parent_adresse, parent_statut)
VALUES
(1, 'père', 'Logbessou, Douala', 'actif');


INSERT INTO eleve_parent
(mat_eleve, parent_id)
VALUES
('ELV000001', 1),
('ELV000002', 1);


INSERT INTO creneau_planning
(plan_id, plan_jour, plan_heure_debut, plan_heure_fin,
 plan_statut, code_classe, matiere_id, enseignant_id, plan_salle)
VALUES
(1, 'lundi', '08:00:00', '10:00:00', 'prévu', '3A', 1, 1, 'S101'),
(2, 'mardi', '10:00:00', '12:00:00', 'prévu', '3A', 3, 3, 'S102'),
(3, 'mercredi', '08:00:00', '10:00:00', 'prévu', '2INFO', 2, 2, 'LAB01');


INSERT INTO evaluation
(eval_id, eval_libelle, eval_type, eval_note_max,
 eval_coefficient, eval_periode, code_classe, matiere_id)
VALUES
(1, 'Devoir de Mathématiques', 'devoir', 20, 2, 'trimestre_1', '3A', 1),
(2, 'Contrôle de Mathématiques', 'contrôle', 20, 2, 'trimestre_1', '3A', 1),
(3, 'Contrôle Informatique', 'contrôle', 20, 2, 'trimestre_1', '2INFO', 2);


INSERT INTO note
(note_id, note_valeur, note_observation, eval_id, mat_eleve)
VALUES
(1, 15.00, 'Bon travail', 1, 'ELV000001'),
(2, 12.00, 'Peut mieux faire', 1, 'ELV000002'),
(3, 17.00, 'Très bon résultat', 2, 'ELV000001'),
(4, 14.00, 'Bon résultat', 2, 'ELV000002'),
(5, 16.00, 'Très bon travail', 3, 'ELV000003'),
(6, 13.00, 'Résultat satisfaisant', 3, 'ELV000004');


INSERT INTO bulletin
(bulletin_id, bulletin_periode, bulletin_moyenne_generale,
 bulletin_date_publication, bulletin_statut, bulletin_version, mat_eleve)
VALUES
(1, '2026-01-31', 16.00, '2026-02-05', 'publié', 'v1', 'ELV000001'),
(2, '2026-01-31', 13.00, '2026-02-05', 'publié', 'v1', 'ELV000002'),
(3, '2026-01-31', 16.00, '2026-02-05', 'publié', 'v1', 'ELV000003'),
(4, '2026-01-31', 13.00, '2026-02-05', 'publié', 'v1', 'ELV000004');


INSERT INTO facture_echeance
(fact_id, fact_montant_frais, fact_date_echeance,
 fact_statut, mat_eleve, ins_id)
VALUES
(1, 150000.00, '2025-10-15', 'partiel', 'ELV000001', 1),
(2, 150000.00, '2025-10-15', 'payé', 'ELV000002', 2),
(3, 175000.00, '2025-10-20', 'impayé', 'ELV000003', 3),
(4, 175000.00, '2025-10-20', 'partiel', 'ELV000004', 4);


INSERT INTO paiement
(pay_id, pay_montant_paye, pay_date_paiement,
 pay_mode_paiement, fact_id)
VALUES
(1, 75000.00, '2025-09-20', 'mobile_money', 1),
(2, 150000.00, '2025-09-18', 'virement', 2),
(3, 100000.00, '2025-09-25', 'espèces', 4);


INSERT INTO personnel
(rh_id, rh_matricule, rh_fonction, rh_date_embauche, rh_salaire_base)
VALUES
('RH001', 'PER001', 'Enseignant', '2024-09-01', 250000.00),
('RH002', 'PER002', 'Administrateur', '2023-01-10', 300000.00);


INSERT INTO utilisateur_personnel
(usr_id, rh_id)
VALUES
(3, 'RH001'),
(2, 'RH002');


INSERT INTO salaire
(salaire_id, salaire_montant_base, salaire_mois, salaire_annee,
 salaire_elements_variables, salaire_montant_net, salaire_statut, rh_id)
VALUES
(1, 250000.00, 9, 2025, 'Prime de rendement', 275000.00, 'paye', 'RH001'),
(2, 300000.00, 9, 2025, 'Prime de responsabilité', 330000.00, 'paye', 'RH002');


INSERT INTO avance_salaire
(avance_id, avance_montant, avance_date_demande,
 avance_motif, avance_statut, avance_date_validation, rh_id)
VALUES
(1, 50000.00, '2025-10-05',
 'Dépense familiale', 'en_attente', NULL, 'RH001'),
(2, 75000.00, '2025-10-03',
 'Besoin personnel', 'approuvée', '2025-10-04', 'RH002');


INSERT INTO conge
(conge_id, conge_date_debut, conge_date_fin,
 conge_motif, rh_statut_conge, rh_id, usr_id)
VALUES
('CONGE001', '2026-02-02', '2026-02-07',
 'Congé annuel', 'en_attente', 'RH001', 3);


INSERT INTO stage
(stg_id, stg_structure, stg_date_debut, stg_date_fin,
 stg_statut, stg_tuteur, mat_eleve)
VALUES
(1, 'Tech Solutions', '2026-04-01', '2026-05-30',
 'en_cours', 'Jean Martin', 'ELV000003');


INSERT INTO formation
(formation_id, formation_libelle, formation_date_debut,
 formation_date_fin, formation_description, formation_statut)
VALUES
(1, 'Formation Python', '2026-03-02', '2026-03-06',
 'Initiation à la programmation Python', 'planifiée');


INSERT INTO formation_eleve
(mat_eleve, formation_id)
VALUES
('ELV000003', 1),
('ELV000004', 1);


INSERT INTO enseignant_formation
(enseignant_id, formation_id)
VALUES
(2, 1);


INSERT INTO absence
(abs_id, abs_date, abs_heure_debut, abs_heure_fin,
 abs_motif, abs_justifiee, abs_statut, mat_eleve)
VALUES
(1, '2026-01-12', '08:00:00', '10:00:00',
 'Maladie', TRUE, 'justifiée', 'ELV000001'),
(2, '2026-01-15', '10:00:00', '12:00:00',
 'Absence sans justificatif', FALSE, 'injustifiée', 'ELV000002');


INSERT INTO utilisateur_absence
(usr_id, abs_id)
VALUES
(3, 1),
(3, 2);


INSERT INTO incident_disciplinaire
(dis_id, dis_type, dis_description, dis_date,
 dis_sanction, dis_statut, mat_eleve, usr_id)
VALUES
(1, 'retard', 'Retard répété en début de cours',
 '2026-01-20', 'Avertissement', 'traité', 'ELV000002', 3);


INSERT INTO bibliotheque
(bibliotheque_id, bibliotheque_nom,
 bibliotheque_localisation, bibliotheque_statut, eta_id)
VALUES
(1, 'Bibliothèque EDUGEST', 'Bloc A', 'active', 1);


INSERT INTO livre
(livre_id, livre_isbn, livre_titre, livre_auteur,
 livre_categorie, livre_annee_publication,
 livre_quantite, livre_quantite_disponible,
 livre_statut, bibliotheque_id)
VALUES
(1, '978000000001', 'Algorithmique et Programmation',
 'Jean Dupont', 'Informatique', '2023-01-01',
 5, 4, 'disponible', 1),

(2, '978000000002', 'Mathématiques Niveau 3',
 'Paul Martin', 'Mathématiques', '2022-01-01',
 8, 8, 'disponible', 1),

(3, '978000000003', 'Français Moderne',
 'Claire Bernard', 'Français', '2021-01-01',
 4, 3, 'disponible', 1);


INSERT INTO emprunt
(emprunt_id, emprunt_date, emprunt_date_retour,
 emprunt_statut, emprunt_date_retour_prevu,
 mat_eleve, livre_id)
VALUES
(1, '2026-01-10 10:00:00', NULL,
 'en_cours', '2026-01-24', 'ELV000001', 1),

(2, '2026-01-05 09:00:00', '2026-01-15',
 'retourne', '2026-01-19', 'ELV000002', 3);


INSERT INTO activite_parascolaire
(act_id, act_nom, act_description, act_type,
 act_date_debut, act_date_fin, act_statut, eta_id)
VALUES
(1, 'Club Informatique',
 'Initiation à la programmation',
 'informatique', '2025-10-01', '2026-06-30', 'active', 1),

(2, 'Club Football',
 'Activités sportives scolaires',
 'sport', '2025-10-01', '2026-06-30', 'active', 1);


INSERT INTO participation_activite
(participation_id, participation_date_inscription,
 participation_statut, participation_observation,
 mat_eleve, act_id)
VALUES
(1, '2025-10-05', 'actif', 'Participation régulière',
 'ELV000001', 1),

(2, '2025-10-05', 'actif', 'Participation régulière',
 'ELV000002', 2);


INSERT INTO piece_requise
(piece_id, piece_nom, piece_description,
 piece_quantite, piece_obligatoire, piece_statut)
VALUES
(1, 'Photocopie acte de naissance',
 'Copie de l acte de naissance de l élève',
 1, 'oui', 'active'),

(2, 'Photo d identité',
 'Photo récente de l élève',
 2, 'oui', 'active'),

(3, 'Carnet scolaire',
 'Carnet scolaire de l établissement',
 1, 'oui', 'active');


INSERT INTO inscription_piece
(ins_id, piece_id)
VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(3, 1),
(3, 2),
(4, 1);


INSERT INTO alerte_notification
(com_id, com_canal, com_statut, com_contenu,
 com_date_envoi, com_date_lecture, usr_id)
VALUES
(1, 'notification', 'lue',
 'Votre bulletin du premier trimestre est disponible.',
 '2026-02-05', '2026-02-06', 5),

(2, 'sms', 'envoyée',
 'Une échéance de paiement est partiellement réglée.',
 '2025-10-15', NULL, 5);


INSERT INTO alerte_eleve
(mat_eleve, com_id)
VALUES
('ELV000001', 1),
('ELV000001', 2);