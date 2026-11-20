
const JOURS_UTC = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export const parseDate = (iso) => {
    const ok = typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso);
    const date = ok ? new Date(`${iso}T00:00:00Z`) : null;
    // rejette "2026-02-31" (JS le « corrigerait » en mars)
    if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) {
        throw new Error(`Date invalide : "${iso}" (format attendu AAAA-MM-JJ)`);
    }
    return date;
};

export const jourDeLaSemaine = (iso) => JOURS_UTC[parseDate(iso).getUTCDay()];

export const nombreDeJours = (debut, fin) => Math.round((parseDate(fin) - parseDate(debut)) / 86400000) + 1;

/**
 * @returns {Object<string,string[]>} ex. { lundi: ["2026-11-09"], mardi: ["2026-11-10"] }
 *          seuls les jours de semaine réellement couverts par la période sont présents.
 */
export const datesParJour = (debut, fin) => {
    const fin_ = parseDate(fin);
    const resultat = {};

    for (let d = parseDate(debut); d <= fin_; d = new Date(d.getTime() + 86400000)) {
        const iso = d.toISOString().slice(0, 10);
        (resultat[JOURS_UTC[d.getUTCDay()]] ??= []).push(iso);
    }
    return resultat;
};

// Intersection de deux périodes [debut, fin] (comparaison de chaînes ISO = comparaison de dates)
export const intersection = (a, b) => {
    const debut = a.debut > b.debut ? a.debut : b.debut;
    const fin = a.fin < b.fin ? a.fin : b.fin;
    return debut <= fin ? { debut, fin } : null;
};