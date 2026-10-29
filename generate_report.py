import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Industrial Equipment Maintenance & Service Traceability System - Chintakrinda Sai Teja (23501A0527)</title>
<style>
  @page {
    size: A4;
    margin: 15mm;
  }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #111;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 18mm 20mm;
    margin: 10mm auto;
    background: #fff;
    box-shadow: 0 0 10px rgba(0,0,0,0.15);
    box-sizing: border-box;
    position: relative;
    page-break-after: always;
  }
  .border-box {
    border: 3px double #111;
    height: 100%;
    min-height: 255mm;
    padding: 15mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  @media print {
    body {
      background: none;
    }
    .page {
      margin: 0;
      box-shadow: none;
      width: 100%;
      min-height: 100vh;
      padding: 15mm;
    }
    .border-box {
      min-height: 94vh;
    }
  }
  h1, h2, h3, h4 {
    font-family: "Times New Roman", Times, serif;
    font-weight: bold;
    color: #000;
  }
  .text-center { text-align: center; }
  .text-justify { text-align: justify; text-justify: inter-word; }
  .uppercase { text-transform: uppercase; }
  
  .title-page {
    text-align: center;
    justify-content: space-between;
  }
  .main-title {
    font-size: 18pt;
    font-weight: bold;
    letter-spacing: 0.5px;
    margin-top: 10px;
    margin-bottom: 25px;
    line-height: 1.3;
  }
  .degree-text {
    font-size: 13pt;
    font-weight: bold;
    margin: 8px 0;
  }
  .sub-title {
    font-size: 13pt;
    text-decoration: underline;
    margin-top: 25px;
    margin-bottom: 8px;
  }
  .submitted-by {
    font-size: 12pt;
    font-style: italic;
    margin-bottom: 12px;
  }
  .student-name {
    font-size: 15pt;
    font-weight: bold;
    margin-bottom: 6px;
  }
  .roll-no {
    font-size: 14pt;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 20px;
  }
  .guide-label {
    font-size: 12pt;
    margin-bottom: 6px;
  }
  .guide-name {
    font-size: 13pt;
    font-weight: bold;
  }
  .logo-container {
    margin: 15px 0;
  }
  .college-emblem {
    width: 110px;
    height: 110px;
    border: 2px solid #800000;
    border-radius: 50%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9pt;
    text-align: center;
    color: #800000;
    font-weight: bold;
    padding: 6px;
    box-sizing: border-box;
    background: #fffdf5;
  }
  .dept-title {
    font-size: 13pt;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .college-name {
    font-size: 13.5pt;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .college-affil {
    font-size: 10.5pt;
    margin: 3px 0;
  }
  .academic-year {
    font-size: 13pt;
    font-weight: bold;
    margin-top: 8px;
  }

  /* Certificate Page */
  .cert-header {
    text-align: center;
    margin-bottom: 20px;
  }
  .cert-title {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    letter-spacing: 1px;
    margin: 30px 0 25px 0;
    text-decoration: underline;
  }
  .cert-body {
    font-size: 12.5pt;
    line-height: 1.8;
    text-align: justify;
    margin-bottom: 40px;
  }
  .cert-signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
    margin-bottom: 40px;
  }
  .sig-block {
    text-align: center;
    width: 45%;
    font-size: 11pt;
  }
  .sig-title {
    font-weight: bold;
    margin-bottom: 40px;
  }
  .sig-name {
    font-weight: bold;
  }
  .marks-table {
    width: 220px;
    border-collapse: collapse;
    margin-top: 20px;
    font-size: 11.5pt;
    font-weight: bold;
  }
  .marks-table td {
    border: 1.5px solid #000;
    padding: 8px 12px;
    text-align: center;
  }

  /* Index Table */
  .index-title {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 25px;
    letter-spacing: 1px;
  }
  .index-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11pt;
  }
  .index-table th, .index-table td {
    border: 1px solid #333;
    padding: 7px 10px;
  }
  .index-table th {
    background-color: #f2f2f2;
    text-align: center;
    font-weight: bold;
  }
  .index-table td.col-sno { text-align: center; width: 50px; }
  .index-table td.col-page { text-align: center; width: 80px; }

  /* Content Pages */
  .ch-heading {
    font-size: 14pt;
    font-weight: bold;
    margin-top: 5px;
    margin-bottom: 15px;
    border-bottom: 1.5px solid #000;
    padding-bottom: 4px;
    text-transform: uppercase;
  }
  .sec-heading {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 6px;
  }
  .sub-sec-heading {
    font-size: 11.5pt;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 4px;
    font-style: italic;
  }
  p {
    margin: 6px 0;
    text-align: justify;
    line-height: 1.45;
  }
  ul, ol {
    margin: 6px 0 10px 20px;
    padding-left: 10px;
  }
  li {
    margin-bottom: 4px;
    text-align: justify;
    line-height: 1.4;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 10.5pt;
  }
  table.data-table th, table.data-table td {
    border: 1px solid #333;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  table.data-table th {
    background-color: #f4f4f4;
    font-weight: bold;
  }
  pre, code {
    font-family: "Courier New", Courier, monospace;
    font-size: 9.5pt;
    background: #f8f9fa;
  }
  pre.code-block {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 10px 0;
    white-space: pre-wrap;
    line-height: 1.3;
    overflow-x: auto;
  }
  .page-num {
    position: absolute;
    bottom: 8mm;
    right: 20mm;
    font-size: 10pt;
    font-family: "Times New Roman", Times, serif;
  }
  .listing-title {
    font-size: 10.5pt;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 4px;
  }
</style>
</head>
<body>

<!-- ================= PAGE 1: COVER PAGE ================= -->
<div class="page">
  <div class="border-box title-page">
    <div>
      <div class="main-title">
        INDUSTRIAL EQUIPMENT MAINTENANCE &amp;<br>SERVICE TRACEABILITY SYSTEM
      </div>
      <div class="degree-text">BACHELOR OF TECHNOLOGY</div>
      <div style="font-size: 12pt; font-weight: bold; margin: 4px 0;">IN</div>
      <div class="degree-text">COMPUTER SCIENCE AND ENGINEERING</div>
      <div class="sub-title">Use Case Report</div>
      <div class="submitted-by">submitted by</div>
      <div class="student-name">Chintakrinda Sai Teja</div>
      <div class="roll-no">23501A0527</div>
      <div class="guide-label">Under the guidance of</div>
      <div class="guide-name">Mr. A. Prashant, Asst. Prof.</div>
    </div>

    <div>
      <div class="logo-container">
        <div class="college-emblem">
          PRASAD V POTLURI<br>
          SIDDHARTHA<br>
          INST. OF TECH.<br>
          VIJAYAWADA
        </div>
      </div>
      <div class="dept-title">Department of Computer Science and Engineering</div>
      <div class="college-name">Prasad V Potluri Siddhartha Institute of Technology</div>
      <div class="college-affil">(Permanently affiliated to JNTU-Kakinada, Approved by AICTE)</div>
      <div class="college-affil">(An NBA &amp; NAAC accredited and ISO 9001:2015 certified institute)</div>
      <div style="font-size: 11pt; font-weight: bold; margin-top: 4px;">Kanuru, Vijayawada-520 007</div>
      <div class="academic-year">2026-27</div>
    </div>
  </div>
</div>

<!-- ================= PAGE 2: CERTIFICATE ================= -->
<div class="page">
  <div class="border-box">
    <div class="cert-header">
      <div class="college-name" style="font-size: 14pt;">Prasad V Potluri Siddhartha Institute of Technology</div>
      <div class="college-affil">(Permanently affiliated to JNTU-Kakinada, Approved by AICTE)</div>
      <div class="college-affil">(An NBA &amp; NAAC accredited and ISO 9001:2015 certified institute)</div>
      <div style="font-size: 11pt; font-weight: bold; margin-top: 3px;">Kanuru, Vijayawada-520 007</div>
      <div class="logo-container" style="margin: 20px 0;">
        <div class="college-emblem" style="width: 90px; height: 90px; font-size: 8pt;">
          PVPSIT<br>VIJAYAWADA
        </div>
      </div>
    </div>

    <div class="cert-title">CERTIFICATE</div>

    <div class="cert-body">
      This is to certify that the Use Case report entitled <strong>“INDUSTRIAL EQUIPMENT MAINTENANCE &amp; SERVICE TRACEABILITY SYSTEM”</strong> that is being submitted by <strong>Chintakrinda Sai Teja (23501A0527)</strong>, as part of Assignment-2 for the <strong>Blockchain Technology (23CS4601C)</strong> course in <strong>4-1</strong> during the academic year <strong>2026-27</strong>.
    </div>

    <div class="cert-signatures">
      <div class="sig-block">
        <div class="sig-title">Course Coordinator</div>
        <div class="sig-name">Mr. A. Prashant</div>
        <div>Assistant Professor,</div>
        <div>Department of CSE,</div>
        <div>PVPSIT, Vijayawada</div>
      </div>
      <div class="sig-block">
        <div class="sig-title">Head of the Department</div>
        <div class="sig-name">Dr. A. Jayalakshmi,</div>
        <div>Professor and Head,</div>
        <div>Department of CSE,</div>
        <div>PVPSIT, Vijayawada</div>
      </div>
    </div>

    <table class="marks-table">
      <tr>
        <td>MARKS<br>ASSIGNMENT-2: &nbsp;&nbsp;&nbsp;&nbsp; / 5</td>
      </tr>
    </table>
  </div>
</div>

<!-- ================= PAGE 3: INDEX ================= -->
<div class="page">
  <div class="border-box">
    <div class="index-title">INDEX</div>
    <table class="index-table">
      <thead>
        <tr>
          <th class="col-sno">S. No.</th>
          <th>Chapter</th>
          <th class="col-page">Page No.</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="col-sno">1</td>
          <td>Introduction</td>
          <td class="col-page">01</td>
        </tr>
        <tr>
          <td class="col-sno">2</td>
          <td>Background</td>
          <td class="col-page">02</td>
        </tr>
        <tr>
          <td class="col-sno">3</td>
          <td>Blockchain Basics</td>
          <td class="col-page">04</td>
        </tr>
        <tr>
          <td class="col-sno">4</td>
          <td>Use Case Overview</td>
          <td class="col-page">06</td>
        </tr>
        <tr>
          <td class="col-sno">5</td>
          <td>Implementation</td>
          <td class="col-page">09</td>
        </tr>
        <tr>
          <td class="col-sno">6</td>
          <td>Benefits</td>
          <td class="col-page">19</td>
        </tr>
        <tr>
          <td class="col-sno">7</td>
          <td>Challenges</td>
          <td class="col-page">21</td>
        </tr>
        <tr>
          <td class="col-sno">8</td>
          <td>Conclusion</td>
          <td class="col-page">22</td>
        </tr>
        <tr>
          <td class="col-sno">9</td>
          <td>SDG's Addressed</td>
          <td class="col-page">23</td>
        </tr>
        <tr>
          <td class="col-sno">10</td>
          <td>References</td>
          <td class="col-page">24</td>
        </tr>
        <tr>
          <td class="col-sno">11</td>
          <td>Appendix A</td>
          <td class="col-page">25</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- ================= PAGE 4: CHAPTER 1 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">1. INTRODUCTION</div>
    <div class="sec-heading">1.1. Overview of Blockchain Technology</div>
    <p>Blockchain technology is a decentralized and distributed ledger system that records transactions across multiple nodes, ensuring transparency, security, and immutability. Unlike traditional databases, blockchain operates on a peer-to-peer network, eliminating the need for central authorities. Each block in the chain contains a cryptographic hash of the previous block, an authoritative timestamp, and validated transaction data, making data tampering virtually impossible. Originally designed for cryptocurrency transactions, blockchain has now expanded into various enterprise domains, including finance, aerospace, supply chain, healthcare, and industrial asset management. [2]</p>

    <div class="sec-heading">1.2. Relevance of Blockchain in Industrial Equipment Maintenance &amp; Compliance</div>
    <p>In heavy precision manufacturing industries (such as aerospace component milling, automotive stamping, CNC machining, and automated robotics), equipment reliability, preventative maintenance, and workplace safety compliance are mission-critical. Traditional maintenance management systems rely on centralized databases (SQL/NoSQL), maintenance spreadsheets, and physical paperwork administered by a single factory authority or software vendor.</p>

    <p>These centralized workflows suffer from major accountability flaws when multi-party oversight is required. Database administrators or plant managers with elevated privileges can alter, backdate, or delete embarrassing maintenance failure logs to pass safety audits or maintain favorable insurance ratings. Furthermore, equipment manufacturers (OEMs), third-party maintenance contractors, factory operators, and certified ISO/OSHA inspectors have conflicting interests and lack a single source of mutual truth. Unauthorized sub-standard parts can be installed without an immutable cryptographic paper trail linking serial numbers to the servicing technician. Paper or PDF calibration certificates can be altered or forged without immediate detection.</p>

    <p>Blockchain addresses these challenges by storing every maintenance intervention, part replacement, and safety audit as a time-stamped transaction on an append-only ledger. Because the ledger is immutable, records cannot be modified, backdated, or overwritten. Off-chain engineering calibration sheets and inspection sign-offs are digested using <strong>SHA-256 cryptographic hashes</strong>, anchoring file integrity permanently on-chain. Inspired by real-world enterprise traceability initiatives such as Renault's XCEED platform [1][2][3], <strong>EquipLedger</strong> applies these principles to industrial equipment: linking heavy machines directly to their service histories, replaced spare parts, certified technician signatures, and regulatory audit verdicts.</p>
    <div class="page-num">01</div>
  </div>
</div>

<!-- ================= PAGE 5: CHAPTER 2 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">2. BACKGROUND</div>
    <p>Traditional industrial maintenance and equipment tracking systems face several operational challenges, often leading to fragmented records, manual reconciliation delays, limited traceability, and severe disputes over breakdown liabilities. Below are key issues with existing industrial maintenance tracking workflows:</p>

    <div class="sec-heading">2.1. Fragmentation and Loss of Service History Logs</div>
    <p>Many factories still rely on emailed PDF calibration certificates, spreadsheets, and isolated ERP entries, which are prone to misplacement, version confusion, or loss across departmental boundaries. Plant managers and external auditors often struggle to retrieve the complete lifecycle history of an industrial asset during failure investigations.</p>

    <div class="sec-heading">2.2. Difficulty Linking Individual Machinery to Service Records &amp; Parts</div>
    <p>A plant may operate multiple machines of the same model (e.g., 5-axis CNC machining centers or hydraulic stamping presses). Generic work-order documents frequently describe the general model rather than a specific physical unit. Without an explicit, enforced on-chain machine identifier linking each service log and replaced part serial number to its exact parent asset, maintenance records are easily mixed up.</p>

    <div class="sec-heading">2.3. Unauthorized, Backdated, or Untraceable Alterations</div>
    <p>In an ordinary centralized database or spreadsheet, anyone with administrative write access can edit or overwrite a maintenance record, and the previous state is lost unless external auditing is maintained. Even where audit tables exist, the administrator who controls the database server can also alter the audit log.</p>

    <div class="sec-heading">2.4. Lack of Cross-Organizational Transparency (OEMs, Plants, Auditors)</div>
    <p>Centralized systems keep records under the control of a single factory administration, making it difficult for machine manufacturers (OEMs), independent maintenance contractors, plant operators, and certified auditors to share a consistent, independently verifiable view of equipment health.</p>

    <div class="sec-heading">2.5. Counterfeit Replacement Parts and Unverified Maintenance Actions</div>
    <p>Substandard or uncertified replacement components (such as unrated bearings or substandard hydraulic valves) are frequently installed during emergency downtime. Conventional systems lack a cryptographic trail tying the replaced part's serial number to the technician's private key.</p>
    <div class="page-num">02</div>
  </div>
</div>

<!-- ================= PAGE 6: CHAPTER 2 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">2.6. Challenges in Tracking Safety Audits and Regulatory Certifications</div>
    <p>The operational compliance of heavy machinery changes over time as wear occurs or after major repairs. Without a structured, append-only workflow, it is difficult to record who certified an inspection, preserve the earlier maintenance history, and ensure the machine cannot be returned to service without formal audit approval.</p>

    <div class="sec-heading">2.7. Document Integrity Risks and Calibration Certificate Forgery</div>
    <p>PDF calibration reports, laser alignment sheets, and engineering attachments stored on local drives or shared via email are vulnerable to accidental replacement or deliberate tampering. Without a cryptographic hash anchored to an immutable ledger, plant supervisors cannot reliably verify that a retrieved PDF contains the exact same bytes originally signed off by the calibration engineer.</p>

    <div class="sec-heading">2.8. Disputes Over Breakdowns, Warranty Liabilities, and Negligence</div>
    <p>When multi-million-dollar industrial equipment suffers catastrophic mechanical failure, OEMs and plant operators frequently dispute whether required preventive maintenance schedules were fulfilled. Without a shared record that no single party can alter, warranty liability disputes are difficult to resolve fairly.</p>

    <div class="sec-heading">2.9. Limited Role-Based Cryptographic Accountability Across Roles</div>
    <p>Accountability must apply across distinct operational roles: plant administrators register equipment, maintenance engineers log repairs and parts, and certified inspectors conduct compliance sign-offs. In many conventional workflows, these actions are not enforced by smart-contract role permissions tied to authenticated cryptographic wallet identities.</p>

    <div class="sec-heading">2.10. Absence of Automated Equipment Status Transitions</div>
    <p>Machine operational states are often entered as free-text fields in spreadsheets. This human error allows a machine undergoing critical repairs to be mistakenly energized or cleared for production before an independent safety inspection has been conducted.</p>

    <p style="margin-top: 15px;">Due to these challenges, there is an urgent need for an immutable, role-governed industrial equipment maintenance and compliance system. Blockchain technology offers a robust foundation by uniquely identifying each machine, linking repairs and parts explicitly to assets, verifying off-chain document integrity via SHA-256 digests, and enforcing deterministic lifecycle state transitions on-chain.</p>
    <div class="page-num">03</div>
  </div>
</div>

<!-- ================= PAGE 7: CHAPTER 3 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">3. BLOCKCHAIN BASICS</div>
    <p>Blockchain technology is a distributed ledger system that ensures secure, transparent, and tamper-proof transactions. Unlike traditional systems that rely on intermediaries or a single organization's private database, blockchain enables verifiable multi-party interactions across plant management, manufacturing compliance, and document verification. Below are the key concepts that define blockchain technology:</p>

    <div class="sec-heading">3.1. Decentralization</div>
    <p>Traditional databases are managed by centralized authorities, such as a single corporation or IT administrator, which creates a single point of failure and makes records vulnerable to unilateral manipulation. Blockchain, on the other hand, operates on a distributed network where multiple nodes validate and maintain the ledger state. In an industrial consortium incorporating plant owners, OEMs, and safety auditors, this ensures that no single participant has unchecked control over shared maintenance records, making the history resistant to silent alteration. [2][4]</p>

    <div class="sec-heading">3.2. Immutability</div>
    <p>One of blockchain's defining characteristics is immutability, meaning once a transaction is committed to the ledger, it cannot be arbitrarily altered or deleted. [2] This is achieved through cryptographic hashing, where each block contains the hash of the previous block, forming a secure chain that prevents unauthorized modifications. Tampering with a historical record would invalidate subsequent blocks and be rejected by the network. This append-only property makes blockchain particularly useful for maintenance audit trails, replaced-part traceability, and preserving historical inspection sign-offs.</p>

    <div class="sec-heading">3.3. Transparency</div>
    <p>Blockchain transactions provide a shared, verifiable history for authorized participants on the network. Through distributed ledger technology (DLT), participating organizations—such as factory operators, maintenance contractors, OEMs, and certified inspectors—access a consistent view of registered machines, maintenance events, and compliance decisions, eliminating the ambiguity of scattered spreadsheets and private logs. [4][7]</p>
    <div class="page-num">04</div>
  </div>
</div>

<!-- ================= PAGE 8: CHAPTER 3 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">3.4. Smart Contracts</div>
    <p>Smart contracts are self-executing programs with predefined business rules embedded directly on the blockchain. Once specified conditions are met, the smart contract automatically validates inputs, enforces role permissions, and executes state transitions without relying on manual administrative checks. In the context of an industrial maintenance system, smart contracts automatically link service records to specific machines, enforce that only authorized engineers can record maintenance, and transition machines to <code>AwaitingInspection</code> until a certified inspector submits a valid passing inspection. [4][5]</p>

    <div class="sec-heading">3.5. Consensus Mechanisms</div>
    <p>Blockchain networks rely on consensus mechanisms to validate transactions, order blocks, and maintain ledger integrity across nodes. Public blockchains have historically used Proof of Work (PoW) or Proof of Stake (PoS), whereas permissioned enterprise blockchains like Hyperledger Fabric use deterministic ordering and endorsement policies (such as Raft-based ordering services). For reproducible academic development and testing, a local Ethereum Virtual Machine (EVM) node such as Hardhat validates and mines signed transactions deterministically under a single development chain ID (31337). [3]</p>

    <div class="sec-heading">3.6. Cryptographic Security</div>
    <p>Blockchain security relies on advanced cryptographic techniques to protect transaction authenticity and document integrity. Each transaction is signed using public-key cryptography (ECDSA on secp256k1), ensuring that only authorized accounts can submit maintenance records or inspection outcomes. Cryptographic hash functions—specifically keccak256 for deterministic on-chain role identifiers and SHA-256 (NIST FIPS 180-4 [9]) for off-chain PDF calibration reports—convert arbitrary data into fixed-length digests.</p>

    <p>Comparing the on-chain SHA-256 digest with the bytes of a retrieved PDF file immediately reveals whether the document has been modified since submission. By combining these key features—decentralization, immutability, shared transparency, smart contracts, consensus, and cryptographic security—blockchain provides a robust foundation for industrial asset maintenance and regulatory compliance.</p>
    <div class="page-num">05</div>
  </div>
</div>

<!-- ================= PAGE 9: CHAPTER 4 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">4. USE CASE OVERVIEW</div>
    <p><strong>EquipLedger</strong> (Industrial Equipment Maintenance &amp; Service Traceability System) is a role-based web and blockchain system that records the operational lifecycle of industrial machinery, maintenance actions, replaced spare parts, off-chain calibration PDF report hashes, and regulatory inspection outcomes. The prototype implements an end-to-end verifiable workflow using React, Express, Node.js, MongoDB, and a Solidity smart contract deployed on a local Hardhat Ethereum node.</p>

    <div class="sec-heading">4.1. Objectives</div>
    <p>The primary objective of EquipLedger is to establish a shared, tamper-evident record of industrial equipment and link every maintenance event and inspection sign-off explicitly to the machine asset. Each registered machine (e.g., <code>EQ-CNC-101</code>, <code>EQ-ROB-204</code>, <code>EQ-HYD-305</code>) maintains its own append-only history arrays for maintenance and inspections directly on-chain.</p>

    <p>A central technical goal is enabling automated equipment lifecycle state enforcement: when a maintenance engineer records a repair, the smart contract automatically transitions the machine status to <code>AwaitingInspection</code>, preventing the asset from being operated until a certified inspector submits a passing inspection transaction. Furthermore, off-chain calibration sheets and safety audit evidence are hashed with SHA-256, allowing instant client-side verification.</p>

    <p>Another vital objective is role-based accountability. Using OpenZeppelin <code>AccessControl</code>, sensitive state-changing operations are restricted to authenticated roles: administrators register machinery and grant roles, engineers log maintenance and parts, inspectors submit pass/fail audit results, and operators monitor equipment status.</p>

    <div class="sec-heading">4.2. Scope of the System</div>
    <p>EquipLedger coordinates five core organizational roles across the industrial plant:</p>
    <ul>
      <li><strong>1. Plant Administrator:</strong> Registers new equipment assets, assigns machine IDs and serial numbers, and authorizes/revokes engineer and inspector wallet addresses.</li>
      <li><strong>2. Maintenance Engineer:</strong> Logs repair actions, records serial numbers of replaced components, and uploads PDF calibration certificates.</li>
      <li><strong>3. Certified Inspector:</strong> Evaluates completed repairs, submits PASSED or FAILED inspection outcomes, and attaches compliance evidence hashes.</li>
      <li><strong>4. Factory Operator:</strong> Monitors real-time machine operational statuses and submits off-chain maintenance request tickets.</li>
      <li><strong>5. External Auditor / Guest:</strong> Inspects machine timelines, verifies document SHA-256 hashes against the ledger, and reviews block transaction receipts in read-only mode.</li>
    </ul>
    <div class="page-num">06</div>
  </div>
</div>

<!-- ================= PAGE 10: CHAPTER 4 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">4.3. System Architecture</div>
    <p>The architecture of EquipLedger consists of three integrated layers:</p>

    <div class="sub-sec-heading">4.3.1. User Layer</div>
    <p>This layer consists of the authorized stakeholders interacting through the React + Vite web interface with an industrial SCADA dark theme:</p>
    <ul>
      <li><strong>Plant Administrator:</strong> Registers machinery, views fleet statistics, and assigns cryptographic roles.</li>
      <li><strong>Maintenance Engineer:</strong> Submits repair logs, enters replaced spare part serials, and attaches calibration PDF files.</li>
      <li><strong>Certified Inspector:</strong> Conducts statutory audits, toggles pass/fail verdicts, and submits compliance evidence.</li>
      <li><strong>Factory Operator:</strong> Submits maintenance work-order requests and monitors machine operational states.</li>
      <li><strong>Auditor:</strong> Reviews the chronological audit timeline and tests document hashes using the built-in verifier tool.</li>
    </ul>

    <div class="sub-sec-heading">4.3.2. Web Application Layer</div>
    <p>This layer connects the browser interface, local document storage, and the blockchain network:</p>
    <ul>
      <li><strong>User Interface (React, Vite, Bootstrap 5):</strong> Provides role-aware views for Asset Fleet Overview, Machine Details &amp; History Timeline, Maintenance Logging, Inspection Certification, Document Verification, and a Role Quick Switcher.</li>
      <li><strong>Application Backend (Node.js, Express.js):</strong> Validates requests, serves REST endpoints, handles multipart PDF uploads via Multer, computes SHA-256 digests using Node's crypto library, and queries the smart contract via ethers.js.</li>
      <li><strong>Off-Chain Database (MongoDB):</strong> Stores supplementary equipment specifications, operator work-order tickets, user profiles, and operational manuals.</li>
    </ul>

    <div class="sub-sec-heading">4.3.3. Blockchain and Off-Chain Storage Layer</div>
    <p>This layer maintains authoritative state and off-chain report files:</p>
    <ul>
      <li><strong>Smart Contract (<code>IndustrialEquipmentRegistry.sol</code>):</strong> Stores Machine structs, MaintenanceRecord structs, InspectionRecord structs, and document hash mappings. Enforces permissions via OpenZeppelin AccessControl.</li>
      <li><strong>Blockchain Network (Hardhat Local EVM Node):</strong> Hosts the compiled contract at Chain ID 31337 on port 8545.</li>
      <li><strong>Off-Chain Storage (<code>backend/uploads/</code>):</strong> Retains raw PDF files on disk while only the 64-character SHA-256 hash is recorded on-chain.</li>
    </ul>
    <div class="page-num">07</div>
  </div>
</div>

<!-- ================= PAGE 11: CHAPTER 4 DIAGRAM ================= -->
<div class="page">
  <div class="border-box">
    <div class="text-center" style="margin-top: 10px;">
      <div style="font-weight: bold; font-size: 13pt; margin-bottom: 15px;">System Architecture Diagram</div>
      <pre class="code-block" style="font-size: 8.5pt; text-align: left; background: #fff; border: 2px solid #222; padding: 12px;">
+---------------------------------------------------------------------------------------+
|                             AUTHORIZED INDUSTRIAL ROLES                               |
|   [Plant Administrator]     [Maintenance Engineer]     [Certified Safety Inspector]   |
|   (Marcus Vance - Admin)    (Elena Rostova - Tech)     (David Chen - ISO Auditor)     |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                    FRONTEND: REACT.JS + VITE SCADA CLIENT (PORT 5173)                 |
|   - SCADA Industrial Theme (Dark Mode)       - Append-Only Machine Timeline           |
|   - Role &amp; Account Quick Switcher            - Drag-and-Drop SHA-256 Verifier         |
|   - Machine Registration Modal               - Web3 Ethers.js v6 Signer Provider      |
+---------------------------------------------------------------------------------------+
                     |                                       |
                     | HTTP REST API                         | Signed Web3 Transactions
                     v                                       v
+---------------------------------------+   +-------------------------------------------+
|    BACKEND: EXPRESS.JS (PORT 5000)    |   |     BLOCKCHAIN: HARDHAT NODE (PORT 8545)  |
| - REST Controllers &amp; Routes           |   |                                           |
|   * /api/machines                     |   | Smart Contract:                           |
|   * /api/documents/verify             |   | IndustrialEquipmentRegistry.sol           |
|   * /api/dashboard                    |   | (Address: 0x5FbDB2315678afecb367f032d93F) |
| - Multer Multipart PDF Storage        |   |                                           |
| - Node.js Crypto SHA-256 Digest Engine|   | - OpenZeppelin AccessControl (RBAC)       |
| - Ethers.js JSON-RPC Provider Sync    |   | - machines[machineId] Mapping             |
+---------------------------------------+   | - machineMaintenanceHistory[] Array       |
         |                      |           | - machineInspectionHistory[] Array        |
         v                      v           | - registeredDocumentHashes Fast Index     |
+------------------+  +-----------------+   +-------------------------------------------+
| DATABASE:        |  | OFF-CHAIN FILE  |                         ^
| MONGODB (27017)  |  | STORAGE         |                         |
| - Machine Specs  |  | /backend/       |                         |
| - Operator Logs  |  | uploads/        |-------------------------+
| - User Profiles  |  | (Raw PDF Files) |   SHA-256 Hash Digest Anchor (0x5a2d7f...)
+------------------+  +-----------------+
      </pre>
    </div>
    <div class="page-num">08</div>
  </div>
</div>

<!-- ================= PAGE 12: CHAPTER 5 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">5. IMPLEMENTATION</div>
    <p>This chapter documents the implementation as it exists in the project workspace. File names, data structures, and API routes are taken directly from the project repository.</p>

    <div class="sec-heading">5.1. Development Environment and Technology Stack</div>
    <p>The system is an Ethereum and Node.js full-stack monorepo built from the components listed in Table 5.1:</p>

    <div class="listing-title">Table 5.1: Technology stack of EquipLedger</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Layer</th>
          <th style="width: 35%;">Technology</th>
          <th>Purpose in EquipLedger</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Blockchain language</td>
          <td>Solidity 0.8.24</td>
          <td>Smart contract <code>IndustrialEquipmentRegistry.sol</code></td>
        </tr>
        <tr>
          <td>Access control &amp; contracts</td>
          <td>OpenZeppelin Contracts v5 (AccessControl)</td>
          <td>Role-based permissions for Admin, Engineer, Inspector, Operator</td>
        </tr>
        <tr>
          <td>Contract tooling</td>
          <td>Hardhat, Chai, Hardhat Toolbox</td>
          <td>Compile, test, run local EVM node (chain ID 31337), deploy &amp; seed</td>
        </tr>
        <tr>
          <td>Blockchain client</td>
          <td>ethers.js v6</td>
          <td>JSON-RPC connection, wallet signer resolution, contract calls &amp; events</td>
        </tr>
        <tr>
          <td>Backend API</td>
          <td>Node.js 22+, Express.js</td>
          <td>REST API, file upload routing, status telemetry &amp; health checks</td>
        </tr>
        <tr>
          <td>Validation &amp; uploads</td>
          <td>Multer, Node.js crypto</td>
          <td>Multipart PDF file upload and SHA-256 cryptographic digest calculation</td>
        </tr>
        <tr>
          <td>Off-chain database</td>
          <td>MongoDB 8.0, Mongoose v8</td>
          <td>Supplementary equipment specifications, operator work orders, users</td>
        </tr>
        <tr>
          <td>Off-chain file storage</td>
          <td>Local filesystem (<code>backend/uploads/</code>)</td>
          <td>Stores uploaded PDF calibration certificates and inspection evidence</td>
        </tr>
        <tr>
          <td>Frontend client</td>
          <td>React 18, Vite 5, Bootstrap 5</td>
          <td>SCADA industrial dashboard, asset fleet overview, document verifier</td>
        </tr>
        <tr>
          <td>Testing suite</td>
          <td>Hardhat Chai matchers, Mocha</td>
          <td>Automated smart contract unit and role-permission test suite</td>
        </tr>
      </tbody>
    </table>
    <div class="page-num">09</div>
  </div>
</div>

<!-- ================= PAGE 13: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">5.2. Project Folder Structure</div>
    <p>The repository is organized as a modular monorepo containing smart contracts, backend API, and frontend web client:</p>

    <div class="listing-title">Listing 5.1: Repository folder structure</div>
    <pre class="code-block">
d:\BlockChain\
├── blockchain/                               # Hardhat smart contract workspace
│   ├── contracts/
│   │   └── IndustrialEquipmentRegistry.sol  # Core ledger contract with OpenZeppelin RBAC
│   ├── scripts/
│   │   └── deploy.js                         # Deployment, role configuration &amp; seed script
│   ├── test/
│   │   └── IndustrialEquipmentRegistry.test.js # Hardhat Chai automated test suite
│   ├── hardhat.config.js                     # Solidity 0.8.24 &amp; network config
│   └── package.json
│
├── backend/                                  # Express.js REST API workspace
│   ├── src/
│   │   ├── config/
│   │   │   ├── blockchain.js                 # ethers.js JsonRpcProvider initialization
│   │   │   └── db.js                         # MongoDB connection with offline fallback
│   │   ├── contracts/
│   │   │   └── contractData.json             # Deployed contract address and ABI
│   │   ├── controllers/                      # Machine, document, and user controllers
│   │   ├── models/                           # Mongoose schemas (Machine, Document, User)
│   │   ├── routes/                           # REST API routes (/api/machines, /api/documents)
│   │   ├── seed.js                           # Database seeding script
│   │   └── server.js                         # Main Express application entrypoint
│   ├── uploads/                              # Off-chain local PDF report storage
│   └── package.json
│
├── frontend/                                 # React + Vite client workspace
│   ├── src/
│   │   ├── components/                       # SCADA layout, Navbar, QuickSwitcher, Modals
│   │   ├── context/
│   │   │   └── BlockchainContext.jsx         # Web3 provider, account state &amp; role switcher
│   │   ├── contracts/
│   │   │   └── contractData.json             # Exported contract ABI &amp; address
│   │   ├── pages/                            # Dashboard, Machines, Verification, History
│   │   ├── App.jsx                           # Main application router
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── start-all.bat                             # Master one-click startup batch script
├── start-blockchain.bat                      # Standalone Hardhat node launcher
├── start-backend.bat                         # Standalone Express API launcher
├── start-frontend.bat                        # Standalone Vite dashboard launcher
└── README.md                                 # Technical documentation
    </pre>
    <div class="page-num">10</div>
  </div>
</div>

<!-- ================= PAGE 14: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">5.3. Smart Contract Design</div>
    <div class="sub-sec-heading">5.3.1. Data Structures and State Mappings</div>
    <p>The core design principle of <code>IndustrialEquipmentRegistry.sol</code> is that every maintenance record and inspection sign-off explicitly references its parent <code>machineId</code>, preserving an append-only on-chain history:</p>

    <div class="listing-title">Listing 5.2: Core structs and state mappings (IndustrialEquipmentRegistry.sol)</div>
    <pre class="code-block">
enum MachineStatus {
    Operational,
    UnderMaintenance,
    AwaitingInspection,
    Decommissioned
}

struct Machine {
    string machineId;
    string name;
    string category;
    string manufacturer;
    string modelNumber;
    string serialNumber;
    string factoryLocation;
    uint256 installationDate;
    uint256 registrationTimestamp;
    address registeredBy;
    bool exists;
    MachineStatus status;
}

struct MaintenanceRecord {
    uint256 recordId;
    string machineId;
    string maintenanceType;
    string problemDescription;
    string workPerformed;
    string partsReplaced;
    address engineer;
    uint256 timestamp;
    string documentHash;
    string metadataURI;
}

struct InspectionRecord {
    uint256 recordId;
    string machineId;
    string inspectionType;
    bool passed;
    string inspectionNotes;
    address inspector;
    uint256 timestamp;
    string evidenceHash;
    string metadataURI;
}

mapping(string => Machine) private machines;
string[] private allMachineIds;
mapping(string => MaintenanceRecord[]) private machineMaintenanceHistory;
mapping(string => InspectionRecord[]) private machineInspectionHistory;
mapping(string => bool) private registeredDocumentHashes;
    </pre>
    <div class="page-num">11</div>
  </div>
</div>

<!-- ================= PAGE 15: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sub-sec-heading">5.3.2. Recording Maintenance, Inspections, and State Updates</div>
    <p>When an engineer records maintenance, the contract verifies <code>MAINTENANCE_ENGINEER_ROLE</code>, pushes the record into <code>machineMaintenanceHistory[machineId]</code>, registers the document hash, and automatically sets the status to <code>AwaitingInspection</code>:</p>

    <div class="listing-title">Listing 5.3: Maintenance and Inspection execution (IndustrialEquipmentRegistry.sol)</div>
    <pre class="code-block">
function addMaintenanceRecord(
    string calldata machineId,
    string calldata maintenanceType,
    string calldata problemDescription,
    string calldata workPerformed,
    string calldata partsReplaced,
    string calldata documentHash,
    string calldata metadataURI
) external onlyRole(MAINTENANCE_ENGINEER_ROLE) machineMustExist(machineId) returns (uint256) {
    require(bytes(maintenanceType).length > 0, "Maintenance type required");
    require(bytes(problemDescription).length > 0, "Problem description required");
    require(bytes(workPerformed).length > 0, "Work performed required");

    uint256 newRecordId = machineMaintenanceHistory[machineId].length;
    MaintenanceRecord memory record = MaintenanceRecord({
        recordId: newRecordId,
        machineId: machineId,
        maintenanceType: maintenanceType,
        problemDescription: problemDescription,
        workPerformed: workPerformed,
        partsReplaced: partsReplaced,
        engineer: msg.sender,
        timestamp: block.timestamp,
        documentHash: documentHash,
        metadataURI: metadataURI
    });

    machineMaintenanceHistory[machineId].push(record);
    if (bytes(documentHash).length > 0) {
        registeredDocumentHashes[documentHash] = true;
    }

    // Automatic lifecycle transition upon service completion
    machines[machineId].status = MachineStatus.AwaitingInspection;

    emit MaintenanceRecorded(machineId, newRecordId, maintenanceType, msg.sender, documentHash, block.timestamp);
    return newRecordId;
}
    </pre>
    <div class="page-num">12</div>
  </div>
</div>

<!-- ================= PAGE 16: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">5.3.3. Design Observations</div>
    <ul>
      <li><strong>Contract-enforced Role Access Control:</strong> Unlike applications that perform authorization only in frontend code, <code>IndustrialEquipmentRegistry.sol</code> uses OpenZeppelin <code>AccessControl</code> (<code>DEFAULT_ADMIN_ROLE</code>, <code>MAINTENANCE_ENGINEER_ROLE</code>, <code>INSPECTOR_ROLE</code>, <code>FACTORY_OPERATOR_ROLE</code>) so unauthorized calls are reverted by the EVM.</li>
      <li><strong>On-Chain Relational Integrity:</strong> Relationships between machines, maintenance interventions, and regulatory inspection reports are stored directly in contract mappings (<code>machineMaintenanceHistory[machineId]</code>), eliminating reliance on a mutable external database for authoritative audit records.</li>
      <li><strong>Automated Safety Interlock:</strong> Maintenance engineers cannot self-certify machinery to <code>Operational</code> status; repairs automatically lock the machine in <code>AwaitingInspection</code>, requiring an authorized inspector to issue a <code>PASSED</code> verdict before the machine can be safely operated.</li>
    </ul>

    <div class="sec-heading">5.4. Contract Deployment and Configuration</div>
    <p>The Hardhat configuration compiles with Solidity 0.8.24 and defines a local development network at <code>http://127.0.0.1:8545</code> with Chain ID 31337. The deployment script (<code>deploy.js</code>):</p>
    <ul>
      <li>Deploys <code>IndustrialEquipmentRegistry.sol</code> using the default deployer account (<code>0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</code>).</li>
      <li>Grants roles to designated demo accounts:
        <ul>
          <li><strong>Engineer:</strong> <code>0x70997970C51812dc3A010C7d01b50e0d17dc79C8</code></li>
          <li><strong>Inspector:</strong> <code>0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC</code></li>
          <li><strong>Operator:</strong> <code>0x90F79bf6EB2c4f870365E785982E1f101E93b906</code></li>
        </ul>
      </li>
      <li>Registers three seed industrial machines: <code>EQ-CNC-101</code> (Haas 5-Axis CNC Milling Center), <code>EQ-ROB-204</code> (KUKA Robotic Arm), and <code>EQ-HYD-305</code> (Schuler 500-Ton Hydraulic Stamping Press).</li>
      <li>Records an initial maintenance record and passed ISO 9001 compliance audit for <code>EQ-CNC-101</code>.</li>
      <li>Exports <code>contractData.json</code> containing the deployed address and ABI to both <code>frontend/src/contracts/</code> and <code>backend/src/contracts/</code>.</li>
    </ul>
    <div class="page-num">13</div>
  </div>
</div>

<!-- ================= PAGE 17: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">5.5. Blockchain Connection and Off-Chain Document Hashing</div>
    <p>The backend service connects to the Hardhat RPC using ethers.js. For off-chain PDF reports, the system saves the file to <code>backend/uploads/</code> and computes the SHA-256 digest of the exact file bytes:</p>

    <div class="listing-title">Listing 5.4: SHA-256 calculation and verification (documentController.js)</div>
    <pre class="code-block">
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function computeFileSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return "0x" + crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

async function verifyDocument(req, res) {
  try {
    const { machineId, docHash } = req.body;
    const contract = getContract();

    if (!contract) {
      return res.status(503).json({ success: false, message: "Blockchain unavailable" });
    }

    // Call on-chain verification method
    const [exists, recordType, timestamp, submitter] = 
      await contract.verifyDocumentHash(machineId, docHash);

    return res.json({
      success: true,
      data: {
        verified: exists,
        status: exists ? "VERIFIED" : "NO_RECORD_FOUND",
        recordType,
        submitter,
        timestamp: Number(timestamp),
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
    </pre>
    <div class="page-num">14</div>
  </div>
</div>

<!-- ================= PAGE 18: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">5.6. Backend API Implementation</div>
    <p>The Express server configures CORS, JSON parsing, Multer file handling, and provides a health check at <code>GET /api/health</code>. Table 5.2 lists the REST API endpoints implemented in the backend:</p>

    <div class="listing-title">Table 5.2: REST API endpoints</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 15%;">Method</th>
          <th style="width: 35%;">Path</th>
          <th style="width: 20%;">Access</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>GET</code></td>
          <td><code>/api/health</code></td>
          <td>Public</td>
          <td>Returns API health, database status, and contract address</td>
        </tr>
        <tr>
          <td><code>GET</code></td>
          <td><code>/api/dashboard</code></td>
          <td>All Roles</td>
          <td>Aggregates machine counts, status breakdown, and recent activity</td>
        </tr>
        <tr>
          <td><code>GET</code></td>
          <td><code>/api/machines</code></td>
          <td>All Roles</td>
          <td>Returns all registered machines merging on-chain &amp; off-chain specs</td>
        </tr>
        <tr>
          <td><code>GET</code></td>
          <td><code>/api/machines/:id</code></td>
          <td>All Roles</td>
          <td>Retrieves machine details, full maintenance history, and inspections</td>
        </tr>
        <tr>
          <td><code>POST</code></td>
          <td><code>/api/machines</code></td>
          <td>Admin</td>
          <td>Registers new equipment asset on-chain and stores specs off-chain</td>
        </tr>
        <tr>
          <td><code>POST</code></td>
          <td><code>/api/machines/:id/maintenance</code></td>
          <td>Engineer</td>
          <td>Logs maintenance action, replaced part serials, and PDF hash</td>
        </tr>
        <tr>
          <td><code>POST</code></td>
          <td><code>/api/machines/:id/inspection</code></td>
          <td>Inspector</td>
          <td>Records PASSED/FAILED audit outcome and updates machine status</td>
        </tr>
        <tr>
          <td><code>POST</code></td>
          <td><code>/api/documents/upload</code></td>
          <td>Authorized</td>
          <td>Multipart PDF upload, computes SHA-256 hash, and saves file</td>
        </tr>
        <tr>
          <td><code>POST</code></td>
          <td><code>/api/documents/verify</code></td>
          <td>Public / Auditor</td>
          <td>Compares uploaded/entered hash against authoritative on-chain state</td>
        </tr>
        <tr>
          <td><code>GET</code></td>
          <td><code>/api/users</code></td>
          <td>All Roles</td>
          <td>Lists pre-funded demonstration accounts and their assigned roles</td>
        </tr>
      </tbody>
    </table>
    <div class="page-num">15</div>
  </div>
</div>

<!-- ================= PAGE 19: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">5.7. On-Chain Data Relationships vs. Off-Chain Storage</div>
    <p>To prevent blockchain bloat while preserving mathematical immutability, data is cleanly segregated:</p>

    <div class="listing-title">Table 5.3: On-chain vs. off-chain data allocation</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35%;">Data Element</th>
          <th style="width: 25%;">Location</th>
          <th>Architectural Reason</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Machine ID, Serial Number, Operational Status</td>
          <td>On-chain (Contract State)</td>
          <td>Shared authoritative asset state accessible across all stakeholders</td>
        </tr>
        <tr>
          <td>Maintenance History, Replaced Parts, Work Logs</td>
          <td>On-chain (Contract State)</td>
          <td>Append-only, immutable service history preventing backdating or deletion</td>
        </tr>
        <tr>
          <td>Inspection Records, Auditor Addresses, Verdicts</td>
          <td>On-chain (Contract State)</td>
          <td>Statutory compliance record preventing fraudulent safety clearances</td>
        </tr>
        <tr>
          <td>SHA-256 PDF Calibration Hashes</td>
          <td>On-chain (Contract State)</td>
          <td>Tamper-evident cryptographic anchor for zero-trust document verification</td>
        </tr>
        <tr>
          <td>Heavy PDF Manuals, High-Res Photos</td>
          <td>Off-chain (<code>backend/uploads/</code>)</td>
          <td>Avoids prohibitive EVM storage gas costs for large binary files</td>
        </tr>
        <tr>
          <td>Supplementary Equipment Specs &amp; Telemetry</td>
          <td>Off-chain (MongoDB)</td>
          <td>Fast off-chain indexing and operator ticket queue management</td>
        </tr>
        <tr>
          <td>User Profile Details &amp; Names</td>
          <td>Off-chain (MongoDB Cache)</td>
          <td>Human-readable directory mapped to on-chain wallet addresses</td>
        </tr>
      </tbody>
    </table>

    <div class="sec-heading">5.8. Authentication and Role-Based Authorization</div>
    <p>In the academic prototype, users select an identity from the top-bar <strong>Role Quick Switcher</strong> (Admin: Marcus Vance, Engineer: Elena Rostova, Inspector: David Chen, Operator: Sarah Jenkins). The client signs transactions using the corresponding pre-funded Hardhat private key. The Solidity contract independently validates <code>onlyRole(...)</code> on every state-changing transaction, rejecting unauthorized callers.</p>
    <div class="page-num">16</div>
  </div>
</div>

<!-- ================= PAGE 20: CHAPTER 5 (Cont.) ================= -->
<div class="page">
  <div class="border-box">
    <div class="sec-heading">5.9. Machine Registration and Deterministic Identification</div>
    <p>A plant administrator registers equipment by providing <code>machineId</code> (e.g., <code>EQ-CNC-101</code>), asset name, manufacturer, model, serial number, and factory location. The smart contract validates that the ID is unique, records the block timestamp, sets status to <code>Operational</code>, and emits <code>MachineRegistered</code>.</p>

    <div class="sec-heading">5.10. Maintenance Logging and Part Traceability Workflows</div>
    <p>When maintenance is performed (e.g., spindle bearing replacement on <code>EQ-CNC-101</code>), the maintenance engineer logs the intervention: problem description, work performed, replaced component serial numbers (e.g., *Optibelt Timing Belt #T10-840*), and uploads the calibration PDF. The computed SHA-256 hash is permanently registered on-chain, and the contract automatically transitions the machine status to <code>AwaitingInspection</code>.</p>

    <div class="sec-heading">5.11. Regulatory Inspection and Audit Workflows</div>
    <p>A certified safety inspector reviews the pending repair, examines calibration tolerances, and submits an inspection transaction with verdict (<code>PASSED</code> or <code>FAILED</code>), inspection notes, and an evidence document hash. If passed, the contract restores the machine to <code>Operational</code>; if failed, it locks the machine in <code>UnderMaintenance</code>.</p>

    <div class="sec-heading">5.12. Frontend Implementation</div>
    <p>The React dashboard provides a cohesive industrial SCADA experience:</p>
    <ul>
      <li><strong>Dashboard:</strong> Displays fleet status metrics, active blockchain connectivity (Chain ID 31337), and recent on-chain events.</li>
      <li><strong>Machine Fleet &amp; Timeline:</strong> Visualizes the chronological, append-only service and inspection history of any selected asset.</li>
      <li><strong>Document Tamper-Verifier:</strong> Drag-and-drop tool that calculates the SHA-256 hash of any PDF in the browser and queries the smart contract in real-time.</li>
      <li><strong>Role Quick Switcher:</strong> Allows 1-click switching between Admin, Engineer, Inspector, and Operator roles for demonstration.</li>
    </ul>

    <div class="sec-heading">5.13. Error Handling and Transaction Confirmation</div>
    <p>All blockchain transactions use <code>await tx.wait()</code>, ensuring user feedback is rendered only after block mining. Reverts (unauthorized roles, empty required fields) are captured and displayed with meaningful error notifications.</p>
    <div class="page-num">17</div>
  </div>
</div>

<!-- ================= PAGE 21: CHAPTER 6 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">6. BENEFITS</div>
    <p>EquipLedger improves industrial maintenance operations by introducing shared traceability, cryptographic document verification, and smart-contract-enforced safety transitions:</p>

    <div class="sec-heading">6.1. Tamper-Evident Maintenance and Incident Audit History</div>
    <p>Every equipment registration, maintenance event, part replacement, and safety inspection is recorded on the blockchain with a block timestamp and transaction hash. Because the smart contract provides no function to overwrite or delete historical records, the maintenance timeline is cryptographically sealed against backdating or deletion. In accident investigations, investigators possess an unalterable log of all historical maintenance actions. [1]</p>

    <div class="sec-heading">6.2. Explicit Asset-to-Service-Event Traceability</div>
    <p>Because every maintenance record and inspection sign-off explicitly references its parent <code>machineId</code> and is indexed on-chain, plant managers can instantly retrieve the complete lifetime service history of any specific machine without manual spreadsheet reconciliation.</p>

    <div class="sec-heading">6.3. Cryptographic Off-Chain Document Integrity</div>
    <p>Recording the SHA-256 digest of each uploaded PDF calibration sheet or inspection report on-chain allows any authorized participant to verify that the retrieved PDF matches the exact bytes registered by the technician. Any alteration to the file after submission produces an immediate <code>INTEGRITY_MISMATCH</code> alert. [9]</p>

    <div class="sec-heading">6.4. Role-Based Multi-Party Plant Accountability</div>
    <p>Write operations are strictly enforced on-chain via OpenZeppelin <code>AccessControl</code> roles tied to cryptographic wallet accounts. Technicians cannot self-approve repairs, operators cannot alter maintenance logs, and administrators cannot overwrite inspection outcomes.</p>
    <div class="page-num">18</div>
  </div>
</div>

<!-- ================= PAGE 22: CHAPTER 7 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">7. CHALLENGES</div>
    <p>While blockchain-backed industrial maintenance systems offer significant architectural advantages, they also present operational challenges:</p>

    <div class="sec-heading">7.1. Trust in Submitted Real-World Data (The Oracle Problem)</div>
    <p>A blockchain cannot independently verify physical reality. Recording a maintenance log and matching SHA-256 PDF hash proves that a specific technician account submitted those bytes at a given time; it does not physically guarantee that the technician actually tightened a bolt to spec or that the physical part installed was authentic. Resolving this requires complementary technologies such as IoT telemetry sensors and RFID part tags.</p>

    <div class="sec-heading">7.2. Prototype Identity Management vs. Production PKI</div>
    <p>In the academic prototype, account switching uses pre-funded local Hardhat private keys and a UI quick switcher. A production enterprise deployment requires integration with organizational PKI, X.509 digital certificates, hardware security modules (HSMs), or smart identity cards.</p>

    <div class="sec-heading">7.3. Off-Chain Document Availability and Storage Durability</div>
    <p>Full PDF reports are stored in a local directory (<code>backend/uploads/</code>). If a local server disk fails, the on-chain SHA-256 hash remains intact on the ledger, but document integrity cannot be verified until the file is restored. Production systems require replicated, access-controlled decentralized storage (e.g., IPFS or enterprise cloud object storage).</p>

    <div class="sec-heading">7.4. EVM Gas Limits and On-Chain Storage Scaling</div>
    <p>Storing strings and history arrays on an EVM blockchain consumes execution gas. While gas costs are zero on a local development network, high-volume manufacturing across hundreds of factories requires Layer-2 rollup architectures or permissioned enterprise frameworks (such as Hyperledger Fabric) to control operating costs.</p>

    <div class="sec-heading">7.5. Consortium Governance and Confidentiality</div>
    <p>In a multi-organization network comprising plant owners, competing contractors, and OEMs, participants must agree on smart-contract upgrade policies and data privacy to ensure proprietary machine parameters are not improperly exposed. [4][7]</p>
    <div class="page-num">19</div>
  </div>
</div>

<!-- ================= PAGE 23: CHAPTER 8 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">8. CONCLUSION</div>
    <p>This report presented the design and prototype implementation of the <strong>Industrial Equipment Maintenance &amp; Service Traceability System (EquipLedger)</strong>. Traditional maintenance management systems suffer from centralized control vulnerabilities, fragmented records across spreadsheets, vulnerability to silent document edits, and manual status tracking. By leveraging an append-only blockchain ledger, explicit asset-to-maintenance indexing, role-based smart-contract access control, and SHA-256 off-chain document verification, the system provides a structured workflow for multi-stakeholder industrial accountability.</p>

    <p>The central contribution of EquipLedger is not simply storing data on a blockchain, but enforcing a controlled lifecycle safety workflow: administrators register uniquely identified industrial equipment, engineers record maintenance actions and replaced component serial numbers alongside calibration PDF digests, the smart contract automatically locks the machine in <code>AwaitingInspection</code>, and certified inspectors submit immutable compliance verdicts before machinery can be re-energized for production. Because the prototype runs on a local Hardhat EVM network with demo accounts, it is presented strictly as an academic prototype.</p>

    <div class="sec-heading">8.1. Future Outlook for Enhancements</div>
    <p>To evolve the prototype toward an enterprise industrial production deployment, several enhancements are planned:</p>
    <ul>
      <li><strong>IoT Sensor Telemetry:</strong> Connecting vibration, temperature, and current sensors directly to smart contracts via Chainlink oracles to trigger automated maintenance work orders when operating parameters exceed safe tolerances.</li>
      <li><strong>Decentralized Object Storage (IPFS):</strong> Upgrading local PDF storage to decentralized content-addressed storage (IPFS/Filecoin) for high availability and permanent pinning of calibration certificates.</li>
      <li><strong>Shop-Floor Hardware Tagging:</strong> Integrating barcode/RFID handheld scanners to scan physical component packaging and bind manufacturer serial numbers directly to blockchain maintenance transactions.</li>
      <li><strong>Zero-Knowledge Proofs (ZKPs):</strong> Implementing zero-knowledge verification to allow external auditors to verify that maintenance was performed according to ISO standards without revealing proprietary manufacturing formulas or machine cycles.</li>
    </ul>
    <div class="page-num">20</div>
  </div>
</div>

<!-- ================= PAGE 24: CHAPTER 9 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">9. SDG's ADDRESSED</div>
    <p>The EquipLedger system conceptually aligns with several United Nations Sustainable Development Goals (SDGs) by promoting resilient industrial infrastructure, sustainable asset lifecycle management, and institutional transparency:</p>

    <div class="sec-heading">SDG 9: Industry, Innovation, and Infrastructure</div>
    <p>The project explores digital infrastructure for exchanging verifiable maintenance records, cryptographic document hashes, and automated smart-contract lifecycle state transitions across manufacturing, maintenance, and inspection organizations, supporting technological modernization in industrial supply chains.</p>

    <div class="sec-heading">SDG 12: Responsible Consumption and Production</div>
    <p>Asset-level traceability and explicit maintenance logging help plant managers identify deteriorating components, enforce timely preventive servicing, and extend the operational lifespan of heavy industrial machinery. Structured maintenance tracking reduces catastrophic machine breakdowns, minimizing the premature scrapping of heavy equipment and reducing hazardous industrial scrap waste.</p>

    <div class="sec-heading">SDG 16: Peace, Justice, and Strong Institutions</div>
    <p>An append-only, time-stamped record of organizational actions—linking every machine registration, maintenance event, part replacement, and inspection decision to an authenticated cryptographic identity—supports transparency, auditability, and fair dispute resolution among plant owners, maintenance contractors, machine manufacturers, and statutory safety agencies.</p>
    <div class="page-num">21</div>
  </div>
</div>

<!-- ================= PAGE 25: CHAPTER 10 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">10. REFERENCES</div>
    <p><strong>[1]</strong> Avnkarthik. <em>AutoTrace: Blockchain-Based Automotive Component Compliance and Traceability System</em> (source code repository). GitHub.</p>
    <p><strong>[2]</strong> IBM. <em>"Renault Case Study: XCEED Blockchain Platform."</em> Accessed October 2026, from https://www.ibm.com/case-studies/renault</p>
    <p><strong>[3]</strong> Hardhat Development Framework. <em>"Ethereum Development Environment for Professionals."</em> Nomic Foundation. Accessed October 2026, from https://hardhat.org/docs</p>
    <p><strong>[4]</strong> OpenZeppelin. <em>"AccessControl - Role-Based Security in Solidity."</em> OpenZeppelin Contracts v5.0. Accessed October 2026, from https://docs.openzeppelin.com/contracts/5.x/api/access#AccessControl</p>
    <p><strong>[5]</strong> V. Buterin. <em>"A Next-Generation Smart Contract and Decentralized Application Platform."</em> Ethereum Whitepaper, 2014. https://ethereum.org/en/whitepaper/</p>
    <p><strong>[6]</strong> Ethers.js Documentation. <em>"Complete, Compact Library for Interacting with the Ethereum Blockchain (v6)."</em> Accessed October 2026, from https://docs.ethers.org/v6/</p>
    <p><strong>[7]</strong> IEEE Transactions on Industrial Informatics. <em>"Blockchain-Enabled Traceability and Predictive Maintenance in Industry 4.0 Systems."</em> Vol. 19, No. 6, pp. 4120-4131, 2023.</p>
    <p><strong>[8]</strong> ISO 9001:2015. <em>"Quality Management Systems — Requirements for Calibration and Traceability in Manufacturing."</em> International Organization for Standardization.</p>
    <p><strong>[9]</strong> National Institute of Standards and Technology (NIST). <em>Secure Hash Standard (SHS)</em>, FIPS PUB 180-4. U.S. Department of Commerce. https://csrc.nist.gov/pubs/fips/180-4/upd1/final</p>
    <div class="page-num">22</div>
  </div>
</div>

<!-- ================= PAGE 26: CHAPTER 11 ================= -->
<div class="page">
  <div class="border-box">
    <div class="ch-heading">11. APPENDIX A</div>
    <div class="sec-heading">A.1. Source Code Repository &amp; Workspace Details</div>
    <p><strong>System Name:</strong> EquipLedger (Industrial Equipment Maintenance &amp; Service Traceability System)</p>
    <p><strong>Local Workspace Directory:</strong> <code>d:\BlockChain\</code></p>
    <p><strong>Smart Contract Address (Local EVM):</strong> <code>0x5FbDB2315678afecb367f032d93F642f64180aa3</code></p>
    <p><strong>Hardhat Local Network:</strong> <code>http://127.0.0.1:8545</code> (Chain ID: <code>31337</code>)</p>
    <p><strong>Express Backend API:</strong> <code>http://localhost:5000</code> (Health endpoint: <code>/api/health</code>)</p>
    <p><strong>Vite React Dashboard:</strong> <code>http://localhost:5173</code></p>

    <div class="sec-heading">Lifecycle Event Types and Resulting Statuses</div>
    <div class="listing-title">Table: Maintenance lifecycle events and resulting machine statuses</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>On-Chain Event</th>
          <th style="text-align: center;">Written On-Chain</th>
          <th>Triggered By</th>
          <th>Resulting Machine Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>MachineRegistered</code></td>
          <td style="text-align: center;">Yes</td>
          <td>Plant Administrator (<code>registerMachine</code>)</td>
          <td><code>Operational</code></td>
        </tr>
        <tr>
          <td><code>MaintenanceRecorded</code></td>
          <td style="text-align: center;">Yes</td>
          <td>Maintenance Engineer (<code>addMaintenanceRecord</code>)</td>
          <td><code>AwaitingInspection</code></td>
        </tr>
        <tr>
          <td><code>InspectionRecorded</code> (PASSED)</td>
          <td style="text-align: center;">Yes</td>
          <td>Certified Inspector (<code>addInspectionRecord</code>)</td>
          <td><code>Operational</code></td>
        </tr>
        <tr>
          <td><code>InspectionRecorded</code> (FAILED)</td>
          <td style="text-align: center;">Yes</td>
          <td>Certified Inspector (<code>addInspectionRecord</code>)</td>
          <td><code>UnderMaintenance</code></td>
        </tr>
        <tr>
          <td><code>MachineStatusUpdated</code></td>
          <td style="text-align: center;">Yes</td>
          <td>Admin / Engineer / Operator (<code>updateMachineStatus</code>)</td>
          <td>Selected Status</td>
        </tr>
        <tr>
          <td><code>EngineerAuthorized</code></td>
          <td style="text-align: center;">Yes</td>
          <td>Administrator (<code>authorizeEngineer</code>)</td>
          <td>Role Assigned</td>
        </tr>
        <tr>
          <td><code>InspectorAuthorized</code></td>
          <td style="text-align: center;">Yes</td>
          <td>Administrator (<code>authorizeInspector</code>)</td>
          <td>Role Assigned</td>
        </tr>
      </tbody>
    </table>
    <div class="page-num">23</div>
  </div>
</div>

</body>
</html>
"""

# Write HTML file
with open("USE_CASE_REPORT_Chintakrinda_Sai_Teja_23501A0527.html", "w", encoding="utf-8") as f:
    f.write(html_content)

# Write Word-compatible DOC file (HTML format with Word MIME metadata)
word_html = """MIME-Version: 1.0
Content-Type: multipart/related; boundary="----=_NextPart_01"

------=_NextPart_01
Content-Location: file:///C:/report.htm
Content-Transfer-Encoding: quoted-printable
Content-Type: text/html; charset="utf-8"

""" + html_content

with open("USE_CASE_REPORT_Chintakrinda_Sai_Teja_23501A0527.doc", "w", encoding="utf-8") as f:
    f.write(word_html)

print("Report generated successfully as HTML and DOC!")
