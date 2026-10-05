package com.ghemit.platform.newsletter.application.port.out;

/**
 * Habillage des campagnes : transforme le corps saisi (mise en forme légère)
 * en e-mail HTML complet avec en-tête, pied de page et lien de désinscription.
 */
public interface NewsletterTemplate {

	String render(String body, String unsubscribeUrl);
}
