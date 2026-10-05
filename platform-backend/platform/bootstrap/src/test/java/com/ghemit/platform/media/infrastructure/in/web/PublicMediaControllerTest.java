package com.ghemit.platform.media.infrastructure.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ghemit.platform.media.application.port.in.CvUploaded;
import com.ghemit.platform.media.application.port.in.DownloadMediaQuery;
import com.ghemit.platform.media.application.port.in.UploadCvUseCase;
import com.ghemit.platform.media.domain.DocumentTooLargeException;
import com.ghemit.platform.media.domain.ObjectKey;
import com.ghemit.platform.media.domain.UnsupportedDocumentFormatException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

@WebMvcTest(PublicMediaController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicMediaControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private UploadCvUseCase uploadCv;

	@MockitoBean
	private DownloadMediaQuery downloadMedia;

	private static MockMultipartFile pdf() {
		return new MockMultipartFile("file", "cv.pdf", "application/pdf", "%PDF".getBytes());
	}

	@Test
	void renvoie_la_cle_et_l_url_publique_du_cv_depose() throws Exception {
		when(uploadCv.upload(any()))
				.thenReturn(new CvUploaded(ObjectKey.of("cv/abc-cv.pdf"), "cv.pdf"));

		mockMvc.perform(multipart("/api/public/cv").file(pdf()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.objectKey").value("cv/abc-cv.pdf"))
				.andExpect(jsonPath("$.url").value("/api/public/media/cv/abc-cv.pdf"))
				.andExpect(jsonPath("$.filename").value("cv.pdf"));
	}

	@Test
	void ne_sert_jamais_un_cv_sur_l_endpoint_public() throws Exception {
		mockMvc.perform(get("/api/public/media/cv/abc-cv.pdf"))
				.andExpect(status().isNotFound());

		verifyNoInteractions(downloadMedia);
	}

	@Test
	void traduit_un_format_refuse_en_415() throws Exception {
		when(uploadCv.upload(any())).thenThrow(new UnsupportedDocumentFormatException("Seuls les PDF"));

		mockMvc.perform(multipart("/api/public/cv").file(pdf()))
				.andExpect(status().isUnsupportedMediaType());
	}

	@Test
	void traduit_un_fichier_trop_lourd_en_413() throws Exception {
		when(uploadCv.upload(any())).thenThrow(new DocumentTooLargeException("Trop lourd"));

		mockMvc.perform(multipart("/api/public/cv").file(pdf()))
				.andExpect(status().isContentTooLarge());
	}
}
