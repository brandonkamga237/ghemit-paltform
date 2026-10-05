package com.ghemit.platform.newsletter.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ghemit.platform.newsletter.application.port.in.SendCampaignCommand;
import com.ghemit.platform.newsletter.application.port.in.SubscribeCommand;
import com.ghemit.platform.newsletter.application.port.out.CampaignDelivery;
import com.ghemit.platform.newsletter.application.port.out.NewsletterTemplate;
import com.ghemit.platform.newsletter.application.port.out.UnsubscribeTokens;
import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignId;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import com.ghemit.platform.shared.domain.EmailAddress;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
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
	private final RecordingDelivery delivery = new RecordingDelivery();
	private final NewsletterService service = new NewsletterService(subscribers, campaigns, delivery,
			(body, url) -> "<html>" + body + "</html>",
			new EchoTokens());

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
	void un_lien_de_desinscription_signe_desinscrit_le_bon_abonne() {
		service.subscribe(new SubscribeCommand("awa@gehmit.org", null, null));

		boolean ok = service.unsubscribeToken(EchoTokens.TOKEN_PREFIX + "awa@gehmit.org");

		assertThat(ok).isTrue();
		assertThat(subscribers.findAllActive()).isEmpty();
		assertThat(service.unsubscribeToken("faux-jeton")).isFalse();
	}

	@Test
	void l_envoi_direct_cree_la_campagne_puis_la_marque_en_cours() {
		Campaign campaign = service.send(new SendCampaignCommand("Sujet", "Corps", null));

		assertThat(campaign.status()).isEqualTo(Campaign.Status.SENDING);
		assertThat(delivery.started).containsExactly(campaign.id());
	}

	@Test
	void le_cycle_brouillon_modification_envoi() {
		Campaign draft = service.saveDraft(new SendCampaignCommand("Sujet", "Corps", null));
		assertThat(draft.status()).isEqualTo(Campaign.Status.DRAFT);

		service.updateDraft(draft.id(), new SendCampaignCommand("Sujet 2", "Corps 2", null));
		assertThat(campaigns.findById(draft.id()).orElseThrow().subject()).isEqualTo("Sujet 2");

		Campaign sent = service.sendDraft(draft.id());
		assertThat(sent.status()).isEqualTo(Campaign.Status.SENDING);
		assertThat(delivery.started).containsExactly(draft.id());
	}

	@Test
	void un_brouillon_envoye_ne_peut_plus_etre_modifie_ni_supprime() {
		Campaign draft = service.saveDraft(new SendCampaignCommand("Sujet", "Corps", null));
		service.sendDraft(draft.id());

		assertThatThrownBy(() -> service.updateDraft(draft.id(), new SendCampaignCommand("a", "b", null)))
				.isInstanceOf(BusinessRuleViolationException.class);
		assertThatThrownBy(() -> service.deleteDraft(draft.id()))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	@Test
	void agit_sur_un_brouillon_inconnu_renvoie_une_erreur_metier() {
		CampaignId inconnu = CampaignId.newId();
		assertThatThrownBy(() -> service.sendDraft(inconnu))
				.isInstanceOf(EntityNotFoundException.class);
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
		public Map<java.time.LocalDate, Long> countByDay(java.time.LocalDate since) {
			return java.util.Map.of();
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
			store.removeIf(c -> c.id().equals(campaign.id()));
			store.add(campaign);
			return campaign;
		}

		@Override
		public Optional<Campaign> findById(CampaignId id) {
			return store.stream().filter(c -> c.id().equals(id)).findFirst();
		}

		@Override
		public List<Campaign> findAllNewestFirst() {
			return List.copyOf(store);
		}

		@Override
		public void delete(Campaign campaign) {
			store.removeIf(c -> c.id().equals(campaign.id()));
		}
	}

	private static final class RecordingDelivery implements CampaignDelivery {

		private final List<CampaignId> started = new ArrayList<>();

		@Override
		public void start(CampaignId campaignId) {
			started.add(campaignId);
		}
	}

	/** Jeton factice : préfixe fixe + adresse, vérifiable sans cryptographie. */
	private static final class EchoTokens implements UnsubscribeTokens {

		private static final String TOKEN_PREFIX = "token:";

		@Override
		public String tokenFor(EmailAddress email) {
			return TOKEN_PREFIX + email.value();
		}

		@Override
		public Optional<EmailAddress> verify(String token) {
			return token != null && token.startsWith(TOKEN_PREFIX)
					? EmailAddress.tryOf(token.substring(TOKEN_PREFIX.length()))
					: Optional.empty();
		}
	}
}
