package com.ghemit.platform.shared.domain;

/** Une invariante métier est violée par la donnée reçue. */
public class BusinessRuleViolationException extends DomainException {

	public BusinessRuleViolationException(String message) {
		super(message);
	}
}
