package com.ghemit.platform.media.domain;

import com.ghemit.platform.shared.domain.BusinessRuleViolationException;

/** Dossier logique de la médiathèque. La chaîne vide représente la racine. */
public record MediaFolder(String name) {

	private static final MediaFolder ROOT = new MediaFolder("");

	public MediaFolder {
		name = name == null ? "" : name.trim();
	}

	public static MediaFolder root() {
		return ROOT;
	}

	public static MediaFolder of(String name) {
		return new MediaFolder(name);
	}

	/** Dossier nommé : refuse la racine, utilisé à la création depuis le back office. */
	public static MediaFolder named(String name) {
		MediaFolder folder = new MediaFolder(name);
		if (folder.isRoot()) {
			throw new BusinessRuleViolationException("Le nom du dossier est requis");
		}
		return folder;
	}

	public boolean isRoot() {
		return name.isEmpty();
	}

	@Override
	public String toString() {
		return name;
	}
}
