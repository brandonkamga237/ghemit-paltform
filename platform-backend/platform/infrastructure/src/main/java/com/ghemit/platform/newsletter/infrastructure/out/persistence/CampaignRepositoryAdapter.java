package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import com.ghemit.platform.newsletter.domain.Campaign;
import com.ghemit.platform.newsletter.domain.CampaignRepository;
import java.util.List;
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
	public List<Campaign> findAllNewestFirst() {
		return jpaRepository.findAllByOrderBySentAtDesc().stream()
				.map(NewsletterMapper::toDomain)
				.toList();
	}
}
