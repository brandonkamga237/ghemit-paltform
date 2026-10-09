package com.ghemit.platform.content.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ghemit.platform.content.application.port.in.CreateContentItemCommand;
import com.ghemit.platform.content.application.port.in.UpdateContentItemCommand;
import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemId;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;
import com.ghemit.platform.shared.domain.BusinessRuleViolationException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ContentCatalogServiceTest {

	private final InMemoryContent repository = new InMemoryContent();
	private final ContentCatalogService service = new ContentCatalogService(repository);

	private ContentItem article(String slug) {
		return service.create(new CreateContentItemCommand(ContentType.ARTICLE, slug, null,
				Payload.of(Map.of("title", "Titre"))));
	}

	@Test
	void refuse_un_slug_deja_pris_par_un_contenu_du_meme_type() {
		article("orientation");

		assertThatThrownBy(() -> article("orientation"))
				.isInstanceOf(BusinessRuleViolationException.class)
				.hasMessageContaining("orientation");
	}

	@Test
	void accepte_le_meme_slug_pour_deux_types_differents() {
		article("douala");

		ContentItem event = service.create(new CreateContentItemCommand(ContentType.EVENT, "douala", null,
				Payload.empty()));

		assertThat(event.slug()).isEqualTo("douala");
	}

	@Test
	void un_contenu_peut_etre_enregistre_avec_son_propre_slug() {
		ContentItem item = article("rentree");

		ContentItem updated = service.update(new UpdateContentItemCommand(item.id(), "rentree", null,
				Payload.of(Map.of("title", "Nouveau titre"))));

		assertThat(updated.payload().get("title")).isEqualTo("Nouveau titre");
	}

	@Test
	void refuse_de_renommer_un_contenu_vers_un_slug_existant() {
		article("premier");
		ContentItem second = article("second");

		assertThatThrownBy(() -> service.update(new UpdateContentItemCommand(second.id(), "premier", null, null)))
				.isInstanceOf(BusinessRuleViolationException.class);
	}

	private static final class InMemoryContent implements ContentItemRepository {
		private final List<ContentItem> store = new ArrayList<>();

		@Override
		public List<ContentItem> findByType(ContentType type) {
			return store.stream().filter(i -> i.type() == type).toList();
		}

		@Override
		public Optional<ContentItem> findByTypeAndSlug(ContentType type, String slug) {
			return store.stream().filter(i -> i.type() == type && Objects.equals(i.slug(), slug)).findFirst();
		}

		@Override
		public Optional<ContentItem> findById(ContentItemId id) {
			return store.stream().filter(i -> i.id().equals(id)).findFirst();
		}

		@Override
		public ContentItem save(ContentItem item) {
			store.removeIf(i -> i.id().equals(item.id()));
			store.add(item);
			return item;
		}

		@Override
		public void delete(ContentItem item) {
			store.removeIf(i -> i.id().equals(item.id()));
		}

		@Override
		public long count() {
			return store.size();
		}
	}
}
