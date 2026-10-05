package com.ghemit.platform.newsletter.infrastructure.out.mail;

import com.ghemit.platform.newsletter.application.port.out.NewsletterTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Gabarit e-mail Gehmit : tableau 600 px compatible avec les clients mail,
 * logo de marque en en-tête, corps mis en forme (titres « ## », gras,
 * italique, liens, listes, boutons « [[Libellé]](url) », séparateurs « --- »),
 * signature de l'équipe et pied de page avec coordonnées et lien de
 * désinscription signé.
 */
@Component
public class HtmlNewsletterTemplate implements NewsletterTemplate {

	private static final String GREEN = "#15803d";
	private static final String GREEN_DARK = "#116632";
	private static final String NAVY = "#1e2d4a";
	private static final String MUTED = "#6b7280";
	private static final String FAINT = "#9ca3af";
	private static final String SAND = "#f3efe7";
	private static final String BORDER = "#e8e2d9";

	private final String siteUrl;

	public HtmlNewsletterTemplate(@Value("${app.site.public-url}") String siteUrl) {
		this.siteUrl = siteUrl;
	}

	@Override
	public String render(String body, String unsubscribeUrl) {
		String logo = siteUrl + "/logo-email.png";
		return """
				<!DOCTYPE html>
				<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
				<title>Gehmit</title></head>
				<body style="margin:0;padding:0;background:%s;">
				<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:%s;padding:28px 12px;">
				<tr><td align="center">
				<table role="presentation" width="600" cellpadding="0" cellspacing="0"
						style="max-width:600px;width:100%%;border-radius:14px;overflow:hidden;border:1px solid %s;">

					<!-- En-tête -->
					<tr><td align="center" style="background:#ffffff;padding:30px 32px 22px;border-bottom:1px solid %s;">
						<img src="%s" alt="Gehmit" width="132" style="display:block;height:auto;">
						<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:%s;letter-spacing:1.2px;margin-top:10px;">
							VOTRE PLACE DANS LE NUMÉRIQUE
						</div>
					</td></tr>

					<!-- Corps -->
					<tr><td style="background:#ffffff;padding:8px 36px 30px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.75;color:%s;">
						%s
					</td></tr>

					<!-- Signature -->
					<tr><td style="background:#ffffff;padding:0 36px 30px;">
						<table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
							<tr><td style="border-top:1px solid %s;padding-top:20px;font-family:Georgia,serif;font-size:15px;color:%s;">
								À bientôt,<br>
								<span style="font-weight:bold;color:%s;">L'équipe Gehmit</span>
							</td></tr>
						</table>
					</td></tr>

					<!-- Pied de page -->
					<tr><td style="background:%s;padding:26px 36px;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.7;color:#d3dbe8;">
						<table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
							<tr><td style="padding-bottom:14px;">
								<span style="font-weight:bold;color:#ffffff;letter-spacing:1.5px;">GEHMIT</span>
								<span style="color:%s;"> — Votre place dans le numérique</span>
							</td></tr>
							<tr><td>
								<a href="mailto:info.gehmit@gmail.com" style="color:#ffffff;text-decoration:none;">info.gehmit@gmail.com</a>
								&nbsp;·&nbsp;
								<a href="tel:+237671130266" style="color:#ffffff;text-decoration:none;">+237 671 13 02 66</a>
								&nbsp;·&nbsp;Douala, Cameroun
							</td></tr>
							<tr><td style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.18);padding-top:14px;font-size:11.5px;color:%s;">
								Vous recevez cet e-mail car vous êtes inscrit à la newsletter de Gehmit.
								<a href="%s" style="color:#ffffff;">Se désinscrire</a>
							</td></tr>
						</table>
					</td></tr>
				</table>
				</td></tr>
				</table>
				</body></html>
				""".formatted(SAND, SAND, BORDER, BORDER, logo, FAINT, NAVY, renderBody(body),
				BORDER, NAVY, GREEN_DARK, NAVY, FAINT, MUTED, unsubscribeUrl);
	}

	/**
	 * Corps rédacteur → HTML : « ## titre », « --- », « [[bouton]](url) »,
	 * listes « - », paragraphes avec **gras**, *italique* et [lien](url).
	 */
	private static String renderBody(String body) {
		StringBuilder html = new StringBuilder();
		for (String paragraph : body.split("\\n\\s*\\n")) {
			String block = paragraph.strip();
			if (block.isEmpty()) {
				continue;
			}
			if (block.startsWith("## ")) {
				html.append("<h2 style=\"font-family:Georgia,serif;font-size:22px;color:")
						.append(NAVY).append(";margin:22px 0 12px;\">")
						.append(inline(block.substring(3).strip())).append("</h2>");
				continue;
			}
			if (block.equals("---")) {
				html.append("<hr style=\"border:0;border-top:1px solid ").append(BORDER)
						.append(";margin:24px 0;\">");
				continue;
			}
			java.util.regex.Matcher cta = java.util.regex.Pattern
					.compile("^\\[\\[([^]]+)\\]\\]\\((https?://[^)\\s]+)\\)\\s*$")
					.matcher(block);
			if (cta.matches()) {
				html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"")
						.append(" style=\"margin:22px 0;\"><tr><td style=\"border-radius:8px;")
						.append("background:").append(GREEN).append(";\">")
						.append("<a href=\"").append(escape(cta.group(2)))
						.append("\" style=\"display:inline-block;padding:13px 26px;")
						.append("font-family:Arial,Helvetica,sans-serif;font-size:15px;")
						.append("font-weight:bold;color:#ffffff;text-decoration:none;\">")
						.append(escape(cta.group(1))).append("</a></td></tr></table>");
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
