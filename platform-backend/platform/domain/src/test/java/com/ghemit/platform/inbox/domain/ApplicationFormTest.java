package com.ghemit.platform.inbox.domain;

import static org.assertj.core.api.Assertions.assertThat;

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
}
