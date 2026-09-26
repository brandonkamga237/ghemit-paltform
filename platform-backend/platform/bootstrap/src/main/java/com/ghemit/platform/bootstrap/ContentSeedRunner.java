package com.ghemit.platform.bootstrap;

import com.ghemit.platform.content.application.port.in.SeedContentUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Amorçage du contenu au démarrage. L'insertion initiale est désactivable par
 * {@code app.content.seed}, mais les réglages requis sont toujours vérifiés.
 */
@Slf4j
@Component
@RequiredArgsConstructor
class ContentSeedRunner implements ApplicationRunner {

	private final SeedContentUseCase seedContent;

	@Value("${app.content.seed:true}")
	private boolean seedEnabled;

	@Override
	public void run(ApplicationArguments args) {
		if (seedEnabled) {
			int inserted = seedContent.seedIfEmpty();
			if (inserted > 0) {
				log.info("Contenu initial inséré : {} éléments", inserted);
			}
		}
		seedContent.ensureRequiredSettings();
	}
}
