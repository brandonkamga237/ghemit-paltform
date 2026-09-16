package com.ghemit.platform.newsletter;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterCampaignRepository extends JpaRepository<NewsletterCampaign, UUID> {
}
