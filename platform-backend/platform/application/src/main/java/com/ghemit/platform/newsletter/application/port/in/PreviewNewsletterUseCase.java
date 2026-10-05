package com.ghemit.platform.newsletter.application.port.in;

/** Aperçu fidèle du rendu e-mail (même gabarit que l'envoi réel). */
public interface PreviewNewsletterUseCase {

	String renderPreview(String body);
}
