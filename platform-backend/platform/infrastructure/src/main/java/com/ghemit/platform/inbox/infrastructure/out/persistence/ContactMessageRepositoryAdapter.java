package com.ghemit.platform.inbox.infrastructure.out.persistence;

import com.ghemit.platform.inbox.domain.ContactMessage;
import com.ghemit.platform.inbox.domain.ContactMessageCriteria;
import com.ghemit.platform.inbox.domain.ContactMessageId;
import com.ghemit.platform.inbox.domain.ContactMessageRepository;
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
public class ContactMessageRepositoryAdapter implements ContactMessageRepository {

	private final ContactMessageJpaRepository jpaRepository;

	@Override
	public ContactMessage save(ContactMessage message) {
		return InboxMapper.toDomain(jpaRepository.save(InboxMapper.toEntity(message)));
	}

	@Override
	public Optional<ContactMessage> findById(ContactMessageId id) {
		return jpaRepository.findById(id.value()).map(InboxMapper::toDomain);
	}

	@Override
	public void delete(ContactMessage message) {
		jpaRepository.deleteById(message.id().value());
	}

	@Override
	public Page<ContactMessage> search(ContactMessageCriteria criteria, PageRequest pageRequest) {
		return Pageables.toDomain(
				jpaRepository.findAll(InboxSpecifications.of(criteria), Pageables.toSpring(pageRequest)),
				InboxMapper::toDomain, pageRequest);
	}

	@Override
	public List<ContactMessage> findAll() {
		return jpaRepository.findAll().stream().map(InboxMapper::toDomain).toList();
	}

	@Override
	public Map<LocalDate, Long> countByDay(LocalDate since) {
		Map<LocalDate, Long> counts = new LinkedHashMap<>();
		jpaRepository.countDailySince(since).forEach(row ->
				counts.put(LocalDate.parse(String.valueOf(row[0])), ((Number) row[1]).longValue()));
		return counts;
	}
}
