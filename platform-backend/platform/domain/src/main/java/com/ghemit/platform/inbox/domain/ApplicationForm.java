package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
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

	/** Nombre maximal de champs d'un formulaire déposé. */
	public static final int MAX_FIELDS = 40;
	/** Longueur maximale d'un nom de champ. */
	public static final int MAX_KEY_LENGTH = 64;
	/** Longueur maximale d'une réponse texte. */
	public static final int MAX_TEXT_LENGTH = 5000;

	/** Reconstitution (stockage) : aucune limite n'est rejouée sur les données existantes. */
	public static ApplicationForm of(Map<String, Object> fields) {
		return fields == null || fields.isEmpty() ? EMPTY : new ApplicationForm(fields);
	}

	/**
	 * Formulaire envoyé depuis le site public : borné en nombre de champs et en
	 * longueur, réponses plates uniquement (texte, nombre, booléen). Protège la
	 * base contre un envoi volumineux ou malformé.
	 */
	public static ApplicationForm fromSubmission(Map<String, Object> fields) {
		if (fields == null || fields.isEmpty()) {
			return EMPTY;
		}
		if (fields.size() > MAX_FIELDS) {
			throw new BusinessRuleViolationException("Formulaire trop long (" + MAX_FIELDS + " champs au plus)");
		}
		fields.forEach((key, value) -> {
			if (key == null || key.isBlank() || key.length() > MAX_KEY_LENGTH) {
				throw new BusinessRuleViolationException("Nom de champ invalide");
			}
			if (value instanceof String text && text.length() > MAX_TEXT_LENGTH) {
				throw new BusinessRuleViolationException(
						"Réponse trop longue pour « " + key + " » (" + MAX_TEXT_LENGTH + " caractères au plus)");
			}
			if (value != null && !(value instanceof String || value instanceof Number || value instanceof Boolean)) {
				throw new BusinessRuleViolationException("Réponse non prise en charge pour « " + key + " »");
			}
		});
		return new ApplicationForm(fields);
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
