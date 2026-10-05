package com.ghemit.platform.newsletter.application.port.in;

import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignId;

/** Brouillons de campagne : création, modification, suppression. */
public interface DraftCampaignUseCase {

	Campaign saveDraft(SendCampaignCommand command);

	Campaign updateDraft(CampaignId id, SendCampaignCommand command);

	void deleteDraft(CampaignId id);
}
