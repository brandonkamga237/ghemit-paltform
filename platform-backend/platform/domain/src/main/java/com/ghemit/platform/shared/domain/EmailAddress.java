package com.ghemit.platform.shared.domain;

import java.util.Locale;
import java.util.Optional;

/**
 * Adresse e-mail normalisée (minuscules, sans espaces superflus). La normalisation
 * appartient au domaine : c'est elle qui garantit l'unicité d'un abonné newsletter.
 */
public record EmailAddress(String value) {

	public EmailAddress {
		if (value == null || value.isBlank()) {
			throw new BusinessRuleViolationException("L'adresse e-mail est obligatoire");
		}
		value = value.trim().toLowerCase(Locale.ROOT);
		int at = value.indexOf('@');
		if (at <= 0 || at != value.lastIndexOf('@') || at == value.length() - 1
				|| value.chars().anyMatch(Character::isWhitespace)) {
			throw new BusinessRuleViolationException("Adresse e-mail invalide : " + value);
		}
	}

	public static EmailAddress of(String raw) {
		return new EmailAddress(raw);
	}

	/** Variante tolérante, pour les saisies libres où une adresse invalide doit être ignorée. */
	public static Optional<EmailAddress> tryOf(String raw) {
		try {
			return Optional.of(new EmailAddress(raw));
		} catch (BusinessRuleViolationException e) {
			return Optional.empty();
		}
	}

	@Override
	public String toString() {
		return value;
	}
}
