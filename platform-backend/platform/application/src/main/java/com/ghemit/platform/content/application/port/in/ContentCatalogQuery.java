package com.ghemit.platform.content.application.port.in;

import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentType;
import java.util.List;
import java.util.Map;

/** Consultation du contenu éditorial par le back office. */
public interface ContentCatalogQuery {

	List<ContentItem> byType(ContentType type);

	/** Tous les contenus regroupés par type, dans l'ordre d'affichage. */
	Map<ContentType, List<ContentItem>> groupedByType();
}
