package com.ghemit.platform.shared.domain;

import java.util.List;
import java.util.function.Function;

/** Tranche de résultats accompagnée du total, indépendante de toute technologie de persistance. */
public record Page<T>(List<T> content, long totalElements, int page, int size) {

	public Page {
		content = List.copyOf(content);
	}

	public static <T> Page<T> of(List<T> content, long totalElements, PageRequest request) {
		return new Page<>(content, totalElements, request.page(), request.size());
	}

	public int totalPages() {
		return size == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
	}

	public <R> Page<R> map(Function<? super T, ? extends R> mapper) {
		return new Page<>(content.stream().<R>map(mapper).toList(), totalElements, page, size);
	}
}
