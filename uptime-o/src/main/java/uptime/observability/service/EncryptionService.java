package uptime.observability.service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import uptime.observability.config.ApplicationProperties;

/**
 * Service for encrypting and decrypting sensitive data like webhook URLs, auth tokens, and passwords.
 * Uses AES-256-GCM encryption for secure storage.
 */
@Service
public class EncryptionService {

    private static final Logger LOG = LoggerFactory.getLogger(EncryptionService.class);
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits
    private static final int GCM_TAG_LENGTH = 128; // 128 bits

    private final SecretKey secretKey;

    public EncryptionService(ApplicationProperties applicationProperties) {
        String encryptionKey = applicationProperties.getEncryption().getSecretKey();
        if (encryptionKey == null || encryptionKey.trim().isEmpty()) {
            LOG.warn("No encryption key configured. Generating a random key. This key will not persist across restarts!");
            this.secretKey = generateKey();
        } else {
            this.secretKey = decodeKey(encryptionKey);
        }
    }

    /**
     * Encrypts the given plaintext string.
     *
     * @param plaintext the string to encrypt
     * @return Base64-encoded encrypted string with IV prepended, or null if input is null
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }

        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            // Encrypt
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Prepend IV to ciphertext
            byte[] encrypted = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, encrypted, 0, iv.length);
            System.arraycopy(ciphertext, 0, encrypted, iv.length, ciphertext.length);

            // Return Base64 encoded
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            LOG.error("Error encrypting data", e);
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }

    /**
     * Decrypts the given Base64-encoded encrypted string.
     *
     * @param encrypted the Base64-encoded string to decrypt
     * @return decrypted plaintext string, or null if input is null
     */
    public String decrypt(String encrypted) {
        if (encrypted == null || encrypted.isEmpty()) {
            return encrypted;
        }

        try {
            // Decode from Base64
            byte[] decoded = Base64.getDecoder().decode(encrypted);

            // Extract IV and ciphertext
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(decoded, 0, iv, 0, iv.length);

            byte[] ciphertext = new byte[decoded.length - GCM_IV_LENGTH];
            System.arraycopy(decoded, GCM_IV_LENGTH, ciphertext, 0, ciphertext.length);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            // Decrypt
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            LOG.error("Error decrypting data", e);
            throw new RuntimeException("Failed to decrypt data", e);
        }
    }

    /**
     * Generates a random AES-256 key.
     *
     * @return generated secret key
     */
    private SecretKey generateKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(256, new SecureRandom());
            return keyGenerator.generateKey();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate encryption key", e);
        }
    }

    /**
     * Decodes a Base64-encoded key string into a SecretKey.
     *
     * @param encodedKey Base64-encoded key string
     * @return decoded secret key
     */
    private SecretKey decodeKey(String encodedKey) {
        try {
            byte[] decodedKey = Base64.getDecoder().decode(encodedKey.trim());
            return new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
        } catch (Exception e) {
            LOG.error("Invalid encryption key format. Generating a random key instead.", e);
            return generateKey();
        }
    }

    /**
     * Utility method to generate a Base64-encoded encryption key for configuration.
     * This can be run once to generate a key to put in application.yml
     *
     * @return Base64-encoded encryption key
     */
    public static String generateEncodedKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(256, new SecureRandom());
            SecretKey key = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate encryption key", e);
        }
    }
}
