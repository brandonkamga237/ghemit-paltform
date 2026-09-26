package com.ghemit.platform.media.application.port.in;

import com.ghemit.platform.media.domain.MediaFile;
import com.ghemit.platform.media.domain.MediaFileId;
import com.ghemit.platform.media.domain.MediaFolder;
import java.util.List;

/** Alimentation et organisation de la médiathèque. */
public interface ManageMediaUseCase {

	MediaFile upload(UploadMediaCommand command);

	void delete(MediaFileId id);

	/** @return la liste des dossiers après création */
	List<String> createFolder(MediaFolder folder);

	/** Supprime le dossier ; ses fichiers repassent à la racine. */
	List<String> deleteFolder(MediaFolder folder);
}
