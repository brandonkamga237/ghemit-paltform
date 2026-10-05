package com.ghemit.platform.content.application.port.in;

import java.util.Map;

/** Assemblage du contenu affiché par le site public. */
public interface PublicContentQuery {

	PublicContentView publicContent();

	/** Article publié complet (corps compris). */
	Map<String, Object> publishedArticle(String slug);
}
