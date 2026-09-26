package com.ghemit.platform.media.infrastructure.out.folder;

import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemRepository;
import com.ghemit.platform.content.domain.ContentType;
import com.ghemit.platform.content.domain.Payload;
import com.ghemit.platform.media.application.port.out.MediaFolderCatalog;
import com.ghemit.platform.media.domain.MediaFolder;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Les dossiers de la médiathèque sont persistés dans le réglage « media-folders »
 * du contexte « content ». Cet adaptateur joue le rôle de couche de traduction :
 * le contexte « media » ne connaît que son port.
 */
@Component
@RequiredArgsConstructor
public class ContentSettingMediaFolderCatalog implements MediaFolderCatalog {

	private static final String FOLDERS_SLUG = "media-folders";
	private static final String ITEMS_KEY = "items";

	private final ContentItemRepository contentRepository;

	@Override
	public List<MediaFolder> declared() {
		return setting()
				.map(item -> item.payload().stringList(ITEMS_KEY).stream().map(MediaFolder::of).toList())
				.orElseGet(List::of);
	}

	@Override
	public void declare(MediaFolder folder) {
		ContentItem item = setting().orElseGet(() -> ContentItem.create(
				ContentType.SETTING, FOLDERS_SLUG, 0, Payload.of(Map.of(ITEMS_KEY, List.of()))));
		List<String> names = new ArrayList<>(item.payload().stringList(ITEMS_KEY));
		if (!names.contains(folder.name())) {
			names.add(folder.name());
			item.putPayloadEntry(ITEMS_KEY, names);
			contentRepository.save(item);
		}
	}

	@Override
	public void remove(MediaFolder folder) {
		setting().ifPresent(item -> {
			List<String> names = new ArrayList<>(item.payload().stringList(ITEMS_KEY));
			if (names.remove(folder.name())) {
				item.putPayloadEntry(ITEMS_KEY, names);
				contentRepository.save(item);
			}
		});
	}

	private Optional<ContentItem> setting() {
		return contentRepository.findByTypeAndSlug(ContentType.SETTING, FOLDERS_SLUG);
	}
}
