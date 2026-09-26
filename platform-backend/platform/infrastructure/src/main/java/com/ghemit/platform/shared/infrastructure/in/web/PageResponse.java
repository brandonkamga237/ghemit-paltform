package com.ghemit.platform.shared.infrastructure.in.web;

import com.ghemit.platform.shared.domain.Page;
import java.util.List;
import java.util.function.Function;

/**
 * Enveloppe paginée renvoyée à l'admin. Elle reproduit les champs de
 * {@code Page<T>} de Spring Data consommés par le back office.
 */
public record PageResponse<T>(List<T> content, long totalElements, int totalPages, int number, int size) {

	public static <A, T> PageResponse<T> of(Page<A> page, Function<A, T> mapper) {
		return new PageResponse<>(page.content().stream().map(mapper).toList(),
				page.totalElements(), page.totalPages(), page.page(), page.size());
	}
}
