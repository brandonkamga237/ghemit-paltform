package com.ghemit.platform.shared.domain;

import java.util.Arrays;
import java.util.List;

/** Ordre de tri exprimé sur les propriétés du domaine, sans dépendance à Spring Data. */
public record Sort(List<Order> orders) {

	public enum Direction { ASC, DESC }

	public record Order(String property, Direction direction) {}

	public Sort {
		orders = List.copyOf(orders);
	}

	public static Sort by(Order... orders) {
		return new Sort(Arrays.asList(orders));
	}

	public static Order asc(String property) {
		return new Order(property, Direction.ASC);
	}

	public static Order desc(String property) {
		return new Order(property, Direction.DESC);
	}
}
