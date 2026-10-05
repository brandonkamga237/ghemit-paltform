package com.ghemit.platform.newsletter.application.port.in;

import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignId;

/** Envoi d'une campagne à tous les abonnés actifs, en tâche de fond. */
public interface SendCampaignUseCase {

	/** Crée la campagne et lance l'envoi. Retournée à l'état « envoi en cours ». */
	Campaign send(SendCampaignCommand command);

	/** Envoie un brouillon existant. */
	Campaign sendDraft(CampaignId id);
}
