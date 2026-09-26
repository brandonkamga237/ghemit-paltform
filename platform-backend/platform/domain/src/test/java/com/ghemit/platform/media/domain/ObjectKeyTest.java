package com.ghemit.platform.media.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ObjectKeyTest {

	@Test
	void assainit_le_nom_de_fichier_d_origine() {
		ObjectKey key = ObjectKey.forLibrary("photo de l'équipe (2).png");

		assertThat(key.value()).endsWith("-photo_de_l__quipe__2_.png");
	}

	@Test
	void prefixe_les_cv_pour_les_isoler_de_la_mediatheque() {
		ObjectKey key = ObjectKey.forCv("cv.pdf");

		assertThat(key.value()).startsWith("cv/");
		assertThat(key.isCv()).isTrue();
		assertThat(ObjectKey.forLibrary("cv.pdf").isCv()).isFalse();
	}

	@Test
	void deux_cles_generees_pour_le_meme_fichier_sont_distinctes() {
		assertThat(ObjectKey.forLibrary("logo.svg")).isNotEqualTo(ObjectKey.forLibrary("logo.svg"));
	}
}
