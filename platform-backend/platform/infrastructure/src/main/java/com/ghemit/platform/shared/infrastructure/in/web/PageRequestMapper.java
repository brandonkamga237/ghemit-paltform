package com.ghemit.platform.shared.infrastructure.in.web;

import com.ghemit.platform.shared.domain.PageRequest;
import com.ghemit.platform.shared.domain.Sort;

/** Traduit les paramètres de pagination de l'API en objets du domaine. */
public final class PageRequestMapper {

	private static final String CREATED_AT = "createdAt";

	private PageRequestMapper() {
	}

	/** @param sort valeur du paramètre {@code sort} de l'API (« createdAt,asc », « program »…) */
	public static PageRequest from(int page, int size, String sort) {
		return PageRequest.of(page, size, sortOf(sort));
	}

	private static Sort sortOf(String sort) {
		return switch (sort == null ? "" : sort) {
			case "createdAt,asc" -> Sort.by(Sort.asc(CREATED_AT));
			case "program" -> Sort.by(Sort.asc("program"), Sort.desc(CREATED_AT));
			case "status" -> Sort.by(Sort.asc("status"), Sort.desc(CREATED_AT));
			default -> Sort.by(Sort.desc(CREATED_AT));
		};
	}
}
