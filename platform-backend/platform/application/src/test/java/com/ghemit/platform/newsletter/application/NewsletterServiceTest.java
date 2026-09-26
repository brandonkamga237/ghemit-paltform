package com.ghemit.platform.newsletter.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.ghemit.platform.newsletter.application.port.in.SendCampaignCommand;
import com.ghemit.platform.newsletter.application.port.in.SubscribeCommand;
import com.ghemit.platform.newsletter.application.port.out.MailDeliveryException;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import com.ghemit.platform.shared.domain.EmailAddress;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * Les cas d'usage se testent sans Spring ni base de données : les ports sortants
 * sont remplacés par des doublures en mémoire.
 */
class NewsletterServiceTest {

	private final InMemorySubscribers subscribers = new InMemorySubscribers();
	private final InMemoryCampaigns campaigns = new InMemoryCampaigns();
	private final RecordingMailSender mailSender = new RecordingMailSender();
	private final NewsletterService service = new NewsletterService(subscribers, campaigns, mailSender);

	@Test
	void une_inscription_est_idempotente_sur_l_adresse() {
		service.subscribe(new SubscribeCommand("Awa@Gehmit.org", "Awa", "footer"));
		service.subscribe(new SubscribeCommand("awa@gehmit.org", null, "contact"));

		assertThat(subscribers.findAllActive()).hasSize(1);
	}

	@Test
	void une_reinscription_reactive_sans_perdre_le_nom_initial() {
		service.subscribe(new SubscribeCommand("awa@gehmit.org", "Awa", "footer"));
		service.unsubscribe("awa@gehmit.org");

		Subscriber subscriber = service.subscribe(new SubscribeCommand("awa@gehmit.org", "Autre", null));

		assertThat(subscriber.isActive()).isTrue();
		assertThat(subscriber.name()).contains("Awa");
	}

	@Test
	void une_desinscription_conserve_l_abonne_mais_le_desactive() {
		service.subscribe(new SubscribeCommand("awa@gehmit.org", null, null));

		service.unsubscribe("awa@gehmit.org");

		assertThat(subscribers.findAllActive()).isEmpty();
		assertThat(service.subscribers()).hasSize(1);
	}

	@Test
	void une_campagne_ne_compte_que_les_envois_aboutis() {
		service.subscribe(new SubscribeCommand("ok@gehmit.org", null, null));
		service.subscribe(new SubscribeCommand("ko@gehmit.org", null, null));
		mailSender.failFor("ko@gehmit.org");

		Campaign campaign = service.send(new SendCampaignCommand("Sujet", "Corps"));

		assertThat(campaign.recipientCount()).isEqualTo(1);
		assertThat(service.campaigns()).hasSize(1);
	}

	@Test
	void une_campagne_n_est_pas_envoyee_aux_desinscrits() {
		service.subscribe(new SubscribeCommand("parti@gehmit.org", null, null));
		service.unsubscribe("parti@gehmit.org");

		service.send(new SendCampaignCommand("Sujet", "Corps"));

		assertThat(mailSender.sentTo).isEmpty();
	}

	private static final class InMemorySubscribers implements SubscriberRepository {

		private final Map<SubscriberId, Subscriber> store = new LinkedHashMap<>();

		@Override
		public Subscriber save(Subscriber subscriber) {
			store.put(subscriber.id(), subscriber);
			return subscriber;
		}

		@Override
		public Optional<Subscriber> findByEmail(EmailAddress email) {
			return store.values().stream().filter(s -> s.email().equals(email)).findFirst();
		}

		@Override
		public Optional<Subscriber> findById(SubscriberId id) {
			return Optional.ofNullable(store.get(id));
		}

		@Override
		public List<Subscriber> findAllActive() {
			return store.values().stream().filter(Subscriber::isActive).toList();
		}

		@Override
		public List<Subscriber> findAllNewestFirst() {
			return store.values().stream()
					.sorted(Comparator.comparing(Subscriber::createdAt).reversed())
					.toList();
		}

		@Override
		public void delete(Subscriber subscriber) {
			store.remove(subscriber.id());
		}
	}

	private static final class InMemoryCampaigns implements CampaignRepository {

		private final List<Campaign> store = new ArrayList<>();

		@Override
		public Campaign save(Campaign campaign) {
			store.add(campaign);
			return campaign;
		}

		@Override
		public List<Campaign> findAllNewestFirst() {
			return List.copyOf(store);
		}
	}

	private static final class RecordingMailSender implements NewsletterMailSender {

		private final List<String> sentTo = new ArrayList<>();
		private final List<String> failing = new ArrayList<>();

		void failFor(String email) {
			failing.add(email);
		}

		@Override
		public void send(EmailAddress recipient, String subject, String body) {
			if (failing.contains(recipient.value())) {
				throw new MailDeliveryException("injoignable", null);
			}
			sentTo.add(recipient.value());
		}
	}
}
