package com.ghemit.platform.inbox.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

class ProgramCodeTest {

	@Test
	void accepte_les_codes_envoyes_par_le_site() {
		assertThat(ProgramCode.submitted("paei").value()).isEqualTo("paei");
		assertThat(ProgramCode.submitted("caravanes-jeune").value()).isEqualTo("caravanes-jeune");
	}

	@Test
	void refuse_un_code_libre_a_la_soumission() {
		assertThatThrownBy(() -> ProgramCode.submitted("<script>"))
				.isInstanceOf(BusinessRuleViolationException.class);
		assertThatThrownBy(() -> ProgramCode.submitted("x".repeat(65)))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void reste_tolerant_a_la_reconstitution_des_donnees_historiques() {
		assertThat(ProgramCode.of("Ancien Programme").value()).isEqualTo("Ancien Programme");
	}
}
