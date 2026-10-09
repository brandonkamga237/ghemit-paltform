package com.ghemit.platform.inbox.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ApplicationFormTest {

	@Test
	void reconstitue_le_nom_complet_du_candidat() {
		ApplicationForm form = ApplicationForm.of(Map.of("prenom", "Awa", "nom", "Ngo"));

		assertThat(form.candidateFullName()).contains("Awa Ngo");
	}

	@Test
	void tolere_un_nom_partiel() {
		assertThat(ApplicationForm.of(Map.of("prenom", "Awa")).candidateFullName()).contains("Awa");
		assertThat(ApplicationForm.of(Map.of("nom", "Ngo")).candidateFullName()).contains("Ngo");
		assertThat(ApplicationForm.empty().candidateFullName()).isEmpty();
	}

	@Test
	void extrait_l_adresse_du_candidat_en_la_normalisant() {
		ApplicationForm form = ApplicationForm.of(Map.of("email", " Awa@Gehmit.ORG "));

		assertThat(form.candidateEmail()).map(email -> email.value()).contains("awa@gehmit.org");
	}

	@Test
	void ignore_une_adresse_de_candidat_invalide() {
		assertThat(ApplicationForm.of(Map.of("email", "je-nai-pas-de-mail")).candidateEmail()).isEmpty();
	}

	@Test
	void est_immuable_vis_a_vis_de_la_source() {
		Map<String, Object> source = new java.util.HashMap<>(Map.of("nom", "Ngo"));
		ApplicationForm form = ApplicationForm.of(source);

		source.put("nom", "Modifié");

		assertThat(form.text("nom")).contains("Ngo");
	}

	@Test
	void accepte_un_formulaire_depose_ordinaire() {
		ApplicationForm form = ApplicationForm.fromSubmission(Map.of("prenom", "Awa", "consentement", true, "age", 21));

		assertThat(form.text("prenom")).contains("Awa");
	}

	@Test
	void refuse_un_formulaire_depose_avec_trop_de_champs() {
		Map<String, Object> fields = new HashMap<>();
		for (int i = 0; i <= ApplicationForm.MAX_FIELDS; i++) {
			fields.put("champ" + i, "x");
		}

		assertThatThrownBy(() -> ApplicationForm.fromSubmission(fields))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void refuse_une_reponse_trop_longue() {
		String longText = "x".repeat(ApplicationForm.MAX_TEXT_LENGTH + 1);

		assertThatThrownBy(() -> ApplicationForm.fromSubmission(Map.of("motivation", longText)))
				.isInstanceOf(BusinessRuleViolationException.class)
				.hasMessageContaining("motivation");
	}

	@Test
	void refuse_une_reponse_imbriquee() {
		assertThatThrownBy(() -> ApplicationForm.fromSubmission(Map.of("liste", List.of("a", "b"))))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void la_reconstitution_ne_rejoue_pas_les_limites() {
		String longText = "x".repeat(ApplicationForm.MAX_TEXT_LENGTH + 1);

		assertThat(ApplicationForm.of(Map.of("motivation", longText)).text("motivation")).isPresent();
	}
}
