package com.ghemit.platform.shared.infrastructure.out.persistence;

import com.ghemit.platform.shared.domain.Page;
import com.ghemit.platform.shared.domain.PageRequest;
import com.ghemit.platform.shared.domain.Sort;
import java.util.function.Function;
import org.springframework.data.domain.Sort.Order;

/** Traduction entre la pagination du domaine et celle de Spring Data. */
public final class Pageables {

	private Pageables() {
	}

	public static org.springframework.data.domain.PageRequest toSpring(PageRequest request) {
		return org.springframework.data.domain.PageRequest.of(request.page(), request.size(),
				toSpring(request.sort()));
	}

	public static <E, A> Page<A> toDomain(org.springframework.data.domain.Page<E> page,
			Function<E, A> mapper, PageRequest request) {
		return Page.of(page.getContent().stream().map(mapper).toList(), page.getTotalElements(), request);
	}

	private static org.springframework.data.domain.Sort toSpring(Sort sort) {
		return org.springframework.data.domain.Sort.by(sort.orders().stream()
				.map(order -> order.direction() == Sort.Direction.ASC
						? Order.asc(order.property())
						: Order.desc(order.property()))
				.toList());
	}
}
