import React from 'react';

export default function CGU() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', fontFamily: 'inherit', color: 'var(--text, #1a1a2e)', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Conditions Générales d'Utilisation</h1>
      <p style={{ color: 'var(--text-secondary, #6b7280)', marginBottom: 40 }}>Dernière mise à jour : 28 mars 2026</p>

      <Section title="1. Présentation">
        <p>MonArtisan est une plateforme de mise en relation entre clients particuliers et artisans du bâtiment (plombiers, électriciens, maçons, etc.), éditée par Application Artisans SAS, société par actions simplifiée au capital de 10 000 €, dont le siège social est situé à Paris, France, immatriculée au RCS de Paris.</p>
        <p>L'accès et l'utilisation de la plateforme sont soumis aux présentes Conditions Générales d'Utilisation (CGU). En créant un compte ou en utilisant nos services, vous acceptez sans réserve ces CGU.</p>
      </Section>

      <Section title="2. Accès et inscription">
        <p>L'inscription est gratuite pour les clients. Les artisans bénéficient d'un essai gratuit. L'accès à certaines fonctionnalités peut être soumis à un abonnement payant.</p>
        <p>Vous devez avoir au moins 18 ans et fournir des informations exactes lors de votre inscription. Vous êtes responsable de la confidentialité de vos identifiants.</p>
      </Section>

      <Section title="3. Services proposés">
        <p><strong>Pour les clients :</strong> recherche d'artisans vérifiés, demande de devis, suivi des travaux, messagerie, paiements en ligne, système d'avis.</p>
        <p><strong>Pour les artisans :</strong> gestion des devis et factures, planning, RH, stocks, comptabilité, réputation, messagerie client.</p>
        <p>MonArtisan agit en tant qu'intermédiaire et n'est pas partie au contrat de prestation conclu entre un client et un artisan.</p>
      </Section>

      <Section title="4. Obligations des utilisateurs">
        <p>Vous vous engagez à :</p>
        <ul>
          <li>Ne pas publier de contenus illicites, diffamatoires ou trompeurs</li>
          <li>Ne pas utiliser la plateforme à des fins frauduleuses</li>
          <li>Respecter les autres utilisateurs</li>
          <li>Fournir des informations exactes dans votre profil et vos avis</li>
        </ul>
        <p>Tout manquement peut entraîner la suspension ou suppression de votre compte sans préavis.</p>
      </Section>

      <Section title="5. Propriété intellectuelle">
        <p>L'ensemble des éléments de la plateforme (logo, design, code, textes) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.</p>
      </Section>

      <Section title="6. Responsabilité">
        <p>MonArtisan ne garantit pas la disponibilité permanente de la plateforme et ne peut être tenu responsable des dommages directs ou indirects liés à son utilisation.</p>
        <p>Les artisans inscrits sont vérifiés (SIRET, qualifications), mais MonArtisan n'est pas responsable de la qualité des travaux réalisés.</p>
      </Section>

      <Section title="7. Protection des données personnelles (RGPD)">
        <p>MonArtisan collecte et traite vos données personnelles dans le respect du Règlement Général sur la Protection des Données (RGPD – Règlement UE 2016/679).</p>
        <p><strong>Données collectées :</strong> nom, email, téléphone, adresse, données de navigation, historique des transactions.</p>
        <p><strong>Finalités :</strong> gestion du compte, mise en relation, amélioration des services, envoi de communications (avec consentement).</p>
        <p><strong>Durée de conservation :</strong> données de compte conservées pendant toute la durée de la relation contractuelle + 3 ans.</p>
        <p><strong>Vos droits :</strong> accès, rectification, effacement, portabilité, limitation du traitement. Pour exercer vos droits : <strong>privacy@monartisan.fr</strong></p>
        <p>Vous pouvez supprimer votre compte à tout moment depuis votre profil (section "Zone dangereuse").</p>
      </Section>

      <Section title="8. Cookies">
        <p>La plateforme utilise des cookies strictement nécessaires au fonctionnement (authentification, préférences) et des cookies analytiques anonymisés pour améliorer l'expérience. Vous pouvez configurer votre navigateur pour refuser les cookies.</p>
      </Section>

      <Section title="9. Droit applicable">
        <p>Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents de Paris seront seuls compétents.</p>
      </Section>

      <Section title="Mentions légales">
        <p><strong>Éditeur :</strong> Application Artisans SAS — Paris, France</p>
        <p><strong>Directeur de la publication :</strong> Vassili Beaufrere</p>
        <p><strong>Hébergeur :</strong> Render (backend) — Vercel (frontend)</p>
        <p><strong>Contact :</strong> contact@monartisan.fr</p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 12, color: 'var(--text, #1a1a2e)', borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: 8 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9375rem' }}>{children}</div>
    </div>
  );
}
