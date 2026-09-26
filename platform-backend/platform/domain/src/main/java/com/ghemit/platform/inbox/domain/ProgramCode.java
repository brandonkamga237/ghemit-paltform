package com.ghemit.platform.inbox.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;

/** Programme visé par une candidature (« paei », « mentorat »…). */
public record ProgramCode(String value) {

	public ProgramCode {
		if (value == null || value.isBlank()) {
			throw new BusinessRuleViolationException("Le programme est obligatoire");
		}
		value = value.trim();
	}

	public static ProgramCode of(String value) {
		return new ProgramCode(value);
	}

	@Override
	public String toString() {
		return value;
	}
}
