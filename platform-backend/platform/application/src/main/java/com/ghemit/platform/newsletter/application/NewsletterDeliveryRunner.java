package com.ghemit.platform.newsletter.application;

import com.ghemit.platform.newsletter.application.port.out.MailDeliveryException;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.newsletter.application.port.out.NewsletterTemplate;
import com.ghemit.platform.newsletter.application.port.out.UnsubscribeTokens;
import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignId;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

/**
 * Envoi effectif d'une campagne : chaque abonné actif reçoit un e-mail habillé
 * avec son lien de désinscription signé. Un destinataire injoignable ne bloque
 * pas les suivants ; l'échec global marque la campagne « FAILED ».
 */
public class NewsletterDeliveryRunner {

	private final SubscriberRepository subscribers;
	private final CampaignRepository campaigns;
	private final NewsletterMailSender mailSender;
	private final NewsletterTemplate template;
	private final UnsubscribeTokens tokens;
	private final String apiPublicUrl;

	public NewsletterDeliveryRunner(SubscriberRepository subscribers, CampaignRepository campaigns,
			NewsletterMailSender mailSender, NewsletterTemplate template, UnsubscribeTokens tokens,
			String apiPublicUrl) {
		this.subscribers = subscribers;
		this.campaigns = campaigns;
		this.mailSender = mailSender;
		this.template = template;
		this.tokens = tokens;
		this.apiPublicUrl = apiPublicUrl;
	}

	@Transactional
	public void deliver(CampaignId id) {
		Campaign campaign = campaigns.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Campagne introuvable"));
		try {
			int delivered = 0;
			for (Subscriber subscriber : subscribers.findAllActive()) {
				if (!campaign.targets(subscriber)) {
					continue;
				}
				try {
					mailSender.send(subscriber.email(), campaign.subject(),
							template.render(personalize(campaign.body(), subscriber),
									unsubscribeUrl(subscriber)));
					delivered++;
				} catch (MailDeliveryException e) {
					// Destinataire injoignable : on continue avec les autres.
				}
			}
			campaign.markSent(delivered);
		} catch (RuntimeException e) {
			campaign.markFailed();
		}
		campaigns.save(campaign);
	}

	/**
	 * Variables de fusion : {{prenom}} (premier mot du nom), {{nom}} et
	 * {{email}}. Remplacées avant le rendu HTML — l'échappement du gabarit
	 * protège le résultat.
	 */
	private static String personalize(String body, Subscriber subscriber) {
		String fullName = subscriber.name().orElse("").trim();
		String firstName = fullName.contains(" ")
				? fullName.substring(0, fullName.indexOf(' ')).trim()
				: fullName;
		return body
				.replace("{{prenom}}", firstName)
				.replace("{{Prenom}}", firstName)
				.replace("{{nom}}", fullName)
				.replace("{{Nom}}", fullName)
				.replace("{{email}}", subscriber.email().value());
	}

	private String unsubscribeUrl(Subscriber subscriber) {
		return apiPublicUrl + "/api/public/newsletter/unsubscribe/"
				+ tokens.tokenFor(subscriber.email());
	}
}
