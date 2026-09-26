package com.ghemit.platform.media.application.port.in;

import com.ghemit.platform.media.domain.MediaFile;
import com.ghemit.platform.media.domain.MediaFolder;
import java.util.List;

/** Consultation de la médiathèque par le back office. */
public interface MediaLibraryQuery {

	/** @param folder dossier à filtrer, ou {@code null} pour tout lister */
	List<MediaFile> list(MediaFolder folder);

	/** Dossiers déclarés, complétés par ceux réellement utilisés par des fichiers. */
	List<String> folderNames();
}
