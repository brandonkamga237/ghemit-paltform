package com.ghemit.platform.media.infrastructure.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ghemit.platform.media.application.port.in.CvUploaded;
import com.ghemit.platform.media.application.port.in.DownloadMediaQuery;
import com.ghemit.platform.media.application.port.in.MediaDownload;
import com.ghemit.platform.media.application.port.out.StoredObject;
import com.ghemit.platform.media.application.port.in.UploadCvUseCase;
import com.ghemit.platform.media.domain.DocumentTooLargeException;
import com.ghemit.platform.media.domain.ObjectKey;
import com.ghemit.platform.media.domain.UnsupportedDocumentFormatException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import javax.imageio.ImageIO;
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

	/** Image PNG réelle de la largeur demandée, servie par le stockage simulé. */
	private void storedPng(int width) throws Exception {
		BufferedImage image = new BufferedImage(width, width / 2, BufferedImage.TYPE_INT_RGB);
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		ImageIO.write(image, "png", out);
		byte[] bytes = out.toByteArray();
		when(downloadMedia.download(any())).thenAnswer(inv -> new MediaDownload("image/png", new StoredObject() {
			private final InputStream in = new ByteArrayInputStream(bytes);

			@Override
			public InputStream stream() {
				return in;
			}

			@Override
			public void close() {
			}
		}));
	}

	private int servedWidth(String url) throws Exception {
		byte[] body = mockMvc.perform(get(url)).andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
		return ImageIO.read(new ByteArrayInputStream(body)).getWidth();
	}

	@Test
	void arrondit_la_largeur_demandee_au_palier_superieur_et_la_plafonne() {
		assertThat(PublicMediaController.snapWidth(1)).isEqualTo(160);
		assertThat(PublicMediaController.snapWidth(321)).isEqualTo(640);
		assertThat(PublicMediaController.snapWidth(1920)).isEqualTo(1920);
		assertThat(PublicMediaController.snapWidth(20_000)).isEqualTo(1920);
	}

	@Test
	void n_agrandit_jamais_une_image_au_dela_de_sa_taille_d_origine() throws Exception {
		storedPng(400);

		assertThat(servedWidth("/api/public/media/photo.png?w=20000")).isEqualTo(400);
	}

	@Test
	void reduit_une_image_au_palier_demande() throws Exception {
		storedPng(1000);

		assertThat(servedWidth("/api/public/media/photo.png?w=300")).isEqualTo(320);
	}

	@Test
	void ne_sert_pas_un_cv_designe_par_un_chemin_detourne() throws Exception {
		mockMvc.perform(get("/api/public/media/./cv/abc-cv.pdf"))
				.andExpect(status().isNotFound());

		verifyNoInteractions(downloadMedia);
	}
}
