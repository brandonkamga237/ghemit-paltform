package com.ghemit.platform.content.domain;

import java.util.List;
import java.util.Optional;

/** Port de persistance du contenu éditorial, implémenté par un adaptateur JPA. */
public interface ContentItemRepository {

	List<ContentItem> findByType(ContentType type);

	Optional<ContentItem> findByTypeAndSlug(ContentType type, String slug);

	Optional<ContentItem> findById(ContentItemId id);

	ContentItem save(ContentItem item);

	void delete(ContentItem item);

	long count();
}
