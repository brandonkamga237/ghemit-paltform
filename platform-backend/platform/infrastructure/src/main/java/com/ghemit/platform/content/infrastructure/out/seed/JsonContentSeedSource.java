package com.ghemit.platform.content.infrastructure.out.seed;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ghemit.platform.content.application.port.out.ContentSeedSource;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * Contenu initial lu depuis {@code seed/content.json}, dont les clés reprennent
 * les « paths » des types de contenu.
 */
@Slf4j
@Component
public class JsonContentSeedSource implements ContentSeedSource {

	private static final String RESOURCE = "seed/content.json";

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public Map<ContentType, List<SeedEntry>> load() {
		ClassPathResource resource = new ClassPathResource(RESOURCE);
		if (!resource.exists()) {
			log.warn("{} absent — aucun contenu initial inséré", RESOURCE);
			return Map.of();
		}
		try (InputStream in = resource.getInputStream()) {
			Map<String, List<RawEntry>> raw = objectMapper.readValue(in, new TypeReference<>() {});
			Map<ContentType, List<SeedEntry>> seed = new LinkedHashMap<>();
			raw.forEach((path, entries) -> seed.put(ContentType.fromPath(path), entries.stream()
					.map(entry -> new SeedEntry(entry.slug(), Payload.of(entry.payload())))
					.toList()));
			return seed;
		} catch (IOException e) {
			throw new UncheckedIOException("Lecture de " + RESOURCE + " impossible", e);
		}
	}

	private record RawEntry(String slug, Map<String, Object> payload) {}
}
