package com.ghemit.platform.inbox.infrastructure.in.web;

import com.ghemit.platform.inbox.application.port.in.InboxActivityQuery;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Indicateurs transverses de la boîte de réception (tableau de bord). */
@RestController
@RequestMapping("/api/admin/inbox")
@RequiredArgsConstructor
public class AdminInboxController {

	private final InboxActivityQuery activityQuery;

	@GetMapping("/activity")
	public List<DayActivityResponse> activity(@RequestParam(defaultValue = "30") int days) {
		return activityQuery.activity(days).stream()
				.map(d -> new DayActivityResponse(d.day(), d.candidatures(), d.messages()))
				.toList();
	}

	public record DayActivityResponse(LocalDate day, long candidatures, long messages) {
	}
}
