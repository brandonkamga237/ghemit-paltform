package com.ghemit.platform.content.application;

import com.ghemit.platform.content.application.port.in.SeedContentUseCase;
import com.ghemit.platform.content.application.port.out.ContentSeedSource;
import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

/** Amorçage du contenu dynamique (base vide uniquement). */
public class ContentSeedService implements SeedContentUseCase {

	private final ContentItemRepository repository;
	private final ContentSeedSource seedSource;

	public ContentSeedService(ContentItemRepository repository, ContentSeedSource seedSource) {
		this.repository = repository;
		this.seedSource = seedSource;
	}

	@Override
	@Transactional
	public int seedIfEmpty() {
		if (repository.count() > 0) {
			return 0;
		}
		int inserted = 0;
		for (Map.Entry<ContentType, List<ContentSeedSource.SeedEntry>> entry : seedSource.load().entrySet()) {
			int position = 0;
			for (ContentSeedSource.SeedEntry seedEntry : entry.getValue()) {
				repository.save(ContentItem.create(
						entry.getKey(), seedEntry.slug(), position++, seedEntry.payload()));
				inserted++;
			}
		}
		return inserted;
	}
}
