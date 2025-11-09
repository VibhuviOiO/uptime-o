 I'm using Spring Security's PasswordEncoder (BCrypt) instead, which is actually better suited for this use case.

Here's the difference:

Current Implementation (BCrypt via PasswordEncoder):

✅ One-way hashing (cannot be decrypted)
✅ Salted automatically
✅ Designed specifically for password/key hashing
✅ Slow by design (protects against brute force)
EncryptionService (AES-256-GCM):

❌ Two-way encryption (can be decrypted)
❌ Not ideal for API keys since you should never need to decrypt them
✅ Good for webhook URLs, auth tokens that need to be retrieved
Should we switch to EncryptionService?

For API keys, BCrypt is the correct choice because:

You validate by comparing hashes, not decrypting
Even if database is compromised, keys can't be recovered
Standard industry practice for API key storage
However, if you want to use your existing EncryptionService with the key from application-dev.yml, I can make that change. You would need to add the encryption key to your config:

# My recommendation: 

Keep BCrypt for API keys, use EncryptionService only for data that needs to be decrypted later (like webhook URLs).


API Keys:

✅ BCrypt (one-way hashing) - Show once during creation, then NEVER retrievable
Users must copy and save it themselves
Webhook URLs:

✅ EncryptionService (two-way encryption) - Can be viewed/edited anytime
Users can come back and see what URL they configured
This is actually the best practice approach. API keys are secrets that should never be exposed again, while webhook URLs are configuration data that users need to view and update.

Current Status:

✅ API Keys already using BCrypt (correct implementation)
❓ Webhook URLs - Need to check if they're using EncryptionService