package com.ghemit.platform.media.application.port.out;

import com.ghemit.platform.media.domain.MediaFolder;
import java.util.List;

/**
 * Dossiers déclarés de la médiathèque, y compris ceux encore vides. Ils sont
 * stockés avec les réglages du site : ce port évite au contexte « media » de
 * connaître le contexte « content ».
 */
public interface MediaFolderCatalog {

	List<MediaFolder> declared();

	void declare(MediaFolder folder);

	void remove(MediaFolder folder);
}
