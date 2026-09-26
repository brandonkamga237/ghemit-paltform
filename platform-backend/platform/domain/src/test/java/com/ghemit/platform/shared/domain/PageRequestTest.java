package com.ghemit.platform.shared.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PageRequestTest {

	private static final Sort SORT = Sort.by(Sort.desc("createdAt"));

	@Test
	void borne_la_taille_de_page_demandee() {
		assertThat(PageRequest.of(0, 5000, SORT).size()).isEqualTo(PageRequest.MAX_SIZE);
		assertThat(PageRequest.of(0, 0, SORT).size()).isEqualTo(1);
	}

	@Test
	void ramene_un_numero_de_page_negatif_a_zero() {
		assertThat(PageRequest.of(-3, 20, SORT).page()).isZero();
	}

	@Test
	void calcule_le_nombre_total_de_pages() {
		Page<String> page = Page.of(java.util.List.of("a", "b"), 21, PageRequest.of(0, 20, SORT));
		assertThat(page.totalPages()).isEqualTo(2);
	}
}
