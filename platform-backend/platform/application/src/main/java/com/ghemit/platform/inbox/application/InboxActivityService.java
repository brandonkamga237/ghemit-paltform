package com.ghemit.platform.inbox.application;

import com.ghemit.platform.inbox.application.port.in.InboxActivityQuery;
import com.ghemit.platform.inbox.domain.CandidatureRepository;
import com.ghemit.platform.inbox.domain.ContactMessageRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Série temporelle des arrivées : candidatures et messages, jour par jour. */
public class InboxActivityService implements InboxActivityQuery {

	private static final int MAX_DAYS = 365;

	private final CandidatureRepository candidatures;
	private final ContactMessageRepository messages;

	public InboxActivityService(CandidatureRepository candidatures,
			ContactMessageRepository messages) {
		this.candidatures = candidatures;
		this.messages = messages;
	}

	@Override
	public List<DayActivity> activity(int days) {
		int span = Math.min(Math.max(days, 1), MAX_DAYS);
		LocalDate first = LocalDate.now().minusDays(span - 1L);
		Map<LocalDate, Long> byCandidature = candidatures.countByDay(first);
		Map<LocalDate, Long> byMessage = messages.countByDay(first);
		List<DayActivity> series = new ArrayList<>(span);
		for (LocalDate day = first; !day.isAfter(LocalDate.now()); day = day.plusDays(1)) {
			series.add(new DayActivity(day,
					byCandidature.getOrDefault(day, 0L),
					byMessage.getOrDefault(day, 0L)));
		}
		return series;
	}
}
