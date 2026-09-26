package com.ghemit.platform.content.application.port.in;

import com.ghemit.platform.content.domain.ContentItem;
import com.ghemit.platform.content.domain.ContentItemId;

/** Édition du contenu depuis le back office. */
public interface ManageContentUseCase {

	ContentItem create(CreateContentItemCommand command);

	ContentItem update(UpdateContentItemCommand command);

	void delete(ContentItemId id);
}
