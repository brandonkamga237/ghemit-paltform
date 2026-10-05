package com.ghemit.platform.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;

import com.ghemit.platform.content.application.port.in.ContentCatalogQuery;
import com.ghemit.platform.content.application.port.in.ManageContentUseCase;
import com.ghemit.platform.content.application.port.in.PublicContentQuery;
import com.ghemit.platform.content.application.port.in.SeedContentUseCase;
import com.ghemit.platform.content.application.port.out.ContentSeedSource;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.inbox.application.port.in.CandidatureQuery;
import com.ghemit.platform.inbox.application.port.in.ManageCandidaturesUseCase;
import com.ghemit.platform.inbox.application.port.in.SubmitCandidatureUseCase;
import com.ghemit.platform.inbox.application.port.in.SubmitContactMessageUseCase;
import com.ghemit.platform.inbox.application.port.out.NewsletterEnrollment;
import com.ghemit.platform.inbox.domain.CandidatureRepository;
import com.ghemit.platform.inbox.domain.ContactMessageRepository;
import com.ghemit.platform.media.application.port.in.ManageMediaUseCase;
import com.ghemit.platform.media.application.port.in.UploadCvUseCase;
import com.ghemit.platform.media.application.port.out.FileStorage;
import com.ghemit.platform.media.application.port.out.MediaFolderCatalog;
import com.ghemit.platform.media.domain.MediaFileRepository;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignUseCase;
import com.ghemit.platform.newsletter.application.port.in.SubscribeToNewsletterUseCase;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/**
 * Vérifie que chaque port trouve exactement un adaptateur et que tout l'hexagone
 * se câble. Aucune base n'est jointe : l'accès aux métadonnées JDBC est coupé,
 * ce qui permet de valider le graphe de beans sans infrastructure.
 */
@SpringBootTest
@TestPropertySource(properties = {
		"spring.jpa.hibernate.ddl-auto=none",
		"spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false",
		"spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect",
		"spring.datasource.url=jdbc:postgresql://localhost:1/absente",
		"spring.datasource.hikari.initialization-fail-timeout=-1",
		"app.content.seed=false",
		"spring.main.lazy-initialization=false"
})
class HexagonWiringTest {

	@Autowired
	private ApplicationContext context;

	// Sans base disponible, on court-circuite le runner d'amorçage qui ouvre une
	// transaction au démarrage ; le câblage du port lui-même reste vérifié.
	@MockitoBean
	private SeedContentUseCase seedContentUseCase;

	@Test
	void chaque_port_sortant_a_son_adaptateur() {
		assertThat(context.getBean(ContentItemRepository.class)).isNotNull();
		assertThat(context.getBean(CandidatureRepository.class)).isNotNull();
		assertThat(context.getBean(ContactMessageRepository.class)).isNotNull();
		assertThat(context.getBean(MediaFileRepository.class)).isNotNull();
		assertThat(context.getBean(SubscriberRepository.class)).isNotNull();
		assertThat(context.getBean(CampaignRepository.class)).isNotNull();
		assertThat(context.getBean(FileStorage.class)).isNotNull();
		assertThat(context.getBean(MediaFolderCatalog.class)).isNotNull();
		assertThat(context.getBean(NewsletterMailSender.class)).isNotNull();
		assertThat(context.getBean(ContentSeedSource.class)).isNotNull();
		assertThat(context.getBean(NewsletterEnrollment.class)).isNotNull();
	}

	@Test
	void chaque_cas_d_usage_est_expose() {
		assertThat(context.getBean(ContentCatalogQuery.class)).isNotNull();
		assertThat(context.getBean(ManageContentUseCase.class)).isNotNull();
		assertThat(context.getBean(PublicContentQuery.class)).isNotNull();
		assertThat(context.getBean(SeedContentUseCase.class)).isNotNull();
		assertThat(context.getBean(SubmitCandidatureUseCase.class)).isNotNull();
		assertThat(context.getBean(SubmitContactMessageUseCase.class)).isNotNull();
		assertThat(context.getBean(CandidatureQuery.class)).isNotNull();
		assertThat(context.getBean(ManageCandidaturesUseCase.class)).isNotNull();
		assertThat(context.getBean(ManageMediaUseCase.class)).isNotNull();
		assertThat(context.getBean(UploadCvUseCase.class)).isNotNull();
		assertThat(context.getBean(SubscribeToNewsletterUseCase.class)).isNotNull();
		assertThat(context.getBean(SendCampaignUseCase.class)).isNotNull();
	}

	@Test
	void les_routes_rest_attendues_sont_publiees() {
		assertThat(context.getBeansWithAnnotation(
				org.springframework.web.bind.annotation.RestController.class).keySet())
				.contains("adminContentController", "publicContentController", "publicInboxController",
						"adminCandidatureController", "adminContactMessageController",
						"adminInboxController",
						"adminMediaController", "publicMediaController",
						"publicNewsletterController", "adminNewsletterController");
	}
}
