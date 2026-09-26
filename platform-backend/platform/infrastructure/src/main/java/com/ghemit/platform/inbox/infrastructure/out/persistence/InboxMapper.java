package com.ghemit.platform.inbox.infrastructure.out.persistence;

import com.ghemit.platform.inbox.domain.ApplicationForm;
import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureStatus;
import com.ghemit.platform.inbox.domain.ContactMessage;
import com.ghemit.platform.inbox.domain.ContactMessageId;
import com.ghemit.platform.inbox.domain.ProgramCode;
import com.ghemit.platform.shared.domain.EmailAddress;
import java.util.LinkedHashMap;

final class InboxMapper {

	private InboxMapper() {
	}

	static Candidature toDomain(CandidatureJpaEntity entity) {
		return Candidature.rehydrate(
				CandidatureId.of(entity.getId()),
				ProgramCode.of(entity.getProgram()),
				ApplicationForm.of(entity.getForm()),
				entity.isReadFlag(),
				CandidatureStatus.fromStoredCode(entity.getStatus()),
				entity.getNote(),
				entity.getCreatedAt());
	}

	static CandidatureJpaEntity toEntity(Candidature candidature) {
		CandidatureJpaEntity entity = new CandidatureJpaEntity();
		entity.setId(candidature.id().value());
		entity.setProgram(candidature.program().value());
		entity.setForm(new LinkedHashMap<>(candidature.form().asMap()));
		entity.setReadFlag(candidature.isRead());
		entity.setStatus(candidature.status().code());
		entity.setNote(candidature.note().orElse(null));
		entity.setCreatedAt(candidature.createdAt());
		return entity;
	}

	static ContactMessage toDomain(ContactMessageJpaEntity entity) {
		return ContactMessage.rehydrate(
				ContactMessageId.of(entity.getId()),
				entity.getName(),
				EmailAddress.of(entity.getEmail()),
				entity.getSubject(),
				entity.getMessage(),
				entity.isReadFlag(),
				entity.getCreatedAt());
	}

	static ContactMessageJpaEntity toEntity(ContactMessage message) {
		ContactMessageJpaEntity entity = new ContactMessageJpaEntity();
		entity.setId(message.id().value());
		entity.setName(message.name().orElse(null));
		entity.setEmail(message.email().value());
		entity.setSubject(message.subject().orElse(null));
		entity.setMessage(message.body());
		entity.setReadFlag(message.isRead());
		entity.setCreatedAt(message.createdAt());
		return entity;
	}
}
