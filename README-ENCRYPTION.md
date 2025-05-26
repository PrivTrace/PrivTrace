# DSR Form Data Encryption

This document explains how sensitive data in the DSR (Data Subject Request) system is protected through encryption.

## Overview

All personal data submitted through DSR forms is encrypted before being stored in the database. This ensures that even if the database is compromised, the personal data remains protected.

## Implementation Details

### Encryption Method

- The system uses AES-256-CBC encryption (Advanced Encryption Standard with 256-bit key)
- Both a secure encryption key and initialization vector (IV) are used
- Keys are stored in environment variables, not in code

### Encrypted Fields

The following fields are encrypted:

- Requester Email
- Requester Name
- Request Type
- Request Details

### Searchable Encryption

To allow searching by email while maintaining encryption:

- The system stores a SHA-256 hash of the email address alongside the encrypted value
- When searching by email, the search query is hashed using the same algorithm
- This allows email matching without storing the actual email in plaintext

## Security Considerations

1. **Key Management**: The encryption keys are stored in environment variables. In production, use a secure key management service rather than storing them directly in environment variables.

2. **Environment Variables**:

    ```
    ENCRYPTION_KEY="32-character-encryption-key-here"
    ENCRYPTION_IV="16-character-iv-here"
    ```

3. **Database Indexes**: An index is created on the `requesterEmailHash` field to enable efficient searching without compromising the encrypted data.

## Best Practices

1. Rotate encryption keys periodically (requires re-encryption of existing data)
2. Ensure application logs do not contain decrypted sensitive data
3. Limit access to encrypted data only to authorized personnel
4. Never log or display full encrypted or decrypted data unnecessarily

## Extended Protection

This encryption system could be extended further by:

1. Adding field-level encryption keys
2. Implementing envelope encryption (encrypting the data encryption key)
3. Adding digital signatures for verification of data integrity
