package com.ghemit.platform;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Vérifie que tout l'hexagone se câble : adaptateurs, ports et cas d'usage.
 * Nécessite PostgreSQL (docker compose up -d), d'où le tag « integration »
 * exclu du {@code test} par défaut. À lancer avec {@code ./gradlew integrationTest}.
 */
@Tag("integration")
@SpringBootTest
class PlatformApplicationTests {

	@Test
	void contextLoads() {
	}

}
