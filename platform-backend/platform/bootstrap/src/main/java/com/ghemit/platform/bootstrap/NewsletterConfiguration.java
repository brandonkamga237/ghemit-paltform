package com.ghemit.platform.bootstrap;

import com.ghemit.platform.newsletter.application.NewsletterService;
import com.ghemit.platform.newsletter.application.port.out.NewsletterMailSender;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Câblage du contexte « newsletter ». */
@Configuration
class NewsletterConfiguration {

	@Bean
	NewsletterService newsletterService(SubscriberRepository subscribers, CampaignRepository campaigns,
			NewsletterMailSender mailSender) {
		return new NewsletterService(subscribers, campaigns, mailSender);
	}
}
