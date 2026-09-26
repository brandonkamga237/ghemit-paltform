package com.ghemit.platform.shared.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class EmailAddressTest {

	@Test
	void normalise_la_casse_et_les_espaces() {
		assertThat(EmailAddress.of("  Info.Gehmit@Gmail.COM ").value()).isEqualTo("info.gehmit@gmail.com");
	}

	@Test
	void deux_adresses_de_casse_differente_sont_egales() {
		assertThat(EmailAddress.of("A@b.com")).isEqualTo(EmailAddress.of("a@B.com"));
	}

	@Test
	void refuse_une_adresse_sans_arobase() {
		assertThatThrownBy(() -> EmailAddress.of("pas-une-adresse"))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void refuse_une_adresse_vide() {
		assertThatThrownBy(() -> EmailAddress.of("  "))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void la_variante_tolerante_ignore_une_saisie_invalide() {
		assertThat(EmailAddress.tryOf("n/a")).isEmpty();
		assertThat(EmailAddress.tryOf(null)).isEmpty();
		assertThat(EmailAddress.tryOf("a@b.fr")).isPresent();
	}
}
