package com.ghemit.platform.content.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ArticleTest {

	@Test
	void un_article_sans_statut_est_considere_comme_publie() {
		assertThat(Article.isPublished(Payload.of(Map.of("title", "Ancien article")))).isTrue();
		assertThat(Article.isPublished(Payload.of(Map.of("status", "published")))).isTrue();
		assertThat(Article.isPublished(Payload.of(Map.of("status", "draft")))).isFalse();
	}

	@Test
	void la_duree_de_lecture_est_calculee_sur_le_texte_des_blocs() {
		String words440 = "mot ".repeat(440);
		Payload payload = Payload.of(Map.of("body", List.of(
				Map.of("type", "p", "text", words440),
				Map.of("type", "hr"))));

		assertThat(Article.readingMinutes(payload)).isEqualTo(2);
		assertThat(Article.readingMinutes(Payload.empty())).isEqualTo(1);
	}

	@Test
	void le_resume_ne_contient_ni_le_corps_ni_l_encart() {
		Payload payload = Payload.of(Map.of(
				"title", "Titre",
				"body", List.of(Map.of("type", "p", "text", "Bonjour")),
				"cta", Map.of("label", "Candidater")));

		assertThat(Article.summary(payload))
				.containsEntry("title", "Titre")
				.containsEntry("readingMinutes", 1)
				.doesNotContainKeys("body", "cta");
		assertThat(Article.full(payload)).containsKeys("body", "cta", "readingMinutes");
	}

	@Test
	void les_articles_les_plus_recents_passent_en_premier() {
		ContentItem ancien = ContentItem.create(ContentType.ARTICLE, "a", 0, Payload.of(Map.of("publishedAt", "2026-04-16")));
		ContentItem recent = ContentItem.create(ContentType.ARTICLE, "b", 1, Payload.of(Map.of("publishedAt", "2026-08-10")));

		assertThat(List.of(ancien, recent).stream().sorted(Article.NEWEST_FIRST).toList())
				.containsExactly(recent, ancien);
	}
}
