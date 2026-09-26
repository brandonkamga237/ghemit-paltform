package com.ghemit.platform.newsletter.domain;

import java.util.List;

/** Port de persistance de l'historique des campagnes. */
public interface CampaignRepository {

	Campaign save(Campaign campaign);

	List<Campaign> findAllNewestFirst();
}
