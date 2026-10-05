package com.ghemit.platform.inbox.infrastructure.out.persistence;

import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureCriteria;
import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureRepository;
import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import com.ghemit.platform.shared.infrastructure.out.persistence.Pageables;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CandidatureRepositoryAdapter implements CandidatureRepository {

	private final CandidatureJpaRepository jpaRepository;

	@Override
	public Candidature save(Candidature candidature) {
		return InboxMapper.toDomain(jpaRepository.save(InboxMapper.toEntity(candidature)));
	}

	@Override
	public Optional<Candidature> findById(CandidatureId id) {
		return jpaRepository.findById(id.value()).map(InboxMapper::toDomain);
	}

	@Override
	public void delete(Candidature candidature) {
		jpaRepository.deleteById(candidature.id().value());
	}

	@Override
	public Page<Candidature> search(CandidatureCriteria criteria, PageRequest pageRequest) {
		return Pageables.toDomain(
				jpaRepository.findAll(InboxSpecifications.of(criteria), Pageables.toSpring(pageRequest)),
				InboxMapper::toDomain, pageRequest);
	}

	@Override
	public Map<String, Long> countByProgram() {
		return toMap(jpaRepository.countGroupedByProgram());
	}

	@Override
	public Map<String, Long> countByStatus() {
		return toMap(jpaRepository.countGroupedByStatus());
	}

	@Override
	public Map<String, Long> countNewByProgram() {
		return toMap(jpaRepository.countNewGroupedByProgram());
	}

	@Override
	public Map<LocalDate, Long> countByDay(LocalDate since) {
		return toDayMap(jpaRepository.countDailySince(since));
	}

	@Override
	public long countUnread() {
		return jpaRepository.countByReadFlagFalse();
	}

	private static Map<String, Long> toMap(List<Object[]> rows) {
		Map<String, Long> counts = new LinkedHashMap<>();
		rows.forEach(row -> counts.put(String.valueOf(row[0]), (Long) row[1]));
		return counts;
	}

	/** created_at::date arrive en java.sql.Date ; count(*) en long. */
	private static Map<LocalDate, Long> toDayMap(List<Object[]> rows) {
		Map<LocalDate, Long> counts = new LinkedHashMap<>();
		rows.forEach(row -> counts.put(LocalDate.parse(String.valueOf(row[0])),
				((Number) row[1]).longValue()));
		return counts;
	}
}
