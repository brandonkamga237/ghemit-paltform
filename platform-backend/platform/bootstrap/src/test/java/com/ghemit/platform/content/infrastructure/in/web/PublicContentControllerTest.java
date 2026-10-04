package com.ghemit.platform.content.infrastructure.in.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import com.ghemit.platform.content.application.port.in.PublicContentView;
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
 * chaque section.
 */
@WebMvcTest(PublicContentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicContentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private PublicContentQuery publicContentQuery;

	@Test
	void expose_toutes_les_sections_attendues_par_le_site() throws Exception {
		when(publicContentQuery.publicContent()).thenReturn(new PublicContentView(
				List.of(Map.of("slug", "paei")),
				List.of(), List.of(), List.of(),
				List.of("Tous", "Orientation"),
				List.of(), List.of(), List.of(), List.of(),
				Map.of("email", "info.gehmit@gmail.com"),
				Map.of("home.title", "Gehmit"),
				Map.of("home.hero", "/api/public/media/hero.jpg")));

		mockMvc.perform(get("/api/public/content"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.programs[0].slug").value("paei"))
				.andExpect(jsonPath("$.formations").isArray())
				.andExpect(jsonPath("$.calendarRows").isArray())
				.andExpect(jsonPath("$.articles").isArray())
				.andExpect(jsonPath("$.blogCategories[0]").value("Tous"))
				.andExpect(jsonPath("$.faq").isArray())
				.andExpect(jsonPath("$.partners").isArray())
				.andExpect(jsonPath("$.stats").isArray())
				.andExpect(jsonPath("$.achievements").isArray())
				.andExpect(jsonPath("$.contact.email").value("info.gehmit@gmail.com"))
				.andExpect(jsonPath("$.pageTexts['home.title']").value("Gehmit"))
				.andExpect(jsonPath("$.pageImages['home.hero']").value("/api/public/media/hero.jpg"));
	}
}
