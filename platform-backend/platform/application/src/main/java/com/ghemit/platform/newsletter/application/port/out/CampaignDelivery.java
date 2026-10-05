package com.ghemit.platform.newsletter.application.port.out;

import com.ghemit.platform.newsletter.domain.CampaignId;

/** Lance l'envoi d'une campagne en tâche de fond (l'appelant retourne aussitôt). */
public interface CampaignDelivery {

	void start(CampaignId campaignId);
}
