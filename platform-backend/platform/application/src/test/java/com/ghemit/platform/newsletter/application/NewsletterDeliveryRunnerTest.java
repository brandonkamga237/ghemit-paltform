package com.ghemit.platform.newsletter.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.ghemit.platform.newsletter.application.port.out.MailDeliveryException;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignId;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import com.ghemit.platform.shared.domain.EmailAddress;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/** Envoi effectif : chaque actif est servi, les échecs unitaires ne bloquent pas. */
class NewsletterDeliveryRunnerTest {

	private final Map<SubscriberId, Subscriber> subscribers = new LinkedHashMap<>();
	private Campaign campaign = Campaign.draft("Objet", "Corps", java.util.Set.of());

	private final List<String> delivered = new ArrayList<>();
	private final List<String> failing = new ArrayList<>();

	private final NewsletterDeliveryRunner runner = new NewsletterDeliveryRunner(
			new SubscriberRepository() {
				public Subscriber save(Subscriber s) { subscribers.put(s.id(), s); return s; }
				public Optional<Subscriber> findByEmail(EmailAddress e) { return Optional.empty(); }
				public Optional<Subscriber> findById(SubscriberId id) { return Optional.ofNullable(subscribers.get(id)); }
				public List<Subscriber> findAllActive() {
					return subscribers.values().stream().filter(Subscriber::isActive).toList();
				}
				public List<Subscriber> findAllNewestFirst() { return List.copyOf(subscribers.values()); }
				public Map<java.time.LocalDate, Long> countByDay(java.time.LocalDate since) {
					return Map.of();
				}
				public void delete(Subscriber s) { subscribers.remove(s.id()); }
			},
			new CampaignRepository() {
				public Campaign save(Campaign c) { campaign = c; return c; }
				public Optional<Campaign> findById(CampaignId id) { return Optional.of(campaign); }
				public List<Campaign> findAllNewestFirst() { return List.of(campaign); }
				public void delete(Campaign c) { }
			},
			new NewsletterMailSender() {
				public void send(EmailAddress recipient, String subject, String htmlBody) {
					if (failing.contains(recipient.value())) {
						throw new MailDeliveryException("injoignable", null);
					}
					delivered.add(recipient.value());
				}
			},
			(body, url) -> "<html>" + body + "|" + url + "</html>",
			new com.ghemit.platform.newsletter.application.port.out.UnsubscribeTokens() {
				public String tokenFor(EmailAddress email) { return "t:" + email.value(); }
				public Optional<EmailAddress> verify(String token) { return Optional.empty(); }
			},
			"https://api.gehmit.org");

	private Subscriber subscribe(String email, boolean active) {
		Subscriber s = Subscriber.rehydrate(SubscriberId.newId(), EmailAddress.of(email), null, null,
				active, java.time.Instant.now());
		subscribers.put(s.id(), s);
		return s;
	}

	@Test
	void livre_tous_les_actifs_et_compte_les_echecs() {
		subscribe("a@gehmit.org", true);
		subscribe("b@gehmit.org", true);
		subscribe("parti@gehmit.org", false);
		failing.add("b@gehmit.org");
		campaign.markSending();

		runner.deliver(campaign.id());

		assertThat(delivered).containsExactly("a@gehmit.org");
		assertThat(campaign.status()).isEqualTo(Campaign.Status.SENT);
		assertThat(campaign.recipientCount()).isEqualTo(1);
		assertThat(campaign.sentAt()).isNotNull();
	}
}
