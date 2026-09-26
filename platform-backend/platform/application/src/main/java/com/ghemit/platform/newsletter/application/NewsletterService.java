package com.ghemit.platform.newsletter.application;

import com.ghemit.platform.newsletter.application.port.in.NewsletterQuery;
import com.ghemit.platform.newsletter.application.port.in.RemoveSubscriberUseCase;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignCommand;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignUseCase;
import com.ghemit.platform.newsletter.application.port.in.SubscribeCommand;
import com.ghemit.platform.newsletter.application.port.in.SubscribeToNewsletterUseCase;
import com.ghemit.platform.newsletter.application.port.in.UnsubscribeFromNewsletterUseCase;
import com.ghemit.platform.newsletter.application.port.out.MailDeliveryException;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import com.ghemit.platform.shared.domain.EmailAddress;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

/** Cycle de vie des abonnements et envoi des campagnes. */
public class NewsletterService implements SubscribeToNewsletterUseCase,
		UnsubscribeFromNewsletterUseCase, SendCampaignUseCase, RemoveSubscriberUseCase, NewsletterQuery {

	private final SubscriberRepository subscribers;
	private final CampaignRepository campaigns;
	private final NewsletterMailSender mailSender;

	public NewsletterService(SubscriberRepository subscribers, CampaignRepository campaigns,
			NewsletterMailSender mailSender) {
		this.subscribers = subscribers;
		this.campaigns = campaigns;
		this.mailSender = mailSender;
	}

	@Override
	@Transactional
	public Subscriber subscribe(SubscribeCommand command) {
		EmailAddress email = EmailAddress.of(command.email());
		Subscriber subscriber = subscribers.findByEmail(email)
				.map(existing -> {
					existing.resubscribe(command.name(), command.source());
					return existing;
				})
				.orElseGet(() -> Subscriber.subscribe(email, command.name(), command.source()));
		return subscribers.save(subscriber);
	}

	@Override
	@Transactional
	public void unsubscribe(String email) {
		EmailAddress.tryOf(email)
				.flatMap(subscribers::findByEmail)
				.ifPresent(subscriber -> {
					subscriber.unsubscribe();
					subscribers.save(subscriber);
				});
	}

	@Override
	@Transactional
	public Campaign send(SendCampaignCommand command) {
		int delivered = 0;
		for (Subscriber subscriber : subscribers.findAllActive()) {
			try {
				mailSender.send(subscriber.email(), command.subject(), command.body());
				delivered++;
			} catch (MailDeliveryException e) {
				// Un destinataire injoignable ne doit pas interrompre la campagne.
			}
		}
		return campaigns.save(Campaign.sent(command.subject(), command.body(), delivered));
	}

	@Override
	@Transactional
	public void remove(SubscriberId id) {
		Subscriber subscriber = subscribers.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Abonné introuvable"));
		subscribers.delete(subscriber);
	}

	@Override
	public List<Subscriber> subscribers() {
		return subscribers.findAllNewestFirst();
	}

	@Override
	public List<Campaign> campaigns() {
		return campaigns.findAllNewestFirst();
	}
}
