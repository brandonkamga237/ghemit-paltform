package com.ghemit.platform.inbox.application.port.in;

import java.time.LocalDate;
import java.util.List;

/** Courbe d'activité de la boîte de réception pour le tableau de bord. */
public interface InboxActivityQuery {

	/** Volume quotidien sur les {@code days} derniers jours, jours creux inclus (0). */
	List<DayActivity> activity(int days);

	record DayActivity(LocalDate day, long candidatures, long messages) {
	}
}
