package com.ghemit.platform.content.infrastructure.in.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import com.ghemit.platform.content.application.port.in.PublicContentView;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

/**
 * Contrat de GET /api/public/content : le site public dépend du nom exact de
 * chaque section. Seul le contenu réellement administrable y figure.
 */
@WebMvcTest(PublicContentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicContentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private PublicContentQuery publicContentQuery;

	@Test
	void expose_les_sections_dynamiques_attendues_par_le_site() throws Exception {
		when(publicContentQuery.publicContent()).thenReturn(new PublicContentView(
				List.of(Map.of("slug", "paei", "status", "open")),
				List.of(Map.of("name", "Développement web")),
				List.of(Map.of("slug", "seminaire-orientation")),
				List.of(Map.of("title", "Forum de l'emploi", "upcoming", true)),
				List.of(Map.of("name", "Partenaire"))));

		mockMvc.perform(get("/api/public/content"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.programs[0].slug").value("paei"))
				.andExpect(jsonPath("$.formations[0].name").value("Développement web"))
				.andExpect(jsonPath("$.articles[0].slug").value("seminaire-orientation"))
				.andExpect(jsonPath("$.events[0].title").value("Forum de l'emploi"))
				.andExpect(jsonPath("$.partners[0].name").value("Partenaire"));
	}

	@Test
	void sert_un_article_publie_par_son_slug() throws Exception {
		when(publicContentQuery.publishedArticle("seminaire"))
				.thenReturn(Map.of("title", "Séminaire", "body", List.of(Map.of("type", "p", "text", "x"))));

		mockMvc.perform(get("/api/public/articles/seminaire"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("Séminaire"))
				.andExpect(jsonPath("$.body[0].type").value("p"));
	}

	@Test
	void un_article_absent_ou_en_brouillon_renvoie_404() throws Exception {
		when(publicContentQuery.publishedArticle("brouillon"))
				.thenThrow(new EntityNotFoundException("Article introuvable"));

		mockMvc.perform(get("/api/public/articles/brouillon"))
				.andExpect(status().isNotFound());
	}
}
