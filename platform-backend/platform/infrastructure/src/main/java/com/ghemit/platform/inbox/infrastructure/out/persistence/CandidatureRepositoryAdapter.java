package com.ghemit.platform.inbox.infrastructure.out.persistence;

import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureCriteria;
import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureRepository;
import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import com.ghemit.platform.shared.infrastructure.out.persistence.Pageables;
import java.util.List;
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
	public List<Candidature> findAll() {
		return jpaRepository.findAll().stream().map(InboxMapper::toDomain).toList();
	}
}
