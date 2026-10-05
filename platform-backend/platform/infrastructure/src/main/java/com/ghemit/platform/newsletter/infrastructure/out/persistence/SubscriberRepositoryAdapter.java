package com.ghemit.platform.newsletter.infrastructure.out.persistence;

import com.ghemit.platform.newsletter.domain.Subscriber;
import com.ghemit.platform.newsletter.domain.SubscriberId;
import com.ghemit.platform.newsletter.domain.SubscriberRepository;
import com.ghemit.platform.shared.domain.EmailAddress;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class SubscriberRepositoryAdapter implements SubscriberRepository {

	private final SubscriberJpaRepository jpaRepository;

	@Override
	public Subscriber save(Subscriber subscriber) {
		return NewsletterMapper.toDomain(jpaRepository.save(NewsletterMapper.toEntity(subscriber)));
	}

	@Override
	public Optional<Subscriber> findByEmail(EmailAddress email) {
		return jpaRepository.findByEmailIgnoreCase(email.value()).map(NewsletterMapper::toDomain);
	}

	@Override
	public Optional<Subscriber> findById(SubscriberId id) {
		return jpaRepository.findById(id.value()).map(NewsletterMapper::toDomain);
	}

	@Override
	public List<Subscriber> findAllActive() {
		return jpaRepository.findByActiveTrue().stream().map(NewsletterMapper::toDomain).toList();
	}

	@Override
	public List<Subscriber> findAllNewestFirst() {
		return jpaRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(NewsletterMapper::toDomain)
				.toList();
	}

	@Override
	public Map<LocalDate, Long> countByDay(LocalDate since) {
		Map<LocalDate, Long> counts = new LinkedHashMap<>();
		jpaRepository.countDailySince(since).forEach(row ->
				counts.put(LocalDate.parse(String.valueOf(row[0])), ((Number) row[1]).longValue()));
		return counts;
	}

	@Override
	public void delete(Subscriber subscriber) {
		jpaRepository.deleteById(subscriber.id().value());
	}
}
