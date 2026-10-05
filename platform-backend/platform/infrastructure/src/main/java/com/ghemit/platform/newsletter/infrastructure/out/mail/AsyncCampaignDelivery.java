package com.ghemit.platform.newsletter.infrastructure.out.mail;

import com.ghemit.platform.newsletter.application.NewsletterDeliveryRunner;
import com.ghemit.platform.newsletter.application.port.out.CampaignDelivery;
import com.ghemit.platform.newsletter.domain.CampaignId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/** Relais asynchrone : l'envoi SMTP ne bloque jamais la requête HTTP. */
@Slf4j
@Component
@RequiredArgsConstructor
public class AsyncCampaignDelivery implements CampaignDelivery {

	private final NewsletterDeliveryRunner runner;

	@Async
	@Override
	public void start(CampaignId campaignId) {
		try {
			runner.deliver(campaignId);
		} catch (Exception e) {
			log.error("Envoi de la campagne {} interrompu : {}", campaignId.value(), e.getMessage());
		}
	}
}
