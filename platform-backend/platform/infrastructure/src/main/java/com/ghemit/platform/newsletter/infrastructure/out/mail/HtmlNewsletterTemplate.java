package com.ghemit.platform.newsletter.infrastructure.out.mail;

import com.ghemit.platform.newsletter.application.port.out.NewsletterTemplate;
import org.springframework.stereotype.Component;

/**
 * Gabarit e-mail Gehmit : tableau 600 px compatible avec les clients mail,
 * en-tête vert à la marque, corps mis en forme (gras, italique, liens, listes),
 * pied de page avec coordonnées et lien de désinscription signé.
 */
@Component
public class HtmlNewsletterTemplate implements NewsletterTemplate {

	private static final String GREEN = "#15803d";
	private static final String NAVY = "#1e2d4a";
	private static final String MUTED = "#6b7280";
	private static final String SAND = "#f3efe7";

	@Override
	public String render(String body, String unsubscribeUrl) {
		return """
				<!DOCTYPE html>
				<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
				<body style="margin:0;padding:0;background:%s;">
				<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:%s;padding:24px 0;">
				<tr><td align="center">
				<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;">
					<tr><td style="background:%s;border-radius:10px 10px 0 0;padding:26px 32px;">
						<span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:2px;">GEHMIT</span>
						<span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#d3e8dc;letter-spacing:1px;">&nbsp;·&nbsp;Votre place dans le numérique</span>
					</td></tr>
					<tr><td style="background:#ffffff;padding:32px;font-family:Georgia,serif;font-size:16px;line-height:1.7;color:%s;">
						%s
					</td></tr>
					<tr><td style="background:%s;border-radius:0 0 10px 10px;padding:22px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:%s;">
						Gehmit — Douala, Cameroun · <a href="mailto:info.gehmit@gmail.com" style="color:%s;">info.gehmit@gmail.com</a><br>
						<a href="%s" style="color:%s;">Se désinscrire de la newsletter</a>
					</td></tr>
				</table>
				</td></tr>
				</table>
				</body></html>
				""".formatted(SAND, SAND, GREEN, NAVY, renderBody(body), SAND, MUTED, GREEN, unsubscribeUrl, GREEN);
	}

	/** Corps rédacteur → HTML : paragraphes, listes « - », gras/italique/liens. */
	private static String renderBody(String body) {
		StringBuilder html = new StringBuilder();
		for (String paragraph : body.split("\\n\\s*\\n")) {
			String block = paragraph.strip();
			if (block.isEmpty()) {
				continue;
			}
			String[] lines = block.split("\\n");
			boolean allList = true;
			for (String line : lines) {
				if (!line.strip().startsWith("- ")) {
					allList = false;
					break;
				}
			}
			if (allList) {
				html.append("<ul style=\"margin:0 0 18px;padding-left:22px;\">");
				for (String line : lines) {
					html.append("<li style=\"margin-bottom:6px;\">")
							.append(inline(line.strip().substring(2))).append("</li>");
				}
				html.append("</ul>");
			} else {
				html.append("<p style=\"margin:0 0 18px;\">").append(inline(block.replace("\n", "<br>")))
						.append("</p>");
			}
		}
		return html.toString();
	}

	/** Échappe le HTML puis applique **gras**, *italique* et [lien](url). */
	private static String inline(String text) {
		String escaped = escape(text);
		escaped = escaped.replaceAll("\\*\\*([^*]+)\\*\\*", "<strong>$1</strong>");
		escaped = escaped.replaceAll("\\*([^*]+)\\*", "<em>$1</em>");
		return escaped.replaceAll("\\[([^]]+)\\]\\((https?://[^)\\s]+|/[^)\\s]+)\\)",
				"<a href=\"$2\" style=\"color:" + GREEN + ";\">$1</a>");
	}

	private static String escape(String text) {
		return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
				.replace("\"", "&quot;");
	}
}
