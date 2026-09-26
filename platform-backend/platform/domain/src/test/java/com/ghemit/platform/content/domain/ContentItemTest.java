package com.ghemit.platform.content.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ContentItemTest {

	@Test
	void un_slug_vide_est_ramene_a_l_absence_de_slug() {
		assertThat(ContentItem.create(ContentType.ARTICLE, "  ", 0, Payload.empty()).slug()).isNull();
	}

	@Test
	void refuse_une_position_negative() {
		assertThatThrownBy(() -> ContentItem.create(ContentType.ARTICLE, "a", -1, Payload.empty()))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void conserve_l_ordre_des_cles_du_payload() {
		Map<String, Object> source = new LinkedHashMap<>();
		source.put("titre", "Gehmit");
		source.put("auteur", "Awa");
		source.put("date", "2026-01-01");

		assertThat(Payload.of(source).asMap().keySet()).containsExactly("titre", "auteur", "date");
	}

	@Test
	void le_payload_est_immuable() {
		Payload payload = Payload.of(Map.of("titre", "Gehmit"));

		Payload modifie = payload.with("titre", "Autre");

		assertThat(payload.get("titre")).isEqualTo("Gehmit");
		assertThat(modifie.get("titre")).isEqualTo("Autre");
	}

	@Test
	void resout_un_type_de_contenu_depuis_son_chemin_d_api() {
		assertThat(ContentType.fromPath("calendar-rows")).isEqualTo(ContentType.CALENDAR_ROW);
		assertThatThrownBy(() -> ContentType.fromPath("inconnu"))
				.isInstanceOf(BusinessRuleViolationException.class);
	}
}
