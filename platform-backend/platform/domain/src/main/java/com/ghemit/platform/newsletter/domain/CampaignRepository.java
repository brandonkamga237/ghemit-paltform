package com.ghemit.platform.newsletter.domain;

import java.util.List;
import java.util.Optional;

/** Port de persistance des campagnes (brouillons et historique d'envois). */
public interface CampaignRepository {

	Campaign save(Campaign campaign);

	Optional<Campaign> findById(CampaignId id);

	List<Campaign> findAllNewestFirst();

	void delete(Campaign campaign);
}
