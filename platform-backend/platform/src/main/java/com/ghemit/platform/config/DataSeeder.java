package com.ghemit.platform.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ghemit.platform.content.ContentItem;
import com.ghemit.platform.content.ContentItemRepository;
import com.ghemit.platform.content.ContentType;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Alimente la table content_items depuis seed/content.json au premier démarrage.
 * Le JSON reprend les données initiales de src/data/content.ts du frontend.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

	private final ContentItemRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${app.content.seed:true}")
	private boolean seedEnabled;

	@Override
	@Transactional
	public void run(ApplicationArguments args) throws Exception {
		if (seedEnabled && repository.count() == 0) {
			seed();
		}
		ensurePageTextsSetting();
	}

	private void seed() throws Exception {
		ClassPathResource resource = new ClassPathResource("seed/content.json");
		if (!resource.exists()) {
			log.warn("seed/content.json absent — aucun contenu initial inséré");
			return;
		}
		Map<String, List<SeedItem>> seed = objectMapper.readValue(
				resource.getInputStream(), new TypeReference<>() {});

		int count = 0;
		for (Map.Entry<String, List<SeedItem>> entry : seed.entrySet()) {
			ContentType type = ContentType.fromPath(entry.getKey());
			int position = 0;
			for (SeedItem item : entry.getValue()) {
				ContentItem entity = new ContentItem();
				entity.setType(type);
				entity.setSlug(item.slug());
				entity.setPosition(position++);
				entity.setPayload(item.payload());
				repository.save(entity);
				count++;
			}
		}
		log.info("Contenu initial inséré : {} éléments", count);
	}

	/**
	 * Garantit l'existence du réglage « page-texts » (textes de pages modifiables
	 * depuis le back office), même quand le seed initial a déjà été joué.
	 */
	private void ensurePageTextsSetting() {
		if (repository.findByTypeAndSlug(ContentType.SETTING, "page-texts").isEmpty()) {
			ContentItem item = new ContentItem();
			item.setType(ContentType.SETTING);
			item.setSlug("page-texts");
			item.setPosition(0);
			item.setPayload(new java.util.LinkedHashMap<>(Map.of("texts", Map.of())));
			repository.save(item);
		}
	}

	private record SeedItem(String slug, Map<String, Object> payload) {}
}
