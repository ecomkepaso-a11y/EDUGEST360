ALTER TABLE annee_scolaire
ADD CONSTRAINT fk_annee_etablissement
FOREIGN KEY (eta_id)
REFERENCES etablissement(eta_id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;


ALTER TABLE utilisateur
ADD CONSTRAINT fk_utilisateur_etablissement
FOREIGN KEY (eta_id)
REFERENCES etablissement(eta_id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;


ALTER TABLE creneau_planning
ADD CONSTRAINT fk_planning_classe
FOREIGN KEY (code_classe)
REFERENCES classe(code_classe)
ON UPDATE NO ACTION
ON DELETE NO ACTION;


ALTER TABLE creneau_planning
ADD CONSTRAINT fk_planning_matiere
FOREIGN KEY (matiere_id)
REFERENCES matiere(matiere_id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;


ALTER TABLE creneau_planning
ADD CONSTRAINT fk_planning_enseignant
FOREIGN KEY (enseignant_id)
REFERENCES enseignant_formateur(enseignant_id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;


ALTER TABLE creneau_planning
ADD CONSTRAINT fk_planning_salle
FOREIGN KEY (plan_salle)
REFERENCES salle(plan_salle)
ON UPDATE NO ACTION
ON DELETE NO ACTION;