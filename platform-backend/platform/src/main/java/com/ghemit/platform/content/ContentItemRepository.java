package com.ghemit.platform.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {

	List<ContentItem> findByTypeOrderByPositionAsc(ContentType type);

	Optional<ContentItem> findByTypeAndSlug(ContentType type, String slug);
}
