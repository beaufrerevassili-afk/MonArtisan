import React, { useState } from 'react';

const NAV = [
  { id: 'cgu', label: 'CGU' },
  { id: 'cgv', label: 'CGV' },
  { id: 'rgpd', label: 'Données personnelles' },
  { id: 'mentions', label: 'Mentions légales' },
];

export default function CGU() {
  const [activeNav, setActiveNav] = useState('cgu');

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px', fontFamily: "'Inter', -apple-system, sans-serif", color: '#1A1A1A', lineHeight: 1.7 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <a href="/" style={{ fontSize: 22, fontWeight: 900, color: '#A68B4B', textDecoration: 'none', letterSpacing: '-0.03em' }}>Freample</a>
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 6 }}>Conditions Générales</h1>
      <p style={{ color: '#6E6E73', marginBottom: 24, fontSize: 14 }}>Dernière mise à jour : 17 avril 2026</p>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid #E8E6E1', paddingBottom: 0 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setActiveNav(n.id); document.getElementById(n.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
            style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: activeNav === n.id ? '2px solid #A68B4B' : '2px solid transparent', color: activeNav === n.id ? '#A68B4B' : '#6E6E73', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {n.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* CONDITIONS GÉNÉRALES D'UTILISATION          */}
      {/* ════════════════════════════════════════════ */}
      <div id="cgu">
        <h2 style={H2}>Conditions Générales d'Utilisation (CGU)</h2>

        <S title="Article 1 — Définitions">
          <p>Dans les présentes CGU, les termes suivants ont la signification qui leur est attribuée ci-dessous :</p>
          <ul>
            <li><strong>Freample</strong> ou <strong>la Plateforme</strong> : la plateforme numérique accessible à l'adresse freample.com, éditée par Freample SAS.</li>
            <li><strong>Utilisateur</strong> : toute personne physique ou morale inscrite sur la Plateforme, quel que soit son rôle.</li>
            <li><strong>Client</strong> : Utilisateur (particulier ou entreprise) qui publie un projet de travaux et recherche un Professionnel.</li>
            <li><strong>Professionnel</strong> : Utilisateur exerçant une activité BTP (patron d'entreprise, auto-entrepreneur, artisan) inscrit pour répondre à des projets ou gérer son activité via la Plateforme.</li>
            <li><strong>Projet</strong> : demande de travaux publiée par un Client sur le Marketplace.</li>
            <li><strong>Devis</strong> : proposition commerciale chiffrée émise par un Professionnel à destination d'un Client via la Plateforme.</li>
            <li><strong>Séquestre</strong> : mécanisme de sécurisation des paiements par lequel les fonds versés par le Client sont conservés par le prestataire de paiement agréé (Mangopay/Stripe), puis libérés au Professionnel par jalons selon l'avancement des travaux.</li>
            <li><strong>Commission</strong> : rémunération de Freample, fixée à 1% du montant HT des travaux, prélevée sur le paiement du Client.</li>
          </ul>
        </S>

        <S title="Article 2 — Objet">
          <p>La Plateforme a pour objet de :</p>
          <ul>
            <li>Mettre en relation des Clients et des Professionnels du BTP ;</li>
            <li>Fournir aux Professionnels des outils de gestion d'entreprise (devis, factures, chantiers, comptabilité, RH, QSE, stock) ;</li>
            <li>Sécuriser les paiements entre Clients et Professionnels via un système de séquestre ;</li>
            <li>Permettre le suivi en temps réel des chantiers par les Clients.</li>
          </ul>
          <p><strong>Freample agit en qualité d'intermédiaire technique et n'est en aucun cas partie au contrat de prestation conclu entre le Client et le Professionnel.</strong> Le contrat de travaux est formé directement entre eux lors de la signature du Devis.</p>
        </S>

        <S title="Article 3 — Inscription et comptes">
          <p><strong>3.1.</strong> L'inscription est ouverte à toute personne physique majeure (18 ans minimum) ou personne morale ayant la capacité juridique de contracter.</p>
          <p><strong>3.2.</strong> L'inscription est gratuite pour les Clients et les Professionnels. Aucun abonnement n'est requis.</p>
          <p><strong>3.3.</strong> L'Utilisateur s'engage à fournir des informations exactes, complètes et à jour. En particulier, les Professionnels doivent renseigner : raison sociale, SIRET, assurance décennale (si applicable), RC Pro.</p>
          <p><strong>3.4.</strong> Chaque Utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute activité réalisée depuis son compte est présumée faite par lui.</p>
          <p><strong>3.5.</strong> Freample se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, de fraude ou de comportement préjudiciable.</p>
        </S>

        <S title="Article 4 — Vérification des Professionnels">
          <p><strong>4.1.</strong> Freample vérifie les informations fournies par les Professionnels lors de leur inscription : numéro SIRET (via l'API SIRENE), assurance décennale, RC Pro.</p>
          <p><strong>4.2.</strong> Cette vérification ne constitue en aucun cas une garantie de la qualité des travaux ou de la solvabilité du Professionnel. Freample décline toute responsabilité quant aux prestations réalisées.</p>
          <p><strong>4.3.</strong> Les Professionnels sont tenus de mettre à jour leurs documents (décennale, RC Pro) et de signaler tout changement de situation dans un délai de 30 jours.</p>
        </S>

        <S title="Article 5 — Publication de projets">
          <p><strong>5.1.</strong> Les Clients peuvent publier des projets de travaux en décrivant leurs besoins (métier, description, ville, budget indicatif, urgence).</p>
          <p><strong>5.2.</strong> Les projets publiés sont visibles par les Professionnels dont les corps de métier correspondent et qui interviennent dans la zone géographique concernée.</p>
          <p><strong>5.3.</strong> Le Client reste libre d'accepter ou de refuser les offres reçues. Freample ne garantit pas un nombre minimum d'offres.</p>
          <p><strong>5.4.</strong> Tout contenu publié doit respecter la législation en vigueur. Les contenus illicites, diffamatoires, trompeurs ou portant atteinte aux droits de tiers sont interdits et seront supprimés.</p>
        </S>

        <S title="Article 6 — Devis et formation du contrat">
          <p><strong>6.1.</strong> Le Professionnel émet un Devis conforme aux obligations légales françaises : mentions obligatoires (SIRET, assurances, TVA), description détaillée des prestations, prix unitaires, taux de TVA applicable, conditions de paiement, délai de validité.</p>
          <p><strong>6.2.</strong> Le Client reçoit le Devis par voie électronique (lien sécurisé) et peut l'accepter, demander une modification ou le refuser.</p>
          <p><strong>6.3.</strong> L'acceptation du Devis par le Client vaut formation du contrat de prestation entre le Client et le Professionnel. Freample n'est pas partie à ce contrat.</p>
          <p><strong>6.4.</strong> Le Devis signé électroniquement via la Plateforme a la même valeur juridique qu'un devis signé manuscritement (art. 1366 et 1367 du Code civil).</p>
          <p><strong>6.5.</strong> En cas de démarchage à domicile, le Client dispose d'un droit de rétractation de 14 jours (art. L221-18 du Code de la consommation).</p>
        </S>

        <S title="Article 7 — Obligations des Utilisateurs">
          <p><strong>Le Client s'engage à :</strong></p>
          <ul>
            <li>Fournir une description fidèle de son projet ;</li>
            <li>Répondre aux offres dans un délai raisonnable ;</li>
            <li>Respecter les engagements pris après signature du Devis ;</li>
            <li>Procéder aux paiements via la Plateforme pour les projets marketplace.</li>
          </ul>
          <p><strong>Le Professionnel s'engage à :</strong></p>
          <ul>
            <li>Émettre des Devis conformes et honnêtes ;</li>
            <li>Disposer de toutes les assurances obligatoires (décennale, RC Pro) en cours de validité ;</li>
            <li>Exécuter les travaux conformément au Devis signé ;</li>
            <li>Respecter les délais convenus ;</li>
            <li>Tenir informé le Client de l'avancement des travaux via la Plateforme.</li>
          </ul>
        </S>

        <S title="Article 8 — Avis et notation">
          <p><strong>8.1.</strong> À l'issue d'un chantier, le Client peut laisser un avis et une note sur le Professionnel (qualité, ponctualité, propreté, communication, rapport qualité-prix).</p>
          <p><strong>8.2.</strong> Les avis sont publiés sur le profil du Professionnel et contribuent à son score de réputation.</p>
          <p><strong>8.3.</strong> Les avis doivent être honnêtes, factuels et non diffamatoires. Freample se réserve le droit de supprimer tout avis contraire aux présentes CGU.</p>
          <p><strong>8.4.</strong> Le Professionnel peut répondre publiquement à un avis.</p>
        </S>

        <S title="Article 9 — Propriété intellectuelle">
          <p>L'ensemble des éléments de la Plateforme (code source, design, logo Freample, textes, graphismes, base de données) est protégé par le droit de la propriété intellectuelle. Toute reproduction, modification ou exploitation non autorisée est interdite et passible de poursuites.</p>
        </S>

        <S title="Article 10 — Responsabilité de Freample">
          <p><strong>10.1.</strong> Freample met tout en oeuvre pour assurer la disponibilité et la sécurité de la Plateforme, sans garantie de disponibilité permanente.</p>
          <p><strong>10.2.</strong> Freample ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de la Plateforme, notamment : qualité des travaux, retards, malfaçons, litiges entre Client et Professionnel.</p>
          <p><strong>10.3.</strong> En cas de litige entre un Client et un Professionnel, Freample peut intervenir comme médiateur à la demande de l'une des parties, sans obligation de résultat.</p>
        </S>

        <S title="Article 11 — Résiliation">
          <p><strong>11.1.</strong> L'Utilisateur peut supprimer son compte à tout moment depuis ses paramètres (rubrique "Zone dangereuse").</p>
          <p><strong>11.2.</strong> La suppression du compte entraîne la suppression définitive des données personnelles, sous réserve des obligations légales de conservation (factures : 10 ans, données comptables : 10 ans).</p>
          <p><strong>11.3.</strong> Les obligations contractuelles en cours (devis signés, chantiers en cours, paiements séquestrés) restent en vigueur jusqu'à leur achèvement.</p>
        </S>

        <S title="Article 12 — Droit applicable et juridiction">
          <p>Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents de Nice seront seuls compétents.</p>
          <p>Conformément aux articles L.611-1 et suivants du Code de la consommation, le Client consommateur peut recourir gratuitement au service de médiation de la consommation. Le médiateur compétent sera communiqué sur simple demande à <strong>contact@freample.com</strong>.</p>
        </S>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* CONDITIONS GÉNÉRALES DE VENTE                */}
      {/* ════════════════════════════════════════════ */}
      <div id="cgv" style={{ marginTop: 48 }}>
        <h2 style={H2}>Conditions Générales de Vente (CGV)</h2>

        <S title="Article 1 — Objet des CGV">
          <p>Les présentes Conditions Générales de Vente régissent les relations commerciales entre Freample SAS et ses Utilisateurs concernant les services de mise en relation, de sécurisation des paiements et d'outils de gestion.</p>
        </S>

        <S title="Article 2 — Services et tarification">
          <p><strong>2.1. Gratuité de l'inscription.</strong> L'inscription et l'utilisation de base de la Plateforme sont gratuites pour tous les Utilisateurs (Clients et Professionnels).</p>
          <p><strong>2.2. Commission sur transactions marketplace.</strong> Pour chaque transaction réalisée via le marketplace Freample (flux "marketplace" et "lien direct"), une commission de <strong>1% du montant HT des travaux</strong> est prélevée, ainsi que les <strong>frais liés à la transaction</strong> (frais de prélèvement SEPA ou CB, variables selon le prestataire de paiement). L'ensemble de ces frais est à la charge du Client, en sus du montant des travaux. Le Professionnel reçoit 100% du montant HT convenu dans le Devis.</p>
          <p><strong>2.3. Transparence des frais.</strong> Le détail des frais (commission Freample + frais de transaction) est affiché au Client avant chaque paiement et sur le récapitulatif du Devis. Aucun frais caché n'est appliqué.</p>
          <p><strong>2.4. Mode manuel.</strong> Les 5 premiers chantiers gérés manuellement (hors marketplace) sont gratuits. Au-delà, l'utilisation du marketplace Freample est requise pour bénéficier des outils de gestion.</p>
        </S>

        <S title="Article 3 — Système de paiement par séquestre">
          <p><strong>3.1. Principe.</strong> Pour les transactions marketplace et lien direct, les paiements du Client transitent par un compte séquestre géré par un prestataire de services de paiement agréé (établissement de paiement régulé). Freample n'encaisse pas directement les fonds.</p>
          <p><strong>3.2. Paiement par jalons.</strong> Le paiement s'effectue selon l'échéancier défini dans le Devis signé. Par défaut :</p>
          <ul>
            <li><strong>Acompte (30%)</strong> : prélevé à la signature du Devis. Bloqué en séquestre.</li>
            <li><strong>Situation intermédiaire (40%)</strong> : prélevé lorsque le Professionnel déclare un avancement de 50%. Le Client dispose de 14 jours pour valider ou contester. En l'absence de réponse, la libération est automatique.</li>
            <li><strong>Solde (25%)</strong> : prélevé à la réception des travaux, après signature du PV de réception.</li>
            <li><strong>Retenue de garantie (5%)</strong> : libérée automatiquement 1 an après la réception (garantie de parfait achèvement), sauf litige en cours.</li>
          </ul>
          <p><strong>3.3. Libération des fonds.</strong> À chaque jalon validé (par le Client ou par expiration du délai de 14 jours), les fonds correspondants sont libérés au Professionnel, déduction faite de la commission Freample (1%).</p>
          <p><strong>3.4. Contestation.</strong> Le Client peut contester la libération d'un jalon dans le délai de 14 jours. La contestation ouvre un litige traité par le service de médiation Freample.</p>
          <p><strong>3.5. Délais de versement.</strong> Une fois les fonds libérés du séquestre, le virement au Professionnel est effectué sous 3 à 5 jours ouvrés.</p>
        </S>

        <S title="Article 4 — Facturation">
          <p><strong>4.1.</strong> La facture d'acompte est générée automatiquement par la Plateforme après signature du Devis par le Client.</p>
          <p><strong>4.2.</strong> Les factures de situation et de solde sont générées à la demande du Professionnel, validées par le Client via la Plateforme.</p>
          <p><strong>4.3.</strong> Les factures sont conformes aux mentions obligatoires (art. 441-3 du Code de commerce) et incluent : identité de l'émetteur, SIRET, TVA applicable, détail des prestations, conditions de paiement.</p>
          <p><strong>4.4.</strong> Pour les auto-entrepreneurs en franchise de TVA, la mention "TVA non applicable, art. 293B du CGI" est automatiquement ajoutée.</p>
        </S>

        <S title="Article 5 — Garanties légales BTP">
          <p>Le Professionnel garantit au Client, conformément à la législation française :</p>
          <ul>
            <li><strong>Garantie de parfait achèvement</strong> (1 an à compter de la réception — art. 1792-6 du Code civil) : le Professionnel s'engage à réparer tous les désordres signalés pendant cette période.</li>
            <li><strong>Garantie biennale</strong> (2 ans — art. 1792-3 du Code civil) : couvre les équipements dissociables du gros oeuvre.</li>
            <li><strong>Garantie décennale</strong> (10 ans — art. 1792 du Code civil) : couvre les dommages compromettant la solidité de l'ouvrage ou le rendant impropre à sa destination.</li>
          </ul>
          <p>Le Professionnel doit justifier d'une assurance décennale en cours de validité pour émettre des Devis sur la Plateforme.</p>
        </S>

        <S title="Article 6 — Sous-traitance">
          <p><strong>6.1.</strong> Un Professionnel peut publier des demandes de sous-traitance via la Plateforme pour des auto-entrepreneurs qualifiés.</p>
          <p><strong>6.2.</strong> En cas de sous-traitance, les règles d'auto-liquidation de TVA s'appliquent conformément à l'article 283-2 nonies du CGI : le donneur d'ordre (Professionnel principal) reverse la TVA.</p>
          <p><strong>6.3.</strong> Le sous-traitant apparaît dans l'équipe du chantier avec le statut "Sous-traitant" et est soumis aux mêmes obligations de sécurité et d'assurance.</p>
        </S>

        <S title="Article 7 — Litiges et médiation">
          <p><strong>7.1.</strong> En cas de litige entre un Client et un Professionnel (malfaçon, retard, non-conformité), Freample propose un service de médiation accessible depuis le dashboard (module "Modération").</p>
          <p><strong>7.2.</strong> Le médiateur Freample examine les preuves (rapports chantier, photos, messages, devis signé) et propose une solution dans un délai de 15 jours ouvrés.</p>
          <p><strong>7.3.</strong> En cas de litige non résolu, les fonds en séquestre restent bloqués jusqu'à résolution amiable ou décision de justice.</p>
          <p><strong>7.4.</strong> Freample peut décider unilatéralement de rembourser le Client ou de libérer les fonds au Professionnel si les preuves sont suffisamment claires.</p>
        </S>

        <S title="Article 8 — Droit de rétractation">
          <p><strong>8.1.</strong> Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux services pleinement exécutés avant la fin du délai de rétractation avec l'accord du consommateur.</p>
          <p><strong>8.2.</strong> Toutefois, si le Devis a été signé dans le cadre d'un démarchage à domicile, le Client dispose d'un délai de rétractation de 14 jours à compter de la signature.</p>
        </S>

        <S title="Article 9 — Pénalités de retard">
          <p>En cas de retard de paiement, des pénalités de retard seront appliquées au taux de 3 fois le taux d'intérêt légal (art. L441-10 du Code de commerce). Une indemnité forfaitaire de recouvrement de 40 euros est due de plein droit (art. D441-5 du Code de commerce).</p>
        </S>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* POLITIQUE DE CONFIDENTIALITÉ (RGPD)          */}
      {/* ════════════════════════════════════════════ */}
      <div id="rgpd" style={{ marginTop: 48 }}>
        <h2 style={H2}>Politique de confidentialité et protection des données</h2>

        <S title="Article 1 — Responsable du traitement">
          <p>Le responsable du traitement des données personnelles est Freample SAS, dont le siège social est situé à Marseille, France. Contact : <strong>privacy@freample.com</strong>.</p>
        </S>

        <S title="Article 2 — Données collectées">
          <p>Freample collecte les données suivantes :</p>
          <ul>
            <li><strong>Données d'identification</strong> : nom, prénom, email, téléphone, adresse, SIRET (Professionnels)</li>
            <li><strong>Données professionnelles</strong> : métier, qualifications, numéro d'assurance décennale, RC Pro</li>
            <li><strong>Données financières</strong> : IBAN (pour les versements), historique des transactions</li>
            <li><strong>Données d'usage</strong> : pages visitées, actions effectuées, adresse IP, type de navigateur</li>
            <li><strong>Données de communication</strong> : messages échangés via la messagerie de la Plateforme</li>
          </ul>
        </S>

        <S title="Article 3 — Finalités du traitement">
          <ul>
            <li>Gestion des comptes utilisateurs et authentification</li>
            <li>Mise en relation Client-Professionnel</li>
            <li>Sécurisation des paiements et gestion du séquestre</li>
            <li>Émission de devis et factures conformes</li>
            <li>Vérification des qualifications et assurances des Professionnels</li>
            <li>Amélioration de la Plateforme et statistiques anonymisées</li>
            <li>Communication commerciale (avec consentement préalable)</li>
            <li>Lutte contre la fraude et respect des obligations légales</li>
          </ul>
        </S>

        <S title="Article 4 — Base légale">
          <ul>
            <li><strong>Exécution du contrat</strong> (art. 6.1.b RGPD) : pour les traitements nécessaires à la fourniture des services</li>
            <li><strong>Obligation légale</strong> (art. 6.1.c RGPD) : conservation des factures (10 ans), obligations fiscales</li>
            <li><strong>Intérêt légitime</strong> (art. 6.1.f RGPD) : amélioration des services, sécurité, lutte anti-fraude</li>
            <li><strong>Consentement</strong> (art. 6.1.a RGPD) : communications commerciales, cookies analytiques</li>
          </ul>
        </S>

        <S title="Article 5 — Durée de conservation">
          <ul>
            <li>Données de compte : durée de la relation contractuelle + 3 ans</li>
            <li>Données de facturation : 10 ans (obligation légale)</li>
            <li>Données de navigation : 13 mois</li>
            <li>Messages : durée de la relation contractuelle + 1 an</li>
          </ul>
        </S>

        <S title="Article 6 — Destinataires des données">
          <p>Vos données peuvent être communiquées à :</p>
          <ul>
            <li>Notre prestataire de paiement agréé (pour les transactions séquestre)</li>
            <li>Notre hébergeur technique (Vercel, Render)</li>
            <li>Notre prestataire d'envoi d'emails (Resend)</li>
            <li>Les autorités compétentes sur réquisition judiciaire</li>
          </ul>
          <p>Aucune donnée personnelle n'est vendue à des tiers à des fins commerciales.</p>
        </S>

        <S title="Article 7 — Vos droits (RGPD)">
          <p>Conformément au Règlement (UE) 2016/679, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données (sous réserve des obligations légales)</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible</li>
            <li><strong>Droit d'opposition</strong> : vous opposer au traitement pour des motifs légitimes</li>
            <li><strong>Droit à la limitation</strong> : limiter le traitement dans certains cas</li>
          </ul>
          <p>Pour exercer vos droits : <strong>privacy@freample.com</strong></p>
          <p>Vous pouvez également supprimer votre compte directement depuis vos paramètres (rubrique "Zone dangereuse").</p>
          <p>Vous disposez du droit d'introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr.</p>
        </S>

        <S title="Article 8 — Cookies">
          <p><strong>Cookies strictement nécessaires</strong> : authentification, préférences utilisateur, sécurité. Ces cookies ne nécessitent pas votre consentement.</p>
          <p><strong>Cookies analytiques</strong> : mesure d'audience anonymisée pour améliorer la Plateforme. Soumis à votre consentement.</p>
          <p>Vous pouvez configurer votre navigateur pour refuser les cookies à tout moment.</p>
        </S>

        <S title="Article 9 — Sécurité">
          <p>Freample met en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement HTTPS, hashage des mots de passe, contrôle d'accès par rôle, audit de sécurité régulier.</p>
        </S>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* MENTIONS LÉGALES                             */}
      {/* ════════════════════════════════════════════ */}
      <div id="mentions" style={{ marginTop: 48 }}>
        <h2 style={H2}>Mentions légales</h2>

        <S title="Éditeur">
          <p><strong>Freample SAS</strong></p>
          <p>Société par Actions Simplifiée</p>
          <p>Siège social : Marseille, France</p>
          <p>Email : contact@freample.com</p>
          <p>Directeur de la publication : Vassili Beaufrere</p>
        </S>

        <S title="Hébergement">
          <p><strong>Frontend</strong> : Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
          <p><strong>Backend</strong> : Render Services Inc. — San Francisco, CA, USA</p>
          <p><strong>Base de données</strong> : Neon Tech Inc. (PostgreSQL serverless)</p>
        </S>

        <S title="Prestataire de paiement">
          <p>Les services de paiement sont fournis par un établissement de paiement agréé, conformément à la directive européenne sur les services de paiement (DSP2). Les fonds transitent par un compte séquestre sécurisé. Freample n'a pas la qualité d'établissement de paiement.</p>
        </S>

        <S title="Contact">
          <p>Pour toute question relative aux présentes conditions : <strong>contact@freample.com</strong></p>
          <p>Pour les questions relatives à vos données personnelles : <strong>privacy@freample.com</strong></p>
        </S>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E8E6E1', textAlign: 'center' }}>
        <a href="/" style={{ fontSize: 16, fontWeight: 800, color: '#A68B4B', textDecoration: 'none' }}>Freample</a>
        <p style={{ fontSize: 12, color: '#6E6E73', marginTop: 8 }}>Freample SAS — Marseille, France — contact@freample.com</p>
      </div>
    </div>
  );
}

const H2 = { fontSize: '1.5rem', fontWeight: 800, marginBottom: 20, color: '#1A1A1A', paddingTop: 16 };

function S({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: '#1A1A1A', borderBottom: '1px solid #F2F1ED', paddingBottom: 8 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9375rem', color: '#333' }}>{children}</div>
    </div>
  );
}
