package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.EmailAddress;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Réponses du candidat, de forme variable selon le programme. Le domaine sait en
 * extraire l'identité du candidat : c'est ce qui alimente l'inscription newsletter.
 */
public final class ApplicationForm {

	/** Champs dans lesquels la recherche texte du back office est effectuée. */
	public static final List<String> SEARCHABLE_FIELDS = List.of(
			"prenom", "nom", "email", "telephone", "phone", "organisation", "interlocuteur");

	private static final ApplicationForm EMPTY = new ApplicationForm(Map.of());

	private final Map<String, Object> fields;

	private ApplicationForm(Map<String, Object> fields) {
		this.fields = Collections.unmodifiableMap(new LinkedHashMap<>(fields));
	}

	public static ApplicationForm empty() {
		return EMPTY;
	}

	public static ApplicationForm of(Map<String, Object> fields) {
		return fields == null || fields.isEmpty() ? EMPTY : new ApplicationForm(fields);
	}

	public Map<String, Object> asMap() {
		return fields;
	}

	public Optional<String> text(String key) {
		return fields.get(key) instanceof String value && !value.isBlank()
				? Optional.of(value.trim())
				: Optional.empty();
	}

	/** Adresse du candidat si elle est exploitable ; une saisie invalide est simplement ignorée. */
	public Optional<EmailAddress> candidateEmail() {
		return text("email").flatMap(EmailAddress::tryOf);
	}

	public Optional<String> candidateFullName() {
		String fullName = (text("prenom").map(p -> p + " ").orElse("") + text("nom").orElse("")).trim();
		return fullName.isEmpty() ? Optional.empty() : Optional.of(fullName);
	}
}
