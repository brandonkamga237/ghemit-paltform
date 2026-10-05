package com.ghemit.platform.inbox.application;

import com.ghemit.platform.inbox.application.port.in.CandidatureQuery;
import com.ghemit.platform.inbox.application.port.in.CandidatureSummary;
import com.ghemit.platform.inbox.application.port.in.ManageCandidaturesUseCase;
import com.ghemit.platform.inbox.application.port.in.SubmitCandidatureCommand;
import com.ghemit.platform.inbox.application.port.in.SubmitCandidatureUseCase;
import com.ghemit.platform.inbox.application.port.in.UpdateCandidatureCommand;
import com.ghemit.platform.inbox.application.port.out.NewsletterEnrollment;
import com.ghemit.platform.inbox.domain.ApplicationForm;
import com.ghemit.platform.inbox.domain.Candidature;
import com.ghemit.platform.inbox.domain.CandidatureCriteria;
import com.ghemit.platform.inbox.domain.CandidatureId;
import com.ghemit.platform.inbox.domain.CandidatureRepository;
import com.ghemit.platform.inbox.domain.ProgramCode;
import com.ghemit.platform.shared.domain.EntityNotFoundException;
import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

/** Réception et traitement des candidatures aux programmes. */
public class CandidatureService
		implements SubmitCandidatureUseCase, CandidatureQuery, ManageCandidaturesUseCase {

	/** Préfixe de l'origine enregistrée sur l'abonné newsletter créé depuis une candidature. */
	private static final String ENROLLMENT_SOURCE_PREFIX = "candidature:";

	private final CandidatureRepository repository;
	private final NewsletterEnrollment newsletterEnrollment;

	public CandidatureService(CandidatureRepository repository, NewsletterEnrollment newsletterEnrollment) {
		this.repository = repository;
		this.newsletterEnrollment = newsletterEnrollment;
	}

	@Override
	@Transactional
	public Candidature submit(SubmitCandidatureCommand command) {
		ProgramCode program = ProgramCode.of(command.program());
		ApplicationForm form = ApplicationForm.of(command.form());
		Candidature saved = repository.save(Candidature.submit(program, form));
		form.candidateEmail().ifPresent(email -> newsletterEnrollment.enroll(
				email, form.candidateFullName().orElse(null), ENROLLMENT_SOURCE_PREFIX + program.value()));
		return saved;
	}

	@Override
	public Page<Candidature> search(CandidatureCriteria criteria, PageRequest pageRequest) {
		return repository.search(criteria, pageRequest);
	}

	@Override
	public CandidatureSummary summary() {
		Map<String, Long> byProgram = repository.countByProgram();
		long total = byProgram.values().stream().mapToLong(Long::longValue).sum();
		return new CandidatureSummary(total, repository.countUnread(), byProgram, repository.countByStatus());
	}

	@Override
	@Transactional
	public Candidature update(UpdateCandidatureCommand command) {
		Candidature candidature = require(command.id());
		if (command.read() != null) {
			candidature.changeReadFlag(command.read());
		}
		if (command.status() != null) {
			candidature.changeStatus(command.status());
		}
		if (command.noteProvided()) {
			candidature.annotate(command.note());
		}
		return repository.save(candidature);
	}

	@Override
	@Transactional
	public void delete(CandidatureId id) {
		repository.delete(require(id));
	}

	private Candidature require(CandidatureId id) {
		return repository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Candidature introuvable"));
	}
}
