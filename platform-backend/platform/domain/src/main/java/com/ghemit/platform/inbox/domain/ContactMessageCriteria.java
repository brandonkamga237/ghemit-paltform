package com.ghemit.platform.inbox.domain;

/** Critères de consultation des messages de contact par le back office. */
public record ContactMessageCriteria(Boolean read, String search) {

	public ContactMessageCriteria {
		search = search == null || search.isBlank() ? null : search.trim();
	}

	public static ContactMessageCriteria none() {
		return new ContactMessageCriteria(null, null);
	}

	public boolean hasSearch() {
		return search != null;
	}
}
