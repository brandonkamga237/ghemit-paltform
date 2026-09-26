package com.ghemit.platform.bootstrap;

import com.ghemit.platform.content.application.ContentCatalogService;
import com.ghemit.platform.content.application.ContentSeedService;
import com.ghemit.platform.content.application.PublicContentService;
import com.ghemit.platform.content.application.port.out.ContentSeedSource;
import com.ghemit.platform.content.domain.ContentItemRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Câblage du contexte « content » : cas d'usage branchés sur leurs ports. */
@Configuration
class ContentConfiguration {

	@Bean
	ContentCatalogService contentCatalogService(ContentItemRepository repository) {
		return new ContentCatalogService(repository);
	}

	@Bean
	PublicContentService publicContentService(ContentItemRepository repository) {
		return new PublicContentService(repository);
	}

	@Bean
	ContentSeedService contentSeedService(ContentItemRepository repository, ContentSeedSource seedSource) {
		return new ContentSeedService(repository, seedSource);
	}
}
