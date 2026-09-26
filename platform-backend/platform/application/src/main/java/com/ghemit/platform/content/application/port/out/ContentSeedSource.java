package com.ghemit.platform.content.application.port.out;

import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;
import java.util.List;
import java.util.Map;

/** Source du contenu initial (aujourd'hui un fichier JSON du classpath). */
public interface ContentSeedSource {

	record SeedEntry(String slug, Payload payload) {}

	/** @return contenus initiaux par type, dans l'ordre d'affichage souhaité */
	Map<ContentType, List<SeedEntry>> load();
}
