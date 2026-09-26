package com.ghemit.platform.newsletter.infrastructure.in.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ghemit.platform.newsletter.application.port.in.NewsletterQuery;
import com.ghemit.platform.newsletter.application.port.in.RemoveSubscriberUseCase;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignUseCase;
import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import com.ghemit.platform.shared.domain.EmailAddress;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

@WebMvcTest(AdminNewsletterController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminNewsletterControllerTest {

	private static final UUID ID = UUID.fromString("99999999-8888-7777-6666-555555555555");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private NewsletterQuery query;

	@MockitoBean
	private SendCampaignUseCase sendCampaign;

	@MockitoBean
	private RemoveSubscriberUseCase removeSubscriber;

	@Test
	void expose_les_abonnes_avec_leur_nom_et_leur_origine() throws Exception {
		when(query.subscribers()).thenReturn(List.of(Subscriber.rehydrate(SubscriberId.of(ID),
				EmailAddress.of("awa@gehmit.org"), "Awa", "candidature:paei", true,
				Instant.parse("2026-02-01T09:00:00Z"))));

		mockMvc.perform(get("/api/admin/newsletter/subscribers"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").value(ID.toString()))
				.andExpect(jsonPath("$[0].email").value("awa@gehmit.org"))
				.andExpect(jsonPath("$[0].name").value("Awa"))
				.andExpect(jsonPath("$[0].source").value("candidature:paei"))
				.andExpect(jsonPath("$[0].active").value(true))
				.andExpect(jsonPath("$[0].createdAt").exists());
	}
}
