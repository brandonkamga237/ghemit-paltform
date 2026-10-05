package com.ghemit.platform.bootstrap;

import com.ghemit.platform.newsletter.application.NewsletterDeliveryRunner;
import com.ghemit.platform.newsletter.application.NewsletterService;
import com.ghemit.platform.newsletter.application.port.out.CampaignDelivery;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.newsletter.application.port.out.NewsletterTemplate;
import com.ghemit.platform.newsletter.application.port.out.UnsubscribeTokens;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Câblage du contexte « newsletter ». */
@Configuration
class NewsletterConfiguration {

	@Bean
	NewsletterService newsletterService(SubscriberRepository subscribers, CampaignRepository campaigns,
			CampaignDelivery delivery, NewsletterTemplate template, UnsubscribeTokens tokens) {
		return new NewsletterService(subscribers, campaigns, delivery, template, tokens);
	}

	@Bean
	NewsletterDeliveryRunner newsletterDeliveryRunner(SubscriberRepository subscribers,
			CampaignRepository campaigns, NewsletterMailSender mailSender, NewsletterTemplate template,
			UnsubscribeTokens tokens, @Value("${app.api.public-url}") String apiPublicUrl) {
		return new NewsletterDeliveryRunner(subscribers, campaigns, mailSender, template, tokens,
				apiPublicUrl);
	}
}
