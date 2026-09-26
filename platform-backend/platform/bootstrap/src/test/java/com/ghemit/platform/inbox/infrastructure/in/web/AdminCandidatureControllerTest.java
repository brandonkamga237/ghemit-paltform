package com.ghemit.platform.inbox.infrastructure.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ghemit.platform.inbox.application.port.in.CandidatureQuery;
import com.ghemit.platform.inbox.application.port.in.ManageCandidaturesUseCase;
import com.ghemit.platform.inbox.application.port.in.UpdateCandidatureCommand;
import com.ghemit.platform.inbox.domain.ApplicationForm;
import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureStatus;
import com.ghemit.platform.inbox.domain.ProgramCode;
import com.ghemit.platform.shared.domain.Page;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

/** Contrat de /api/admin/candidatures, consommé par le back office. */
@WebMvcTest(AdminCandidatureController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminCandidatureControllerTest {

	private static final UUID ID = UUID.fromString("11111111-2222-3333-4444-555555555555");

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private CandidatureQuery query;

	@MockitoBean
	private ManageCandidaturesUseCase manageCandidatures;

	private static Candidature candidature() {
		return Candidature.rehydrate(CandidatureId.of(ID), ProgramCode.of("paei"),
				ApplicationForm.of(Map.of("nom", "Ngo")), false, CandidatureStatus.IN_PROGRESS,
				"À relancer", Instant.parse("2026-01-15T10:00:00Z"));
	}

	@Test
	void renvoie_une_page_a_la_forme_attendue_par_le_back_office() throws Exception {
		when(query.search(any(), any())).thenReturn(new Page<>(List.of(candidature()), 42, 1, 20));

		mockMvc.perform(get("/api/admin/candidatures?page=1&size=20"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(ID.toString()))
				.andExpect(jsonPath("$.content[0].program").value("paei"))
				.andExpect(jsonPath("$.content[0].form.nom").value("Ngo"))
				.andExpect(jsonPath("$.content[0].readFlag").value(false))
				.andExpect(jsonPath("$.content[0].status").value("in_progress"))
				.andExpect(jsonPath("$.content[0].note").value("À relancer"))
				.andExpect(jsonPath("$.totalElements").value(42))
				.andExpect(jsonPath("$.totalPages").value(3))
				.andExpect(jsonPath("$.number").value(1))
				.andExpect(jsonPath("$.size").value(20));
	}

	@Test
	void traduit_un_patch_partiel_en_commande() throws Exception {
		when(manageCandidatures.update(any())).thenReturn(candidature());

		mockMvc.perform(patch("/api/admin/candidatures/" + ID)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"accepted\",\"readFlag\":true}"))
				.andExpect(status().isOk());

		ArgumentCaptor<UpdateCandidatureCommand> captor =
				ArgumentCaptor.forClass(UpdateCandidatureCommand.class);
		org.mockito.Mockito.verify(manageCandidatures).update(captor.capture());
		UpdateCandidatureCommand command = captor.getValue();
		org.assertj.core.api.Assertions.assertThat(command.status())
				.isEqualTo(CandidatureStatus.ACCEPTED);
		org.assertj.core.api.Assertions.assertThat(command.read()).isTrue();
		org.assertj.core.api.Assertions.assertThat(command.noteProvided()).isFalse();
	}

	@Test
	void refuse_un_statut_inconnu_avec_un_code_400() throws Exception {
		mockMvc.perform(patch("/api/admin/candidatures/" + ID)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"en_attente\"}"))
				.andExpect(status().isBadRequest());
	}
}
