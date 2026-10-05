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
				try {
					mailSender.send(subscriber.email(), campaign.subject(),
							template.render(campaign.body(), unsubscribeUrl(subscriber)));
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

	private String unsubscribeUrl(Subscriber subscriber) {
		return apiPublicUrl + "/api/public/newsletter/unsubscribe/"
				+ tokens.tokenFor(subscriber.email());
	}
}
