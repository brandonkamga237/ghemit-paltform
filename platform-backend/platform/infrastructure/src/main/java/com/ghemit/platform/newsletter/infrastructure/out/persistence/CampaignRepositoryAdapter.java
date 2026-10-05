package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignId;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CampaignRepositoryAdapter implements CampaignRepository {

	private final CampaignJpaRepository jpaRepository;

	@Override
	public Campaign save(Campaign campaign) {
		return NewsletterMapper.toDomain(jpaRepository.save(NewsletterMapper.toEntity(campaign)));
	}

	@Override
	public Optional<Campaign> findById(CampaignId id) {
		return jpaRepository.findById(id.value()).map(NewsletterMapper::toDomain);
	}

	@Override
	public List<Campaign> findAllNewestFirst() {
		return jpaRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(NewsletterMapper::toDomain)
				.toList();
	}

	@Override
	public void delete(Campaign campaign) {
		jpaRepository.deleteById(campaign.id().value());
	}
}
