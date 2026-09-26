package com.ghemit.platform.shared.domain;

/** Demande de pagination. La taille est bornée ici, c'est une règle de protection du service. */
public record PageRequest(int page, int size, Sort sort) {

	public static final int MAX_SIZE = 100;

	public PageRequest {
		page = Math.max(0, page);
		size = Math.clamp(size, 1, MAX_SIZE);
		if (sort == null) {
			throw new BusinessRuleViolationException("Un ordre de tri est requis");
		}
	}

	public static PageRequest of(int page, int size, Sort sort) {
		return new PageRequest(page, size, sort);
	}

	public int offset() {
		return page * size;
	}
}
