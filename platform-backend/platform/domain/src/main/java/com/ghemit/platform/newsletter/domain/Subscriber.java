package com.ghemit.platform.newsletter.domain;

import com.ghemit.platform.shared.domain.EmailAddress;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

/**
 * Agrégat racine : un abonné à la newsletter. L'adresse e-mail est l'identité
 * métier, d'où sa normalisation par {@link EmailAddress}.
 */
public final class Subscriber {

	private final SubscriberId id;
	private final EmailAddress email;
	private final Instant createdAt;
	private String name;
	private String source;
	private boolean active;

	private Subscriber(SubscriberId id, EmailAddress email, String name, String source,
			boolean active, Instant createdAt) {
		this.id = Objects.requireNonNull(id);
		this.email = Objects.requireNonNull(email, "L'adresse e-mail est obligatoire");
		this.name = blankToNull(name);
		this.source = blankToNull(source);
		this.active = active;
		this.createdAt = Objects.requireNonNull(createdAt);
	}

	/**
	 * @param source origine de l'inscription (« contact », « candidature:paei »…),
	 *               conservée pour savoir d'où vient chaque abonné.
	 */
	public static Subscriber subscribe(EmailAddress email, String name, String source) {
		return new Subscriber(SubscriberId.newId(), email, name, source, true, Instant.now());
	}

	public static Subscriber rehydrate(SubscriberId id, EmailAddress email, String name, String source,
			boolean active, Instant createdAt) {
		return new Subscriber(id, email, name, source, active, createdAt);
	}

	/**
	 * Nouvelle inscription d'une adresse déjà connue : on réactive l'abonné et on
	 * complète les informations manquantes sans écraser celles déjà renseignées.
	 */
	public void resubscribe(String name, String source) {
		this.active = true;
		String candidateName = blankToNull(name);
		if (candidateName != null && this.name == null) {
			this.name = candidateName;
		}
		String candidateSource = blankToNull(source);
		if (candidateSource != null && this.source == null) {
			this.source = candidateSource;
		}
	}

	public void unsubscribe() {
		this.active = false;
	}

	private static String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public SubscriberId id() {
		return id;
	}

	public EmailAddress email() {
		return email;
	}

	public Optional<String> name() {
		return Optional.ofNullable(name);
	}

	public Optional<String> source() {
		return Optional.ofNullable(source);
	}

	public boolean isActive() {
		return active;
	}

	public Instant createdAt() {
		return createdAt;
	}
}
