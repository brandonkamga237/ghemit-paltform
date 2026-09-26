package com.ghemit.platform.media.domain;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class CvUploadPolicyTest {

	@Test
	void accepte_un_pdf_dans_la_limite_de_taille() {
		assertThatCode(() -> CvUploadPolicy.check("cv.pdf", "application/pdf", 1_000_000))
				.doesNotThrowAnyException();
	}

	@Test
	void accepte_un_pdf_reconnu_par_son_extension_seule() {
		assertThatCode(() -> CvUploadPolicy.check("CV.PDF", "application/octet-stream", 10))
				.doesNotThrowAnyException();
	}

	@Test
	void refuse_un_format_non_pdf() {
		assertThatThrownBy(() -> CvUploadPolicy.check("cv.docx", "application/msword", 10))
				.isInstanceOf(UnsupportedDocumentFormatException.class);
	}

	@Test
	void refuse_un_fichier_au_dela_de_deux_mega_octets() {
		assertThatThrownBy(() -> CvUploadPolicy.check("cv.pdf", "application/pdf",
				CvUploadPolicy.MAX_SIZE_BYTES + 1))
				.isInstanceOf(DocumentTooLargeException.class);
	}
}
