package com.ghemit.platform.newsletter.application.port.in;

import com.ghemit.platform.newsletter.domain.Campaign;

/** Envoi d'une campagne à tous les abonnés actifs. */
public interface SendCampaignUseCase {

	Campaign send(SendCampaignCommand command);
}
