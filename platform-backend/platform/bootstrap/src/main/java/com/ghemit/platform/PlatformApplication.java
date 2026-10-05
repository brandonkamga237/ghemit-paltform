package com.ghemit.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Point d'entrée de l'application. Le scan de composants couvre les adaptateurs
 * du module infrastructure ; les cas d'usage sont câblés explicitement dans
 * {@code com.ghemit.platform.bootstrap}.
 */
@EnableAsync
@SpringBootApplication
public class PlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlatformApplication.class, args);
	}

}
