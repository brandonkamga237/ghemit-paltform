package com.ghemit.platform.content.application.port.in;

/** Initialisation du contenu au démarrage. */
public interface SeedContentUseCase {

	/**
	 * Insère le contenu initial si aucun contenu n'existe encore.
	 *
	 * @return nombre d'éléments insérés (0 si le contenu existait déjà)
	 */
	int seedIfEmpty();

	/**
	 * Garantit la présence des réglages indispensables au back office, y compris
	 * sur une base où l'amorçage initial a déjà été joué.
	 */
	void ensureRequiredSettings();
}
