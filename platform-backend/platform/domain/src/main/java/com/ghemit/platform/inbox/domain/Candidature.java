package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

/** Agrégat racine : une candidature déposée depuis le site public. */
public final class Candidature {

	private final CandidatureId id;
	private final ProgramCode program;
	private final ApplicationForm form;
	private final Instant createdAt;
	private boolean read;
	private CandidatureStatus status;
	private String note;

	private Candidature(CandidatureId id, ProgramCode program, ApplicationForm form, boolean read,
			CandidatureStatus status, String note, Instant createdAt) {
		this.id = Objects.requireNonNull(id);
		this.program = Objects.requireNonNull(program, "Le programme est obligatoire");
		this.form = form == null ? ApplicationForm.empty() : form;
		this.read = read;
		this.status = Objects.requireNonNull(status);
		this.note = normalizeNote(note);
		this.createdAt = Objects.requireNonNull(createdAt);
	}

	public static Candidature submit(ProgramCode program, ApplicationForm form) {
		return new Candidature(CandidatureId.newId(), program, form, false,
				CandidatureStatus.NEW, null, Instant.now());
	}

	public static Candidature rehydrate(CandidatureId id, ProgramCode program, ApplicationForm form,
			boolean read, CandidatureStatus status, String note, Instant createdAt) {
		return new Candidature(id, program, form, read, status, note, createdAt);
	}

	public void markAsRead() {
		this.read = true;
	}

	public void changeReadFlag(boolean read) {
		this.read = read;
	}

	public void changeStatus(CandidatureStatus status) {
		Objects.requireNonNull(status, "Le statut est obligatoire");
		if (status != this.status && !this.status.canTransitionTo(status)) {
			throw new BusinessRuleViolationException(
					"Transition de statut impossible : " + this.status.code() + " → " + status.code());
		}
		this.status = status;
	}

	/** Note interne de l'équipe ; {@code null} l'effface. */
	public void annotate(String note) {
		this.note = normalizeNote(note);
	}

	private static String normalizeNote(String note) {
		if (note == null) {
			return null;
		}
		String trimmed = note.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public CandidatureId id() {
		return id;
	}

	public ProgramCode program() {
		return program;
	}

	public ApplicationForm form() {
		return form;
	}

	public boolean isRead() {
		return read;
	}

	public CandidatureStatus status() {
		return status;
	}

	public Optional<String> note() {
		return Optional.ofNullable(note);
	}

	public Instant createdAt() {
		return createdAt;
	}
}
