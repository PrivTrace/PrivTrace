# PrivTrace 🛡️🔒

PrivTrace is a privacy-focused application designed to handle Data Subject Requests (DSRs) securely and efficiently. It provides robust tools for encrypting sensitive user data 🤫 and maintaining comprehensive audit logs 📜 for compliance and security.

## Key Features ✨

* **Data Encryption** 🔑: Implements AES-256-CBC encryption for all personal data submitted through DSR forms. This includes fields like requester email, name, request type, and details.
  * Uses secure encryption keys and initialization vectors (IVs) stored in environment variables.
  * Supports searchable encryption by storing a SHA-256 hash of email addresses, allowing for email-based searches without exposing plaintext data.
* **Audit Logging** 📜📊: A comprehensive audit logging system tracks all significant user actions, system events, and data changes.
  * Logs various actions including user login/logout, DSR creation/updates, company registration, and administrative actions.
  * Provides a user interface for viewing and filtering audit logs.
  * Designed with GDPR, SOC 2, HIPAA, ISO 27001, and PCI DSS compliance in mind.
* **Access Control** 👤🚦: Ensures that users can only see logs and data relevant to their respective companies. All audit and data endpoints require valid user sessions.

## Screenshots 🖼️📷
![Landing Page](https://github.com/user-attachments/assets/91004e12-d3d2-4769-9172-345672d9ad40)
![Dashboard](https://github.com/user-attachments/assets/fd0c5f45-6789-41a4-b0fe-43e29774d82e)
![Audit Log](https://github.com/user-attachments/assets/ab36f988-ce48-47e3-96bb-c48b7d3decc0)
![DSR Form](https://github.com/user-attachments/assets/787a2ded-a8e8-40e6-80b4-89e0cccf176c)


## Technical Overview 💻⚙️

* **Primary Languages**: TypeScript (97.5%), CSS (2.3%), JavaScript (0.2%)
* **Encryption**: AES-256-CBC for data at rest.
* **Hashing**: SHA-256 for searchable email indexes.
* **Audit Trail**: Detailed logging of actions related to users, companies, DSRs, and system administration.

## Security Considerations ⚠️🔐

* **Key Management**: Encryption keys are managed via environment variables. For production environments, it is **highly recommended** to use a dedicated secure key management service.
* **Data Integrity**: Audit logs are designed to be append-only.
* **Privacy by Design**: Core functionalities like encryption and audit logging are built-in to support privacy compliance.

## Getting Started 🚀🛠️

```sh
bun install
bun run dev --turbopack
```
