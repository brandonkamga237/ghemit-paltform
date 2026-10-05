package com.ghemit.platform.newsletter.application;

import com.ghemit.platform.newsletter.application.port.in.DraftCampaignUseCase;
import com.ghemit.platform.newsletter.application.port.in.NewsletterQuery;
import com.ghemit.platform.newsletter.application.port.in.PreviewNewsletterUseCase;
import com.ghemit.platform.newsletter.application.port.in.RemoveSubscriberUseCase;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignCommand;
import com.ghemit.platform.newsletter.application.port.in.SendCampaignUseCase;
import com.ghemit.platform.newsletter.application.port.in.SubscribeCommand;
import com.ghemit.platform.newsletter.application.port.in.SubscribeToNewsletterUseCase;
import com.ghemit.platform.newsletter.application.port.in.UnsubscribeFromNewsletterUseCase;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

/** Cycle de vie des abonnements, des brouillons et de l'envoi des campagnes. */
public class NewsletterService implements SubscribeToNewsletterUseCase,
		UnsubscribeFromNewsletterUseCase, SendCampaignUseCase, DraftCampaignUseCase,
		RemoveSubscriberUseCase, PreviewNewsletterUseCase, NewsletterQuery {

	private final SubscriberRepository subscribers;
	private final CampaignRepository campaigns;
	private final CampaignDelivery delivery;
	private final NewsletterTemplate template;
	private final UnsubscribeTokens tokens;

	public NewsletterService(SubscriberRepository subscribers, CampaignRepository campaigns,
			CampaignDelivery delivery, NewsletterTemplate template, UnsubscribeTokens tokens) {
		this.subscribers = subscribers;
		this.campaigns = campaigns;
		this.delivery = delivery;
		this.template = template;
		this.tokens = tokens;
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
	public boolean unsubscribeToken(String token) {
		return tokens.verify(token)
				.map(email -> {
					unsubscribe(email.value());
					return true;
				})
				.orElse(false);
	}

	@Override
	@Transactional
	public Campaign send(SendCampaignCommand command) {
		Campaign campaign = campaigns.save(
				Campaign.draft(command.subject(), command.body(), audienceOf(command)));
		campaign.markSending();
		campaign = campaigns.save(campaign);
		delivery.start(campaign.id());
		return campaign;
	}

	@Override
	@Transactional
	public Campaign sendDraft(CampaignId id) {
		Campaign campaign = draft(id);
		campaign.markSending();
		campaign = campaigns.save(campaign);
		delivery.start(campaign.id());
		return campaign;
	}

	@Override
	@Transactional
	public Campaign saveDraft(SendCampaignCommand command) {
		return campaigns.save(Campaign.draft(command.subject(), command.body(), audienceOf(command)));
	}

	@Override
	@Transactional
	public Campaign updateDraft(CampaignId id, SendCampaignCommand command) {
		Campaign campaign = draft(id);
		campaign.edit(command.subject(), command.body(), audienceOf(command));
		return campaigns.save(campaign);
	}

	/** Origines ciblées ; nul/vide = tous les abonnés actifs. */
	private static java.util.Set<String> audienceOf(SendCampaignCommand command) {
		return command.audience() == null ? java.util.Set.of()
				: java.util.Set.copyOf(command.audience());
	}

	@Override
	@Transactional
	public void deleteDraft(CampaignId id) {
		Campaign campaign = draft(id);
		if (!campaign.isDraft()) {
			throw new BusinessRuleViolationException("Seul un brouillon peut être supprimé");
		}
		campaigns.delete(campaign);
	}

	@Override
	public String renderPreview(String body) {
		return template.render(body, "#");
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

	@Override
	public List<DayCount> subscriberActivity(int days) {
		int span = Math.min(Math.max(days, 1), 365);
		LocalDate first = LocalDate.now().minusDays(span - 1L);
		Map<LocalDate, Long> byDay = subscribers.countByDay(first);
		List<DayCount> series = new ArrayList<>(span);
		for (LocalDate day = first; !day.isAfter(LocalDate.now()); day = day.plusDays(1)) {
			series.add(new DayCount(day, byDay.getOrDefault(day, 0L)));
		}
		return series;
	}

	private Campaign draft(CampaignId id) {
		return campaigns.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Campagne introuvable"));
	}
}
