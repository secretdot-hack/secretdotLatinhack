## MILESTONE 2 PLAN: SecretDot

**Team:** Nicolás Bustelo — Ignacio Wuilloud — Juan Pablo Massuet  
**Track:** [x] SHIP-A-TON  [ ] IDEA-TON  
**Date:** 16th November 2025

---

## 📍 WHERE WE ARE NOW

**What we built/validated this weekend:**
- An app that enables users to securely exchange encrypted messages and files using their blockchain wallets, with full decentralization and zero reliance on servers or intermediaries.
- Functional decentralized messaging flow (Inbox / Sent) using wallet-based authentication.
- Client-side encryption + decryption working end-to-end.
- Smart-contract based message publishing on Polkadot.
- Basic UI/UX for sending and receiving encrypted content.

**What's working:**
- Wallet login and identity pairing.
- Encryption with user’s public key and secure decryption by the recipient.
- Message indexing and retrieval through the blockchain.

**What still needs work:**
- File storage migration from IPFS to Arkiv.
- Support for additional file types (images, PDFs, structured data).
- Onboarding flow for users without technical background.
- Multichain wallet compatibility.

**Blockers or hurdles we hit:**
- Efficient handling of encrypted payloads on-chain.
- Ensuring smooth wallet connection across Polkadot-compatible wallets.
- Designing a long-term scalable decentralized storage layer.

---

## 🚀 WHAT WE'LL SHIP IN 30 DAYS

**Our MVP will do this:**  
SecretDot will allow users to send and receive encrypted messages and files directly through their blockchain wallets, with full end-to-end encryption, decentralized storage, and multichain support. It targets professionals who require censorship-resistant and privacy-first communication.

### Features We'll Build (3-5 max)

**Week 1-2:**
- Feature: Migration from IPFS to **Arkiv**, a decentralized database built on Polkadot.  
- Why it matters: Ensures fully decentralized, scalable, persistent, and native Polkadot storage that aligns with SecretDot’s vision.  
- Who builds it: Ignacio Wuilloud

**Week 2-3:**
- Feature: Support for multiple file types (documents, images, PDFs, structured files).  
- Why it matters: Expands SecretDot beyond text messages, enabling real-world professional usage.  
- Who builds it: Nicolas Bustelo

**Week 3-4:**
- Feature: Integration with **multiple wallets** (Talisman, SubWallet, Nova Wallet, etc.).  
- Why it matters: Lowers friction, expands accessibility, and supports multichain users.  
- Who builds it: Juan Pablo Massuet

**Week 3-4 (parallel):**
- Feature: Implementation of the **freemium model** (free tier + premium features).  
- Why it matters: Creates a sustainable business model while keeping core privacy features accessible.  
- Who builds it: Team (shared)

---

### Team Breakdown

**Ignacio Wuilloud – Blockchain & Smart Contracts** | ~10 hrs/week  
- Owns: Arkiv integration, contract upgrades, multichain indexing logic.

**Nicolas Bustelo – Frontend & Encryption Engineering** | ~12 hrs/week  
- Owns: UX/UI, client-side cryptography, file-type support, freemium onboarding flow.

**Juan Pablo Massuet – Integrations & Infrastructure** | ~10 hrs/week  
- Owns: Multi-wallet integration, connectivity, testing across chains/devices.

---

### Mentoring & Expertise We Need

**Areas where we need support:**
- Scaling decentralized storage solutions with Arkiv.
- Designing a strong product-led freemium model.

**Specific expertise we're looking for:**
- Polkadot smart contract performance optimization.
- Web3 security audits for encryption + wallet interactions.
- Growth hacking and user acquisition for privacy tools.

---

## 🎯 WHAT HAPPENS AFTER

**When M2 is done, we plan to...**
- Release the public beta with Arkiv storage and multi-wallet support.
- Begin onboarding early users (journalists, lawyers, doctors, activists).
- Start iterating on premium features for the freemium model.

**And 6 months out we see our project achieve:**
- A fully decentralized, cross-chain messaging ecosystem.
- Thousands of users securely exchanging encrypted data.
- Deep integration with Polkadot infrastructure and ecosystem partners.
- Expanded mobile support (iOS/Android) with seamless wallet connections.
