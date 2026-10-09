package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.util.regex.Pattern;

/** Programme visé par une candidature (« paei », « mentorat »…). */
public record ProgramCode(String value) {

	public ProgramCode {
		if (value == null || value.isBlank()) {
			throw new BusinessRuleViolationException("Le programme est obligatoire");
		}
		value = value.trim();
	}

	/** Codes envoyés par le site : minuscules, chiffres, « - » et « : » (« caravanes-jeune »). */
	private static final Pattern SUBMITTED = Pattern.compile("[a-z0-9][a-z0-9:-]{0,63}");

	/** Reconstitution (stockage) : tolère les valeurs historiques. */
	public static ProgramCode of(String value) {
		return new ProgramCode(value);
	}

	/** Programme visé par une nouvelle candidature : format strict. */
	public static ProgramCode submitted(String value) {
		ProgramCode code = new ProgramCode(value);
		if (!SUBMITTED.matcher(code.value).matches()) {
			throw new BusinessRuleViolationException("Programme inconnu : " + code.value);
		}
		return code;
	}

	@Override
	public String toString() {
		return value;
	}
}
