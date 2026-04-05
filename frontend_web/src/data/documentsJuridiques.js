// Templates de documents juridiques — Freample Droit
// Conformes au droit français en vigueur (2026)
// Ces modèles ne constituent pas un conseil juridique personnalisé

export function genererDocument(type, data) {
  const date = new Date().toLocaleDateString('fr-FR');
  const templates = {

    statuts_sci: () => `STATUTS DE SOCIÉTÉ CIVILE IMMOBILIÈRE

${data.denomination || 'SCI [NOM]'}
Capital social : ${data.capital || '____'}€

ARTICLE 1 — FORME
Il est constitué entre les soussignés une Société Civile Immobilière régie par les articles 1832 et suivants du Code civil et les articles 1845 et suivants du même code.

ARTICLE 2 — OBJET
La société a pour objet : ${data.objet || 'l\'acquisition, l\'administration et la gestion par location ou autrement de tous biens et droits immobiliers, ainsi que toutes opérations financières, mobilières ou immobilières se rattachant à l\'objet social.'}

ARTICLE 3 — DÉNOMINATION
La société prend la dénomination de : ${data.denomination || '____'}

ARTICLE 4 — SIÈGE SOCIAL
Le siège social est fixé au : ${data.siege || '____'}
Il peut être transféré en tout autre lieu par décision des associés.

ARTICLE 5 — DURÉE
La durée de la société est fixée à 99 ans à compter de son immatriculation au Registre du Commerce et des Sociétés.

ARTICLE 6 — CAPITAL SOCIAL
Le capital social est fixé à la somme de ${data.capital || '____'} euros (${data.capital || '____'}€), divisé en ${data.capital || '____'} parts sociales de 1 euro chacune, numérotées de 1 à ${data.capital || '____'}, attribuées aux associés en proportion de leurs apports.

ARTICLE 7 — APPORTS
Les associés font apport à la société des sommes suivantes :
${data.associes || '- Associé 1 : ____ parts\n- Associé 2 : ____ parts'}

ARTICLE 8 — PARTS SOCIALES
Les parts sociales ne peuvent être cédées à des tiers étrangers à la société qu'avec le consentement unanime des associés.
Toute cession entre associés est libre.

ARTICLE 9 — GÉRANCE
La société est gérée par ${data.gerant || '____'}, nommé(e) gérant(e) pour une durée indéterminée.
Le gérant a les pouvoirs les plus étendus pour agir au nom de la société dans la limite de l'objet social.

ARTICLE 10 — DÉCISIONS COLLECTIVES
Les décisions collectives sont prises en assemblée générale.
Les décisions ordinaires sont prises à la majorité des parts sociales.
Les décisions extraordinaires (modification des statuts) sont prises à l'unanimité.

ARTICLE 11 — EXERCICE SOCIAL
L'exercice social commence le 1er janvier et se termine le 31 décembre de chaque année.

ARTICLE 12 — RÉPARTITION DES BÉNÉFICES
Les bénéfices nets sont répartis entre les associés proportionnellement au nombre de parts sociales détenues par chacun.

ARTICLE 13 — DISSOLUTION
La société est dissoute par l'arrivée du terme, la réalisation ou l'extinction de son objet, la décision unanime des associés, ou la décision judiciaire.

ARTICLE 14 — RÉGIME FISCAL
La société est soumise à l'impôt sur le revenu (transparence fiscale) conformément à l'article 8 du Code général des impôts.

Fait à __________, le ${date}
En autant d'originaux que de parties.

Les associés (signatures) :`,

    statuts_sas: () => `STATUTS DE SOCIÉTÉ PAR ACTIONS SIMPLIFIÉE

${data.denomination || 'SAS [NOM]'}
Capital social : ${data.capital || '____'}€

ARTICLE 1 — FORME
Il est constitué entre les soussignés une Société par Actions Simplifiée régie par les articles L.227-1 et suivants du Code de commerce.

ARTICLE 2 — OBJET
La société a pour objet : ${data.objet || '____'}
Et plus généralement, toutes opérations industrielles, commerciales, financières, mobilières ou immobilières se rattachant directement ou indirectement à l'objet social.

ARTICLE 3 — DÉNOMINATION
La société prend la dénomination sociale de : ${data.denomination || '____'}

ARTICLE 4 — SIÈGE SOCIAL
Le siège social est fixé au : ${data.siege || '____'}

ARTICLE 5 — DURÉE
La durée de la société est fixée à 99 ans.

ARTICLE 6 — CAPITAL SOCIAL
Le capital social est fixé à ${data.capital || '____'}€, divisé en ${data.capital || '____'} actions de 1€ de valeur nominale.

ARTICLE 7 — PRÉSIDENT
La société est dirigée par un Président : ${data.gerant || '____'}
Le Président représente la société à l'égard des tiers.

ARTICLE 8 — DÉCISIONS DES ASSOCIÉS
Les décisions collectives sont prises en assemblée ou par consultation écrite.
AGO : majorité simple. AGE : majorité des 2/3.

ARTICLE 9 — CESSION D'ACTIONS
Toute cession d'actions à un tiers est soumise à l'agrément préalable des associés statuant à la majorité.

ARTICLE 10 — EXERCICE SOCIAL
Du 1er janvier au 31 décembre.

Fait à __________, le ${date}`,

    bail_habitation: () => `CONTRAT DE LOCATION
Loi n°89-462 du 6 juillet 1989 modifiée par les lois ALUR (2014) et ELAN (2018)

ENTRE LES SOUSSIGNÉS :

Le bailleur : ${data.bailleur || '____'}
Ci-après dénommé « le bailleur »

ET

Le locataire : ${data.locataire || '____'}
Ci-après dénommé « le locataire »

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 — OBJET
Le bailleur donne en location au locataire le logement ci-après désigné :
Adresse : ${data.adresse || '____'}
Type : Habitation
Surface habitable : ${data.surface || '____'} m²
Nombre de pièces : ${data.pieces || '____'}

ARTICLE 2 — DURÉE
Le présent bail est consenti pour une durée de ${data.meuble ? '1 an (meublé)' : '3 ans (vide)'}.
Il prendra effet le ${data.debut || '____'}.

ARTICLE 3 — LOYER
Le loyer mensuel est fixé à ${data.loyer || '____'} euros hors charges.
Les charges locatives sont fixées à ${data.charges || '____'} euros par mois à titre de provision.
Le loyer est payable mensuellement, d'avance, le 1er de chaque mois.

ARTICLE 4 — RÉVISION DU LOYER
Le loyer sera révisé chaque année à la date anniversaire du bail en fonction de la variation de l'Indice de Référence des Loyers (IRL) publié par l'INSEE.

ARTICLE 5 — DÉPÔT DE GARANTIE
Le locataire verse au bailleur un dépôt de garantie de ${data.depot || '____'} euros, soit ${data.meuble ? '2' : '1'} mois de loyer hors charges.
Ce dépôt sera restitué dans un délai de 1 mois (si EDL conforme) ou 2 mois.

ARTICLE 6 — CHARGES LOCATIVES
Les charges locatives comprennent les charges récupérables définies par le décret n°87-713 du 26 août 1987.
Une régularisation annuelle sera effectuée.

ARTICLE 7 — CLAUSE RÉSOLUTOIRE
Conformément à l'article 24 de la loi du 6 juillet 1989, à défaut de paiement du loyer ou des charges aux termes convenus, et deux mois après un commandement de payer demeuré infructueux, le bail sera résilié de plein droit.

ARTICLE 8 — DIAGNOSTICS
Les diagnostics suivants sont annexés au présent bail :
- Diagnostic de Performance Énergétique (DPE)
- Constat de Risque d'Exposition au Plomb (CREP)
- État des Risques et Pollutions (ERP)
- Diagnostic électricité et gaz (si installation > 15 ans)

ARTICLE 9 — ÉTAT DES LIEUX
Un état des lieux sera établi contradictoirement à l'entrée et à la sortie du logement, conformément à la loi ALUR.

Fait en deux exemplaires à __________, le ${date}

Le bailleur                    Le locataire
(Lu et approuvé)               (Lu et approuvé)`,

    bail_commercial: () => `BAIL COMMERCIAL
Articles L.145-1 et suivants du Code de commerce

ENTRE :
Le bailleur : ${data.partie1 || '____'}
ET
Le preneur : ${data.partie2 || '____'}

DÉSIGNATION DES LOCAUX
Adresse : ${data.adresse || '____'}
Destination : ${data.details || 'Tous commerces'}

DURÉE : 9 ans à compter du ${date}
Le preneur aura la faculté de donner congé à l'expiration de chaque période triennale.

LOYER : ${data.loyer || '____'}€ HT/mois
Payable trimestriellement d'avance.
Révision triennale selon l'indice ILC ou ILAT.

CHARGES : ${data.charges || '____'}€/mois (provision)
Régularisation annuelle.

DÉPÔT DE GARANTIE : ${data.depot || '____'}€

Le preneur s'engage à exploiter le fonds de commerce conformément à la destination prévue au bail.

Fait à __________, le ${date}`,

    contrat_travail: () => `CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

ENTRE :
L'employeur : ${data.partie1 || '____'}
ET
Le salarié : ${data.partie2 || '____'}

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 — ENGAGEMENT
L'employeur engage le salarié en qualité de ${data.details || '____'}.
Date d'effet : ${date}

ARTICLE 2 — PÉRIODE D'ESSAI
Le présent contrat est soumis à une période d'essai de ${data.essai || '2 mois'}, renouvelable une fois.

ARTICLE 3 — DURÉE DU TRAVAIL
Le salarié est employé à temps plein, soit 35 heures hebdomadaires.

ARTICLE 4 — RÉMUNÉRATION
Le salarié percevra une rémunération brute mensuelle de ${data.salaire || '____'}€.

ARTICLE 5 — LIEU DE TRAVAIL
Le lieu de travail est fixé à ${data.lieu || '____'}.

ARTICLE 6 — CONVENTION COLLECTIVE
Le présent contrat est régi par la convention collective ${data.convention || '____'}.

ARTICLE 7 — CONGÉS PAYÉS
Le salarié bénéficie de 2,5 jours ouvrables de congés payés par mois travaillé.

ARTICLE 8 — CLAUSE DE NON-CONCURRENCE
${data.nonConcurrence ? 'Le salarié s\'engage à ne pas exercer d\'activité concurrente pendant une durée de 12 mois après la fin du contrat, dans un rayon de 50 km. Une contrepartie financière de 30% du salaire sera versée mensuellement.' : 'Aucune clause de non-concurrence n\'est prévue.'}

Fait en deux exemplaires à __________, le ${date}

L'employeur                    Le salarié
(Signature)                    (Signature, précédée de "Lu et approuvé")`,

    cgv: () => `CONDITIONS GÉNÉRALES DE VENTE
${data.partie1 || '[NOM DE L\'ENTREPRISE]'}

ARTICLE 1 — OBJET
Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre ${data.partie1 || '____'} et ses clients.

ARTICLE 2 — PRIX
Les prix sont indiqués en euros TTC. Ils sont susceptibles de modification à tout moment.

ARTICLE 3 — COMMANDES
Toute commande implique l'acceptation des présentes CGV.

ARTICLE 4 — PAIEMENT
Le paiement est exigible à la commande. Les moyens de paiement acceptés sont : virement bancaire, carte bancaire.

ARTICLE 5 — LIVRAISON
Les délais de livraison sont donnés à titre indicatif. Un retard de livraison ne peut donner lieu à aucune pénalité.

ARTICLE 6 — DROIT DE RÉTRACTATION
Conformément à l'article L.221-18 du Code de la consommation, le consommateur dispose de 14 jours pour exercer son droit de rétractation.

ARTICLE 7 — GARANTIES
Les produits/services sont garantis conformes aux dispositions des articles L.217-4 et suivants du Code de la consommation.

ARTICLE 8 — DONNÉES PERSONNELLES
Conformément au RGPD, le client dispose d'un droit d'accès, de modification et de suppression de ses données personnelles.

ARTICLE 9 — LITIGES
En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux de ${data.tribunal || '____'} seront compétents.

Date : ${date}`,

    mise_demeure: () => `LETTRE DE MISE EN DEMEURE

Expéditeur : ${data.partie1 || '____'}
Destinataire : ${data.partie2 || '____'}

Objet : Mise en demeure de payer

Lettre recommandée avec accusé de réception

Madame, Monsieur,

${data.details || 'Je constate à ce jour que la somme de ____€ reste impayée malgré mes précédentes relances.'}

Par la présente, je vous mets en demeure de procéder au règlement de cette somme dans un délai de HUIT (8) jours à compter de la réception de la présente lettre.

À défaut de règlement dans ce délai, je me verrai contraint(e) d'engager toutes les procédures légales nécessaires au recouvrement de cette créance, sans nouvelle mise en demeure.

Les frais de procédure seront à votre charge.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Fait à __________, le ${date}

Signature : ____________________`,

    pv_ag: () => `PROCÈS-VERBAL D'ASSEMBLÉE GÉNÉRALE
${data.denomination || '[DÉNOMINATION SOCIALE]'}

L'an ${new Date().getFullYear()}, le ${date}
Les associés de la société ${data.denomination || '____'} se sont réunis en Assemblée Générale ${data.type_ag || 'Ordinaire'} au siège social.

ORDRE DU JOUR :
${data.details || '1. Approbation des comptes de l\'exercice\n2. Affectation du résultat\n3. Questions diverses'}

RÉSOLUTIONS :

Première résolution — Approbation des comptes
L'assemblée approuve les comptes de l'exercice clos le 31/12/${new Date().getFullYear()-1}.
Cette résolution est adoptée à l'unanimité.

Deuxième résolution — Affectation du résultat
L'assemblée décide d'affecter le résultat de l'exercice conformément aux statuts.
Cette résolution est adoptée à l'unanimité.

L'ordre du jour étant épuisé, la séance est levée.

Le gérant : ${data.gerant || '____'}
(Signature)`,

    rupture_conv: () => `CONVENTION DE RUPTURE CONVENTIONNELLE
Articles L.1237-11 et suivants du Code du travail

ENTRE :
L'employeur : ${data.partie1 || '____'}
ET
Le salarié : ${data.partie2 || '____'}

Les parties conviennent de mettre fin au contrat de travail d'un commun accord.

Date d'effet : au plus tôt le lendemain de l'homologation par la DIRECCTE.

INDEMNITÉ DE RUPTURE : ${data.indemnite || '____'}€
(Ne peut être inférieure à l'indemnité légale de licenciement)

Le salarié dispose d'un délai de rétractation de 15 jours calendaires.
La demande d'homologation sera adressée à la DIRECCTE à l'issue de ce délai.

Fait à __________, le ${date}`,

    donation: () => `ACTE DE DONATION
${data.details || 'Donation de parts sociales'}

ENTRE :
Le donateur : ${data.partie1 || '____'}
ET
Le donataire : ${data.partie2 || '____'}

Le donateur déclare donner au donataire, qui accepte :
${data.details || '____'}

ÉVALUATION : ${data.valeur || '____'}€

Le donataire déclare accepter cette donation.
Les droits de mutation seront acquittés conformément à la législation en vigueur.

Fait à __________, le ${date}`,

    cession_parts: () => `ACTE DE CESSION DE PARTS SOCIALES

ENTRE :
Le cédant : ${data.partie1 || '____'}
ET
Le cessionnaire : ${data.partie2 || '____'}

Le cédant cède au cessionnaire ${data.nombre_parts || '____'} parts sociales de la société ${data.denomination || '____'} au prix de ${data.prix_cession || '____'}€.

AGRÉMENT : L'agrément des associés a été obtenu par décision collective du ______.

Le cessionnaire sera propriétaire des parts cédées à compter de ce jour et jouira de tous les droits y attachés.

Fait à __________, le ${date}`,

    nda: () => `ACCORD DE CONFIDENTIALITÉ (NDA)

ENTRE :
Partie divulgatrice : ${data.partie1 || '____'}
ET
Partie réceptrice : ${data.partie2 || '____'}

ARTICLE 1 — OBJET
Le présent accord a pour objet de définir les conditions dans lesquelles les parties s'engagent à protéger les informations confidentielles échangées dans le cadre de ${data.details || 'leurs discussions commerciales'}.

ARTICLE 2 — INFORMATIONS CONFIDENTIELLES
Sont considérées comme confidentielles toutes informations transmises par la partie divulgatrice, quel que soit leur support.

ARTICLE 3 — OBLIGATIONS
La partie réceptrice s'engage à :
- ne pas divulguer les informations confidentielles à des tiers
- ne les utiliser que dans le cadre de l'objet défini
- les protéger avec le même degré de précaution que ses propres informations

ARTICLE 4 — DURÉE
Le présent accord est conclu pour une durée de ${data.duree || '2 ans'} à compter de sa signature.

ARTICLE 5 — SANCTIONS
Toute violation du présent accord pourra donner lieu à des dommages et intérêts.

Fait en deux exemplaires à __________, le ${date}

Partie 1                       Partie 2
(Signature)                    (Signature)`,
  };

  return templates[type] ? templates[type]() : 'Document non disponible.';
}
