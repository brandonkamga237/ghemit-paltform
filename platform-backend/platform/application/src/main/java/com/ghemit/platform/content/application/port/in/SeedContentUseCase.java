package com.ghemit.platform.content.application.port.in;

/** Initialisation du contenu au démarrage. */
public interface SeedContentUseCase {

	/**
	 * Insère le contenu initial si aucun contenu n'existe encore.
	 *
	 * @return nombre d'éléments insérés (0 si le contenu existait déjà)
	 */
	int seedIfEmpty();
}
