'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ------------------------------------------------------------------ */
/*  Data: 16 legal topics with comprehensive content                  */
/* ------------------------------------------------------------------ */

interface LegalTopic {
  id: string;
  icon: string;
  color: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  keyProvisions: string[];
  sections: { heading: string; details: string }[];
}

const TOPICS: LegalTopic[] = [
  {
    id: 'constitution',
    icon: '\u{1F3DB}',
    color: 'from-amber-500/20 to-amber-700/10',
    title: 'Constitution of Pakistan 1973',
    shortTitle: 'Constitution',
    category: 'Constitutional',
    description:
      'The supreme law of Pakistan comprising 280 Articles, 12 Parts, and 5 Schedules. It establishes the framework for governance, fundamental rights, and the structure of the state.',
    keyProvisions: [
      'Article 4 -- Right of individuals to be dealt with in accordance with law',
      'Article 8 -- Laws inconsistent with Fundamental Rights to be void',
      'Article 9 -- Security of person; no one shall be deprived of life or liberty save in accordance with law',
      'Article 10 -- Safeguards as to arrest and detention',
      'Article 10A -- Right to fair trial and due process',
      'Article 14 -- Inviolability of dignity of man; privacy of home',
      'Article 17 -- Freedom of association',
      'Article 18 -- Freedom of trade, business or profession',
      'Article 19 -- Freedom of speech',
      'Article 19A -- Right to information',
      'Article 20 -- Freedom to profess religion',
      'Article 22 -- Safeguards regarding educational institutions',
      'Article 23 -- Right to acquire, hold, and dispose of property',
      'Article 25 -- Equality of citizens; no discrimination on basis of sex alone',
      'Article 25A -- Right to education (5-16 years)',
      'Article 184(3) -- Original jurisdiction of Supreme Court on Fundamental Rights',
      'Article 199 -- Jurisdiction of High Courts (Writs)',
      'Article 175 -- Establishment and jurisdiction of courts',
      'Article 227 -- Provisions relating to the Holy Quran and Sunnah',
      'Article 245 -- Functions of Armed Forces',
    ],
    sections: [
      {
        heading: 'Parts of the Constitution',
        details:
          'Part I: Introductory (Art 1-6) | Part II: Fundamental Rights & Policy (Art 7-40) | Part III: Federation of Pakistan (Art 41-100) | Part IV: Provinces (Art 101-140A) | Part V: Relations between Federation & Provinces (Art 141-159) | Part VI: Finance, Property, Contracts & Suits (Art 160-174) | Part VII: The Judicature (Art 175-212B) | Part VIII: Elections (Art 213-226) | Part IX: Islamic Provisions (Art 227-231) | Part X: Emergency Provisions (Art 232-237) | Part XI: Amendment of Constitution (Art 238-239) | Part XII: Miscellaneous (Art 240-280)',
      },
      {
        heading: 'Fundamental Rights (Articles 8-28)',
        details:
          'These are justiciable rights enforceable through courts. Include: right to life & liberty (Art 9), safeguards on arrest (Art 10), right to fair trial (Art 10A), protection against slavery (Art 11), protection against retrospective punishment (Art 12), protection against double punishment (Art 13), dignity of man (Art 14), freedom of movement (Art 15), freedom of assembly (Art 16), freedom of association (Art 17), freedom of trade (Art 18), freedom of speech (Art 19), right to information (Art 19A), freedom of religion (Art 20), safeguard against taxation for religious purposes (Art 21), safeguards on educational institutions (Art 22), right to property (Art 23), protection of property rights (Art 24), equality before law (Art 25), right to education (Art 25A), non-discrimination in public places (Art 26), safeguard against discrimination in services (Art 27), and preservation of language & culture (Art 28).',
      },
      {
        heading: 'Principles of Policy (Articles 29-40)',
        details:
          'Non-justiciable but guide state policy: Islamic way of life (Art 31), promotion of local government (Art 32), discouraging parochial prejudices (Art 33), full participation of women (Art 34), protection of marriage & family (Art 35), protection of minorities (Art 36), promotion of social justice (Art 37), promotion of social & economic well-being (Art 38), participation of people in armed forces (Art 39), strengthening bonds with Muslim world (Art 40).',
      },
      {
        heading: 'Key Constitutional Amendments',
        details:
          '1st Amendment (1974): Ahmadis declared non-Muslim | 8th Amendment (1985): Presidential powers enhanced | 13th Amendment (1997): Stripped presidential dissolution power | 17th Amendment (2003): Restored some presidential powers | 18th Amendment (2010): Provincial autonomy, NFC Award, renamed NWFP to KP, PM powers restored | 19th Amendment (2011): Judicial appointments reform | 21st Amendment (2015): Military courts for terrorism | 25th Amendment (2018): FATA merger with KP | 26th Amendment (2024): Judicial reforms.',
      },
    ],
  },
  {
    id: 'ppc',
    icon: '\u{2696}',
    color: 'from-red-500/20 to-red-700/10',
    title: 'Pakistan Penal Code 1860 (PPC)',
    shortTitle: 'PPC',
    category: 'Criminal',
    description:
      'The principal criminal code of Pakistan containing 511 sections that define offenses and prescribe punishments. Covers everything from murder to cheating.',
    keyProvisions: [
      'S. 299-338 -- Offences affecting the human body (Qatl, Hurt)',
      'S. 302 -- Qatl-i-amd (Intentional murder): Death, life imprisonment, or Diyat',
      'S. 304 -- Qatl-i-khata (Unintentional killing): Diyat',
      'S. 310 -- Diyat (Blood money) value determined by government',
      'S. 319-338 -- Hurt (Itlaf-i-udw, Shajjah, etc.)',
      'S. 339-374 -- Wrongful restraint, confinement, criminal force',
      'S. 354 -- Assault on woman with intent to outrage her modesty',
      'S. 362-374 -- Kidnapping, abduction',
      'S. 375-376 -- Rape (Zina-bil-jabr): Death or 10-25 years',
      'S. 377 -- Unnatural offences',
      'S. 378-462 -- Offences against property (Theft, Extortion, Robbery, Dacoity)',
      'S. 379 -- Theft: Up to 3 years imprisonment',
      'S. 392 -- Robbery: Up to 10 years',
      'S. 395 -- Dacoity: Life imprisonment or up to 10 years',
      'S. 402 -- Assembling for dacoity',
      'S. 403-404 -- Dishonest misappropriation of property',
      'S. 405-409 -- Criminal breach of trust',
      'S. 415-420 -- Cheating: Up to 7 years',
      'S. 463-477A -- Forgery: Up to 7 years',
      'S. 489A-489E -- Counterfeiting currency',
      'S. 499-502 -- Defamation: Up to 2 years',
      'S. 503-510 -- Criminal intimidation, insult, annoyance',
    ],
    sections: [
      {
        heading: 'Classification of Offenses',
        details:
          'Cognizable: Police can arrest without warrant (murder, robbery, dacoity) | Non-cognizable: Warrant needed (defamation, cheating) | Bailable: Bail is a right | Non-bailable: Bail at court discretion | Compoundable: Can be settled between parties (some hurts, defamation) | Non-compoundable: State prosecution must continue (murder before qatl-i-amd reforms).',
      },
      {
        heading: 'Offenses Against the State (S. 121-130)',
        details:
          'S. 121: Waging war against Pakistan (death/life imprisonment) | S. 121A: Conspiracy to wage war | S. 122: Collecting arms for war | S. 123: Concealing sedition | S. 123A: Condemning creation of Pakistan | S. 124: Assaulting President/Governor | S. 124A: Sedition | S. 126-130: Committing depredation on territories of foreign powers at peace with Pakistan.',
      },
      {
        heading: 'Offenses Related to Religion (S. 295-298)',
        details:
          'S. 295: Injuring or defiling place of worship | S. 295A: Deliberate outrage to religious feelings | S. 295B: Defiling the Holy Quran (life imprisonment) | S. 295C: Use of derogatory remarks about the Prophet (PBUH) (mandatory death) | S. 296: Disturbing religious assembly | S. 297: Trespassing on burial places | S. 298: Uttering words with deliberate intent to wound religious feelings | S. 298A-C: Misuse of epithets and titles reserved for holy personalities.',
      },
      {
        heading: 'Punishments under PPC',
        details:
          'Qisas (equal retaliation) | Diyat (blood money) | Arsh (compensation for hurt) | Daman (compensation for damages) | Tazir (discretionary punishment by state) | Death | Life imprisonment (25 years) | Rigorous imprisonment (hard labor) | Simple imprisonment | Fine | Forfeiture of property | Whipping (in Hudood cases).',
      },
    ],
  },
  {
    id: 'crpc',
    icon: '\u{1F46E}',
    color: 'from-blue-500/20 to-blue-700/10',
    title: 'Code of Criminal Procedure 1898 (CrPC)',
    shortTitle: 'CrPC',
    category: 'Procedural',
    description:
      'Governs the procedural mechanism for investigation, inquiry, and trial of criminal offenses. Contains 565 sections covering everything from FIR to execution of sentences.',
    keyProvisions: [
      'S. 4 -- Trial of offences under PPC and other laws',
      'S. 22 -- Local jurisdiction of courts (ordinary criminal courts)',
      'S. 54 -- Arrest without warrant by police officer',
      'S. 61 -- Person arrested not to be detained more than 24 hours',
      'S. 133 -- Conditional order for removal of nuisances',
      'S. 144 -- Power to issue order in urgent cases of nuisance or apprehended danger',
      'S. 145 -- Disputes as to immovable property',
      'S. 154 -- Information in cognizable cases (FIR)',
      'S. 155 -- Information in non-cognizable cases',
      'S. 156 -- Police officer\'s power to investigate',
      'S. 161 -- Examination of witnesses by police',
      'S. 164 -- Recording of confessions and statements before Magistrate',
      'S. 173 -- Report of police officer (Challan)',
      'S. 203 -- Dismissal of complaint',
      'S. 204 -- Issue of process (summons/warrant)',
      'S. 241A -- Framing of charge',
      'S. 242 -- Trial before Magistrate',
      'S. 265D -- Framing of charge in Sessions Court',
      'S. 340 -- Procedure for cross-examination of prosecution witnesses',
      'S. 345 -- Compounding of offences',
      'S. 397 -- Calling for records of inferior courts (Revision)',
      'S. 401 -- High Court\'s powers of revision',
      'S. 426 -- Suspension of sentence pending appeal',
      'S. 435-439 -- Reference and revision by Sessions Judge and High Court',
      'S. 491 -- Power of High Court for directions of habeas corpus',
      'S. 497 -- When bail may be taken in case of non-bailable offence',
      'S. 498 -- Bail before arrest (Pre-arrest/Anticipatory bail)',
      'S. 499-502 -- Amount, bond, and discharge of surety',
      'S. 540 -- Power to summon material witness or examine present person',
      'S. 561A -- Inherent powers of the High Court',
    ],
    sections: [
      {
        heading: 'FIR Process (S. 154)',
        details:
          'Step 1: Informant visits police station | Step 2: Gives oral or written information of cognizable offence | Step 3: SHO records the information (FIR) | Step 4: FIR is read over to informant | Step 5: Informant signs the FIR | Step 6: Copy given to informant free of cost | Step 7: FIR entered in daily diary | Step 8: Investigation begins. Note: If SHO refuses, complaint can be sent to SP or Magistrate under S. 22A(6) of CrPC (as amended in Punjab).',
      },
      {
        heading: 'Types of Bail',
        details:
          'Pre-arrest bail (S. 498): Filed before arrest, protective remedy | Bail after arrest -- Bailable offence (S. 496): Right of accused | Bail after arrest -- Non-bailable offence (S. 497): Court discretion, "reasonable grounds" test | Post-conviction bail (S. 426): Pending appeal | Bail in murder (S. 497): Stricter test, "further inquiry" principle | Transit bail: Temporary, from one court before transfer | Interim bail: Temporary, pending hearing of main bail application.',
      },
      {
        heading: 'Criminal Trial Procedure',
        details:
          'Filing of FIR (S. 154) -> Investigation (S. 156-173) -> Challan/Final Report (S. 173) -> Cognizance by Magistrate (S. 190) -> Commitment to Sessions if applicable (S. 209) -> Charge Framing (S. 241A/265D) -> Prosecution Evidence -> Statement of Accused (S. 342) -> Defence Evidence -> Final Arguments -> Judgment (S. 367) -> Sentencing -> Appeal (S. 410/411).',
      },
      {
        heading: 'Hierarchy of Criminal Courts',
        details:
          'Supreme Court (Appellate & Review) -> High Court (Appeals, Revision S. 397/401, Writs Art. 199, Habeas Corpus S. 491) -> Sessions Court (Sessions trials, appeals from Magistrate) -> Additional Sessions Judge -> Magistrate First Class (can sentence up to 3 years, fine up to Rs. 10,000) -> Magistrate Second Class (up to 1 year, fine Rs. 5,000) -> Magistrate Third Class (up to 1 month, fine Rs. 1,000). Special Courts: Anti-Terrorism, Banking, Drug, NAB, Military.',
      },
    ],
  },
  {
    id: 'cpc',
    icon: '\u{1F4DC}',
    color: 'from-green-500/20 to-green-700/10',
    title: 'Code of Civil Procedure 1908 (CPC)',
    shortTitle: 'CPC',
    category: 'Procedural',
    description:
      'Governs the procedure for civil litigation in Pakistan. Contains 158 sections, 51 Orders, and a First Schedule. It regulates filing, hearing, and disposal of civil suits.',
    keyProvisions: [
      'S. 9 -- Courts to try all civil suits unless barred',
      'S. 10 -- Stay of suit (Res sub judice)',
      'S. 11 -- Res judicata (Bar on re-litigation)',
      'S. 12(2) -- Review of judgment obtained by fraud/misrepresentation',
      'S. 15 -- Court of lowest grade competent to try the suit',
      'S. 16-20 -- Jurisdiction (subject-matter, pecuniary, territorial)',
      'S. 26 -- Institution of suits',
      'S. 33 -- Interest on judgment debts',
      'S. 35 -- Costs',
      'S. 47 -- Questions to be determined by the court executing the decree',
      'S. 51 -- Powers of court to enforce decree',
      'S. 92 -- Public charities and religious endowment suits',
      'S. 94 -- Supplemental proceedings (temporary injunctions)',
      'S. 96 -- Appeal from original decree',
      'S. 100 -- Second appeal (substantial question of law)',
      'S. 104 -- Orders from which appeal lies',
      'S. 114 -- Review',
      'S. 115 -- Revision',
      'S. 141 -- Miscellaneous proceedings',
      'S. 148 -- Enlargement of time',
      'S. 151 -- Inherent powers of the court',
      'S. 152 -- Amendment of judgments, decrees, or orders',
    ],
    sections: [
      {
        heading: 'Important Orders',
        details:
          'Order I: Parties to Suit | Order II: Frame of Suit | Order V: Issue & Service of Summons | Order VI: Pleadings | Order VII: Plaint (R.10 -- Return, R.11 -- Rejection) | Order VIII: Written Statement (30 days, extendable) | Order IX: Appearance of Parties (ex parte decree) | Order XIV: Settlement of Issues | Order XVIII: Hearing & Examination of Witnesses | Order XX: Judgment & Decree | Order XXI: Execution of Decrees | Order XXIII: Withdrawal & Compromise | Order XXVI: Commissions | Order XXXVII: Summary Suits | Order XXXIX: Temporary Injunctions | Order XLI: Appeals from Original Decrees | Order XLIII: Appeals from Orders | Order XLVII: Review.',
      },
      {
        heading: 'Civil Suit Filing Process',
        details:
          'Step 1: Draft plaint (Order VII) with cause of action, relief sought, jurisdiction, valuation | Step 2: Attach necessary documents (Order VII R.14) | Step 3: Pay court fee as per Court Fees Act | Step 4: File in appropriate court (S. 15-20) | Step 5: Court issues summons (Order V) | Step 6: Defendant files Written Statement (Order VIII) within 30 days | Step 7: Framing of issues (Order XIV) | Step 8: Evidence (Order XVIII) | Step 9: Arguments | Step 10: Judgment & Decree (Order XX).',
      },
      {
        heading: 'Types of Decrees and Orders',
        details:
          'Preliminary Decree: Adjudicates rights but further proceedings needed (partition, accounts) | Final Decree: Completely disposes suit | Partly Preliminary, Partly Final | Consent Decree: By agreement of parties | Ex Parte Decree: When defendant fails to appear (Order IX R.6) | Decree on Compromise (Order XXIII R.3). Types of Orders: Interlocutory (during pendency), Final, Appealable (Order XLIII), Non-appealable (revisable under S. 115).',
      },
      {
        heading: 'Limitation Periods (Key)',
        details:
          'Suit for possession of immovable property: 12 years | Suit for movable property: 3 years | Suit for accounts: 3 years | Suit for specific performance of contract: 3 years | Appeal from decree: 30 days (District), 90 days (High Court) | Revision: 90 days | Review: 30 days | Execution of decree: 3 years from date of decree (extendable) | Suit for declaration: 6 years | Tort/compensation: 1 year.',
      },
    ],
  },
  {
    id: 'qanun-e-shahadat',
    icon: '\u{1F4D6}',
    color: 'from-purple-500/20 to-purple-700/10',
    title: 'Qanun-e-Shahadat Order 1984 (Evidence Law)',
    shortTitle: 'Evidence',
    category: 'Procedural',
    description:
      'Replaced the Evidence Act 1872. Governs the admissibility, relevancy, and evaluation of evidence in Pakistani courts. Contains 166 Articles dealing with facts, documents, witnesses, and expert evidence.',
    keyProvisions: [
      'Art. 2 -- Definitions (evidence, fact, relevant, proved, court)',
      'Art. 3 -- Evidence may be given of facts in issue and relevant facts',
      'Art. 17 -- Competence and number of witnesses (2 males or 1 male + 2 females for financial matters under Islamic law)',
      'Art. 27 -- Burden of proof lies on the party who asserts',
      'Art. 36-40 -- Relevancy of statements (res gestae, dying declaration, statements against interest)',
      'Art. 46 -- Relevancy of previous judgments',
      'Art. 59 -- Proof of documents by primary evidence',
      'Art. 70 -- Public documents',
      'Art. 71 -- Private documents',
      'Art. 72-77 -- Presumptions as to documents',
      'Art. 78 -- Exclusion of oral evidence by documentary evidence',
      'Art. 79 -- Proof of electronic/digital evidence',
      'Art. 84 -- Estoppel',
      'Art. 100-113 -- Examination of witnesses (chief, cross, re-examination)',
      'Art. 114 -- Court may presume existence of certain facts',
      'Art. 117 -- Leading questions',
      'Art. 128-133 -- Impeaching credit of witness',
      'Art. 129 -- Previous inconsistent statements',
      'Art. 140-163 -- Privileged communications (professional, spousal)',
    ],
    sections: [
      {
        heading: 'Types of Evidence',
        details:
          'Oral Evidence: Testimony of witnesses in court (Art. 71) | Documentary Evidence: Primary (original documents) and Secondary (copies, certified copies) | Real/Material Evidence: Physical objects presented in court | Circumstantial Evidence: Inferences from facts | Direct Evidence: Eyewitness testimony | Expert Evidence: Opinion of experts (Art. 59) | Electronic Evidence: Digital data, recordings, emails (Art. 164).',
      },
      {
        heading: 'Burden of Proof',
        details:
          'General Rule (Art. 117): Burden lies on the party who asserts a fact | In criminal cases: Prosecution must prove guilt beyond reasonable doubt | In civil cases: Balance of probabilities | Burden shifts: When accused claims exceptions (right of private defence, insanity) | Art. 118: Burden of proving fact especially within knowledge | Art. 119: Burden of proof as to particular fact (alibi, lawful authority).',
      },
      {
        heading: 'Admissibility Rules',
        details:
          'Hearsay: Generally inadmissible, exceptions include dying declaration (Art. 46), res gestae (Art. 19), admissions (Art. 30-35) | Confession: Must be voluntary, before Magistrate (S. 164 CrPC), retracted confession needs corroboration | Expert Opinion: Admissible on foreign law, science, art, handwriting, finger impressions | Character Evidence: In civil -- generally irrelevant; In criminal -- accused can show good character | Illegally obtained evidence: May be admissible if relevant (no exclusionary rule in Pakistan).',
      },
    ],
  },
  {
    id: 'family-law',
    icon: '\u{1F46A}',
    color: 'from-pink-500/20 to-pink-700/10',
    title: 'Family Laws of Pakistan',
    shortTitle: 'Family Laws',
    category: 'Family',
    description:
      'Governed by Muslim Family Laws Ordinance 1961, Family Courts Act 1964, West Pakistan Family Courts Rules, Guardian and Wards Act 1890, Child Marriage Restraint Act, and Dowry and Bridal Gifts (Restriction) Act.',
    keyProvisions: [
      'MFLO S. 4 -- Succession regulated; exclusion of stepchildren',
      'MFLO S. 5 -- Registration of marriages mandatory through Nikah Registrar',
      'MFLO S. 6 -- Polygamy: Written permission from Arbitration Council required',
      'MFLO S. 7 -- Talaq: Notice to Chairman Union Council + 90 days reconciliation period',
      'MFLO S. 8 -- Dissolution of marriage otherwise than by Talaq (Khula)',
      'MFLO S. 9 -- Maintenance: Husband liable, enforceable through Family Court',
      'MFLO S. 10 -- Dower (Mahr): Prompt and deferred',
      'Family Courts Act: Exclusive jurisdiction over marriage, dower, maintenance, dissolution, custody, guardianship, personal property, dowry',
      'Guardian and Wards Act: Welfare of minor is paramount consideration',
      'Custody: Mother entitled up to age 7 (boys) and puberty (girls) under Hanafi law',
      'Hizanat: Right of child custody (mother\'s right in early years)',
      'Iddat: Waiting period -- 3 menstrual cycles or 3 months, or delivery if pregnant',
      'Inheritance: Fixed shares under Islamic law (Faraid)',
    ],
    sections: [
      {
        heading: 'Marriage Requirements',
        details:
          'Proposal (Ijab) and acceptance (Qabool) | Two adult Muslim witnesses | Mehr/Dower (prompt or deferred) | Competence: Sound mind, puberty | Registration mandatory (MFLO S. 5) | Nikahnama (marriage deed) signed by both | Minimum age: 16 for girls, 18 for boys (Child Marriage Restraint Act) | Prohibited degrees of relationship (nasab, rada, musaharat) | Option of puberty (Khyar-ul-buloogh): Marriage by guardian of minor voidable after puberty.',
      },
      {
        heading: 'Divorce Procedures',
        details:
          'Talaq by husband: Written notice to Union Council + copy to wife, effective after 90 days (MFLO S. 7) | Talaq-e-tafweez: Delegated right of divorce to wife in Nikahnama | Khula: Wife seeks dissolution by returning dower, through Family Court (MFLO S. 8) | Mubarat: Mutual consent divorce | Judicial dissolution: Under Dissolution of Muslim Marriages Act 1939 (cruelty, desertion, non-maintenance, impotence, insanity, etc.) | Lian: Dissolution due to false accusation of adultery.',
      },
      {
        heading: 'Maintenance and Custody',
        details:
          'Maintenance: Husband liable during marriage and iddat period | Includes food, clothing, shelter | Wife entitled even if she has own income | Children: Father liable for maintenance of children | Custody (Hizanat): Mother preferred for boys up to 7 years, girls until puberty | After that, father or paternal grandfather | Welfare of child is paramount | Visitation rights for non-custodial parent | Family Court has exclusive jurisdiction.',
      },
      {
        heading: 'Islamic Inheritance (Faraid)',
        details:
          'Fixed shares (Farz): Husband 1/4 (with children) or 1/2 (without); Wife 1/8 (with children) or 1/4 (without); Daughter 1/2 (one) or 2/3 (two or more); Mother 1/6 (with children) or 1/3 (without); Father 1/6 (with children) | Residuaries (Asaba): Son, father, grandfather, brother | Doctrine of Aul: Proportional reduction when shares exceed estate | Doctrine of Radd: Distribution of remainder | S. 4 MFLO: Grandchildren can inherit through predeceased parent.',
      },
    ],
  },
  {
    id: 'transfer-property',
    icon: '\u{1F3E0}',
    color: 'from-teal-500/20 to-teal-700/10',
    title: 'Transfer of Property Act 1882',
    shortTitle: 'Property',
    category: 'Property',
    description:
      'Governs the transfer of property between living persons. Covers sale, mortgage, charge, lease, gift, and exchange of both movable and immovable property.',
    keyProvisions: [
      'S. 5 -- Transfer of property defined (conveyance between living persons)',
      'S. 6 -- What may be transferred (all property unless restricted)',
      'S. 38 -- Transfer by ostensible owner (doctrine of feeding the grant)',
      'S. 40 -- Burden of obligation annexing transferee',
      'S. 41 -- Transfer by ostensible owner (with consent of real owner)',
      'S. 43 -- Transfer by unauthorized person who subsequently acquires interest',
      'S. 52 -- Lis pendens (property subject to pending litigation)',
      'S. 53 -- Fraudulent transfer',
      'S. 54 -- Sale: Transfer of ownership for a price; immovable property over Rs. 100 must be by registered instrument',
      'S. 58 -- Mortgage types defined (simple, usufructuary, English, anomalous)',
      'S. 59 -- Mortgage when to be by assurance (deed required over Rs. 100)',
      'S. 60 -- Right of mortgagor to redeem (equity of redemption)',
      'S. 67 -- Right to foreclose or sue for sale',
      'S. 105 -- Lease defined (right to enjoy for consideration/rent)',
      'S. 106 -- Duration of certain leases (month-to-month in absence of contract)',
      'S. 107 -- Leases how made (registered for over 1 year)',
      'S. 108 -- Rights and liabilities of lessor and lessee',
      'S. 118 -- Gift defined (transfer without consideration)',
      'S. 122 -- Gift of immovable property: Registered instrument + attestation by 2 witnesses',
      'S. 123 -- Gift of movable property: Delivery of possession',
      'S. 126 -- When gift may be suspended or revoked',
      'S. 129 -- Gift in contemplation of death (donatio mortis causa)',
    ],
    sections: [
      {
        heading: 'Types of Mortgage (S. 58)',
        details:
          'Simple Mortgage: Personal obligation to pay, no possession transferred, foreclosure through court sale | Usufructuary Mortgage: Possession transferred, mortgagee takes rents & profits | English Mortgage: Personal obligation + possession transferred, reconveyance on payment | Mortgage by Conditional Sale: Ostensible sale with condition of repurchase | Mortgage by Deposit of Title Deeds: Deposit of documents with intent to create security (equitable mortgage) | Anomalous Mortgage: Combination of above types.',
      },
      {
        heading: 'Sale vs Gift vs Exchange',
        details:
          'Sale (S. 54): Transfer of ownership for price (monetary consideration), registered deed for immovable over Rs. 100, stamp duty payable | Gift (S. 118-129): Transfer without consideration out of love/affection, requires acceptance by donee, revocable in certain cases under Muslim law | Exchange (S. 118): Mutual transfer of ownership, not for money but for property, rights of buyer apply to each party.',
      },
      {
        heading: 'Key Doctrines',
        details:
          'Lis Pendens (S. 52): Property transferred during litigation is subject to outcome | Part Performance (not explicitly in TPA but recognized): Equity protects party who has acted on oral agreement | Feeding the Grant (S. 43): If A transfers B\'s property, and A later acquires it, transfer becomes valid | Ostensible Owner (S. 41): Transfer by apparent owner with real owner\'s consent binds real owner | Fraudulent Transfer (S. 53): Void against creditors | Priority: First registered document prevails.',
      },
    ],
  },
  {
    id: 'contract-act',
    icon: '\u{1F91D}',
    color: 'from-orange-500/20 to-orange-700/10',
    title: 'Contract Act 1872',
    shortTitle: 'Contract',
    category: 'Civil',
    description:
      'Governs the formation, performance, and enforcement of contracts. Contains 238 sections covering general principles of contract, sale of goods, indemnity, guarantee, bailment, agency, and partnership.',
    keyProvisions: [
      'S. 2 -- Definitions (proposal, promise, agreement, contract, void)',
      'S. 10 -- What agreements are contracts (free consent, lawful consideration, competence)',
      'S. 11 -- Competence: Majority (18 years), sound mind, not disqualified by law',
      'S. 14 -- Free consent (no coercion, undue influence, fraud, misrepresentation, mistake)',
      'S. 15 -- Coercion defined',
      'S. 16 -- Undue influence defined',
      'S. 17 -- Fraud defined',
      'S. 18 -- Misrepresentation defined',
      'S. 20-22 -- Mistake (bilateral, unilateral)',
      'S. 23 -- Lawful consideration and object',
      'S. 25 -- Agreement without consideration void (exceptions: love/affection, past services, promise to pay time-barred debt)',
      'S. 26 -- Agreement in restraint of marriage void',
      'S. 27 -- Agreement in restraint of trade void',
      'S. 28 -- Agreement in restraint of legal proceedings void',
      'S. 29 -- Uncertain agreements void',
      'S. 56 -- Agreement to do impossible act void',
      'S. 73 -- Compensation for breach: Loss naturally arising + in contemplation of parties',
      'S. 74 -- Penalty: Reasonable compensation not exceeding penalty amount',
      'S. 75 -- Party rightly rescinding entitled to compensation',
      'S. 124-147 -- Indemnity and Guarantee',
      'S. 148-181 -- Bailment and Pledge',
      'S. 182-238 -- Agency',
    ],
    sections: [
      {
        heading: 'Formation of Contract',
        details:
          'Offer/Proposal (S. 2(a)): Must be definite, communicated, and not expired | Acceptance (S. 2(b)): Must be absolute, unqualified, and communicated | Consideration (S. 2(d)): Past, present, or future; must be lawful | Capacity (S. 11): 18+ years, sound mind | Free Consent (S. 14): No coercion, undue influence, fraud, misrepresentation, or mistake | Lawful Object (S. 23): Not forbidden by law, not immoral, not against public policy.',
      },
      {
        heading: 'Remedies for Breach',
        details:
          'Damages (S. 73): Compensation for loss naturally arising from breach | Special damages: If in contemplation of parties at time of contract | Liquidated damages (S. 74): Pre-agreed amount, court may award "reasonable compensation" up to that amount | Specific Performance: Under Specific Relief Act 1877, court may order performance | Injunction: Court order preventing breach | Rescission: Cancel the contract | Quantum Meruit: Payment for work done before breach.',
      },
      {
        heading: 'Guarantee and Indemnity',
        details:
          'Indemnity (S. 124): A promises to save B from loss; two parties | Guarantee (S. 126): A promises to answer for B\'s default to C; three parties (surety, principal debtor, creditor) | Continuing Guarantee (S. 129): Extends to multiple transactions | Revocation (S. 130): By notice for future transactions | Co-sureties (S. 138): Liable to contribute equally unless agreed otherwise | Surety\'s rights: Subrogation (S. 140), indemnity from principal debtor (S. 145).',
      },
    ],
  },
  {
    id: 'anti-terrorism',
    icon: '\u{1F6E1}',
    color: 'from-red-600/20 to-red-800/10',
    title: 'Anti-Terrorism Act 1997 (ATA)',
    shortTitle: 'Anti-Terrorism',
    category: 'Criminal',
    description:
      'Provides for prevention of terrorism, sectarian violence, and speedy trial of heinous offences. Establishes Anti-Terrorism Courts with exclusive jurisdiction over scheduled offences.',
    keyProvisions: [
      'S. 6 -- Terrorism defined: Act designed to create fear/sense of insecurity, coerce government, create sense of fear in public',
      'S. 7 -- Punishment for acts of terrorism: Death, life imprisonment, or 5-20 years',
      'S. 8 -- Prohibition of acts intended to stir up sectarian hatred',
      'S. 9 -- Fundraising for proscribed organizations',
      'S. 11 -- Penalties for membership of proscribed organizations',
      'S. 11A-11W -- Offences relating to use of firearms, explosive substances, kidnapping for ransom, etc.',
      'S. 12 -- Powers of investigation',
      'S. 13 -- Cognizance by ATC (direct cognizance on police report)',
      'S. 14 -- Procedure for trial (day-to-day hearing)',
      'S. 15 -- Conclusion of trial within 30 working days',
      'S. 16 -- Powers of court to conduct in-camera proceedings',
      'S. 19 -- Appeal to High Court within 30 days of conviction',
      'S. 21F -- Joint Investigation Teams (JIT)',
      'S. 21H -- Protection of witnesses',
      'S. 25 -- Cognizance of scheduled offences only by ATC',
      'Third Schedule -- List of offences triable by ATC',
    ],
    sections: [
      {
        heading: 'Scheduled Offences',
        details:
          'Terrorism under S. 6-7 | Kidnapping for ransom (S. 365A PPC) | Use of firearms/explosives causing death | Hijacking | Attacks on critical infrastructure | Sectarian killings | Targeted killings | Extortion with use of force | Attacks on law enforcement | Suicide bombing | Cyber terrorism | Offences under Explosive Substances Act | Offences under Official Secrets Act | Certain offences under Pakistan Army Act.',
      },
      {
        heading: 'ATC Procedure',
        details:
          'Exclusive jurisdiction over scheduled offences | Day-to-day trial mandatory | Trial to conclude within 30 working days (S. 15) | In-camera proceedings permissible | Witness protection available | Bail: Very strict, nearly equivalent to non-bailable offences | Appeal to High Court within 30 days | Confessions before police officers of SP rank admissible under certain conditions | JIT for investigation of complex cases.',
      },
    ],
  },
  {
    id: 'nab',
    icon: '\u{1F50D}',
    color: 'from-yellow-600/20 to-yellow-800/10',
    title: 'National Accountability Ordinance 1999 (NAB)',
    shortTitle: 'NAB/Accountability',
    category: 'Criminal',
    description:
      'Establishes the National Accountability Bureau for investigation and prosecution of corruption and corrupt practices. Provides for recovery of state money and assets obtained through corruption.',
    keyProvisions: [
      'S. 4 -- Appointment of Chairman NAB (non-extendable 4-year term)',
      'S. 5 -- Functions of NAB: Receive complaints, investigate, prosecute',
      'S. 9 -- Offences: Corruption, corrupt practices, misuse of authority, cheating public at large',
      'S. 9(a) -- Corruption and corrupt practices defined',
      'S. 9(b) -- Assets beyond known sources of income',
      'S. 10 -- Penalty: Up to 14 years imprisonment, fine, disqualification from public office for 10 years',
      'S. 14 -- Power of Chairman to freeze property',
      'S. 15 -- Arrest and remand provisions',
      'S. 16 -- Bail: Only by High Court (very strict)',
      'S. 17 -- Procedure for inquiry and investigation',
      'S. 18 -- Power to call witnesses and documents',
      'S. 21 -- Admissibility of confession before authorized officer',
      'S. 24 -- Trial before Accountability Court',
      'S. 25 -- Trial to conclude within 30 days',
      'S. 25A -- Plea bargain (voluntary return of assets/money)',
      'S. 26 -- Appeal to High Court within 10 days of conviction',
      'S. 27 -- Accused guilty until proved innocent (reversed burden of proof for assets beyond means)',
      'S. 31A -- Voluntary return provisions',
      'S. 33 -- NAB not to interfere in government policy decisions',
    ],
    sections: [
      {
        heading: 'Investigation Process',
        details:
          'Complaint received by NAB | Complaint Verification Cell examines complaint | If prima facie case exists, authorized inquiry | Inquiry by Investigation Officer | If sufficient evidence, Investigation authorized by Chairman | Investigation phase: Powers to freeze assets, arrest, call for documents | Reference filed in Accountability Court | Day-to-day trial | Judgment within 30 days.',
      },
      {
        heading: 'Plea Bargain (S. 25A)',
        details:
          'Accused may apply for plea bargain | Must return all looted money/assets | Chairman NAB may accept | Court approves after satisfaction | Accused is disqualified from public office for 10 years | Conviction is not recorded as such for appeal purposes | Cannot be re-investigated for same offence | Commonly used for swift recovery of public money.',
      },
    ],
  },
  {
    id: 'peca',
    icon: '\u{1F4BB}',
    color: 'from-cyan-500/20 to-cyan-700/10',
    title: 'Prevention of Electronic Crimes Act 2016 (PECA)',
    shortTitle: 'Cyber Crime',
    category: 'Criminal',
    description:
      'Addresses offences committed through information systems and electronic devices. Covers hacking, data theft, cyber stalking, electronic fraud, and online defamation.',
    keyProvisions: [
      'S. 3 -- Unauthorized access to information system: Up to 3 months or fine up to Rs. 50,000',
      'S. 4 -- Unauthorized copying of data: Up to 6 months or fine Rs. 100,000',
      'S. 5 -- Interference with information system or data: Up to 2 years or fine Rs. 500,000',
      'S. 6 -- Glorification of an offence (terrorism): Up to 5 years or fine Rs. 10 million',
      'S. 7 -- Hate speech through electronic means: Up to 7 years or fine Rs. 10 million',
      'S. 8 -- Offences against dignity of a natural person: Up to 3 years or fine Rs. 1 million',
      'S. 9 -- Offences against modesty and minor: Up to 7 years or fine Rs. 5 million',
      'S. 10 -- Child pornography: Up to 7 years or fine Rs. 5 million',
      'S. 11 -- Malicious code (virus/malware): Up to 5 years or fine Rs. 5 million',
      'S. 12 -- Cyber stalking: Up to 3 years or fine Rs. 1 million',
      'S. 13 -- Spamming: Up to 3 months or fine Rs. 50,000',
      'S. 14 -- Spoofing: Up to 3 years or fine Rs. 500,000',
      'S. 15 -- Identity theft: Up to 3 years or fine Rs. 5 million',
      'S. 16 -- Electronic forgery: Up to 3 years or fine Rs. 250,000',
      'S. 17 -- Electronic fraud: Up to 3 years or fine Rs. 250,000 (enhanced for financial fraud)',
      'S. 20 -- Offences by corporate bodies',
      'S. 21 -- Offences against dignity -- enhanced (cyberbullying)',
      'S. 22 -- Unauthorized interception: Up to 2 years',
      'S. 29 -- Investigation by FIA Cyber Crime Wing',
      'S. 30 -- Real-time collection of traffic data',
      'S. 32 -- International cooperation',
      'S. 34 -- Offences triable by designated court (Sessions Court)',
      'S. 36 -- Unlawful online content removal by PTA',
      'S. 37 -- Power to manage and control content',
    ],
    sections: [
      {
        heading: 'Reporting Cyber Crime',
        details:
          'Step 1: File complaint with FIA Cyber Crime Wing (online at fia.gov.pk/ccw or in person at FIA circle office) | Step 2: Attach screenshots, URLs, evidence | Step 3: FIA registers complaint | Step 4: Investigation by FIA (can seek international cooperation) | Step 5: FIA submits challan to designated court | Note: Some offences also reportable to PTA for content removal (S. 36-37) | Helpline: 1991 (FIA Cyber Crime) | Alternative: Direct complaint to court under S. 34.',
      },
      {
        heading: 'Electronic Evidence',
        details:
          'Digital evidence admissible under Art. 164 of QSO and PECA | Must be preserved through proper chain of custody | Forensic examination by FIA or authorized lab | Hash values to prove data integrity | Court can order production of electronic records | Service providers obligated to retain data for minimum 1 year | Real-time data collection possible with court order (S. 30) | Cross-border evidence through mutual legal assistance.',
      },
    ],
  },
  {
    id: 'income-tax',
    icon: '\u{1F4B0}',
    color: 'from-emerald-500/20 to-emerald-700/10',
    title: 'Income Tax Ordinance 2001',
    shortTitle: 'Income Tax',
    category: 'Taxation',
    description:
      'Principal law governing taxation of income in Pakistan. Covers salary, business, property, and capital gains. Also deals with withholding tax, tax credits, and the appellate process.',
    keyProvisions: [
      'S. 4 -- Tax on taxable income at rates specified in First Schedule',
      'S. 11 -- Heads of income: Salary, Property, Business, Capital Gains, Other Sources',
      'S. 12 -- Salary income',
      'S. 15 -- Income from property',
      'S. 18 -- Income from business',
      'S. 37 -- Capital gains on disposal of assets',
      'S. 39 -- Income from other sources',
      'S. 56-58 -- Income not chargeable to tax (exemptions)',
      'S. 59-63 -- Tax credits (charitable donations, investment, education, health)',
      'S. 114 -- Return of income (who must file)',
      'S. 115 -- Tax on return income',
      'S. 120 -- Assessment',
      'S. 122 -- Amendment of assessment (within 5 years)',
      'S. 127 -- Appeal to Commissioner (Appeals)',
      'S. 131 -- Appeal to Appellate Tribunal Inland Revenue (ATIR)',
      'S. 133 -- Reference to High Court on question of law',
      'S. 137 -- Advance tax',
      'S. 148-156 -- Withholding tax (imports, salary, contracts, dividends, etc.)',
      'S. 149 -- Withholding from salary',
      'S. 153 -- Withholding from payments for goods, services, contracts',
      'S. 177 -- Audit by Commissioner',
      'S. 181 -- Offences and penalties',
      'S. 182 -- Penalty for concealment of income',
    ],
    sections: [
      {
        heading: 'Tax Rates (Salaried Individuals - General)',
        details:
          'Up to Rs. 600,000: 0% | Rs. 600,001-1,200,000: 2.5% of amount exceeding Rs. 600,000 | Rs. 1,200,001-2,400,000: Rs. 15,000 + 12.5% exceeding Rs. 1,200,000 | Rs. 2,400,001-3,600,000: Rs. 165,000 + 22.5% exceeding Rs. 2,400,000 | Rs. 3,600,001-6,000,000: Rs. 435,000 + 27.5% exceeding Rs. 3,600,000 | Above Rs. 6,000,000: Rs. 1,095,000 + 35% exceeding Rs. 6,000,000 (rates subject to annual Finance Act amendments).',
      },
      {
        heading: 'Appeal Process',
        details:
          'Step 1: Assessment order by tax officer | Step 2: Appeal to Commissioner (Appeals) within 30 days (S. 127) | Step 3: Appeal to Appellate Tribunal Inland Revenue (ATIR) within 60 days (S. 131) | Step 4: Reference to High Court on question of law within 90 days (S. 133) | Step 5: Appeal to Supreme Court (under Constitution) | Alternative: Application for revision to Commissioner under S. 122A | Alternative Dispute Resolution: ADR Committee under S. 134A.',
      },
    ],
  },
  {
    id: 'company-law',
    icon: '\u{1F3E2}',
    color: 'from-indigo-500/20 to-indigo-700/10',
    title: 'Companies Act 2017',
    shortTitle: 'Company Law',
    category: 'Corporate',
    description:
      'Governs the incorporation, regulation, and winding up of companies in Pakistan. Administered by the Securities & Exchange Commission of Pakistan (SECP). Contains 512 sections.',
    keyProvisions: [
      'S. 2 -- Definitions (company, director, officer, related party)',
      'S. 10 -- Formation of company (by 2+ persons, or 1 for single member)',
      'S. 11 -- Application for incorporation to SECP',
      'S. 16 -- Memorandum of Association (objects, capital, liability)',
      'S. 17 -- Articles of Association (internal governance rules)',
      'S. 21 -- Certificate of incorporation',
      'S. 30 -- Types: Private (Pvt. Ltd.) and Public (Ltd.)',
      'S. 32 -- Private company: Max 50 members, no public offer of shares',
      'S. 46 -- Power of company to issue shares',
      'S. 85 -- Annual General Meeting (AGM) within 4 months of year-end',
      'S. 153 -- Number of directors (min 3 for public, 2 for private)',
      'S. 154 -- Eligibility of directors',
      'S. 166 -- Duties of directors',
      'S. 183 -- Chief Executive Officer',
      'S. 192 -- Related party transactions',
      'S. 223 -- Distribution of dividends',
      'S. 233 -- Accounts and audit requirements',
      'S. 290 -- Mergers and acquisitions',
      'S. 301 -- Winding up by court',
      'S. 305 -- Circumstances for winding up (inability to pay debts, just and equitable)',
      'S. 318 -- Voluntary winding up',
      'S. 436 -- SECP powers of enforcement',
      'S. 468 -- Penalties for non-compliance',
    ],
    sections: [
      {
        heading: 'Incorporation Process',
        details:
          'Step 1: Name availability search on SECP eServices | Step 2: Apply for name reservation | Step 3: Prepare Memorandum & Articles of Association | Step 4: File Form-1 (Declaration of Compliance) and Form-21 (Registered Office) | Step 5: Pay registration fee based on authorized capital | Step 6: SECP issues Certificate of Incorporation | Step 7: Obtain NTN from FBR | Step 8: Open corporate bank account | Step 9: Register with EOBI and PESSI (if employees) | Timeline: 2-3 days through eServices.',
      },
      {
        heading: 'Types of Companies',
        details:
          'Private Limited (Pvt. Ltd.): Min 2 members, max 50, no public offer | Public Limited (Ltd.): Min 3 members, no upper limit, can list on stock exchange | Single Member Company (SMC): One person, private only | Not-for-profit (S. 42): Licensed company without "Limited" | Foreign company (S. 434): Company incorporated outside Pakistan operating in Pakistan | Association not for profit: Requires SECP license, no dividend distribution.',
      },
      {
        heading: 'Winding Up',
        details:
          'Compulsory (by Court) S. 301: On petition by company, creditor, contributory, SECP, or Registrar | Grounds: Unable to pay debts, acting against sovereignty/integrity, just and equitable | Voluntary S. 318: By special resolution of members | Members\' voluntary: Company is solvent | Creditors\' voluntary: Company is insolvent | Liquidator appointed to realize assets and pay creditors | Priority: Secured creditors > Preferential debts (wages, taxes) > Unsecured creditors > Members.',
      },
    ],
  },
  {
    id: 'labor-laws',
    icon: '\u{1F477}',
    color: 'from-lime-500/20 to-lime-700/10',
    title: 'Labor Laws of Pakistan',
    shortTitle: 'Labor Laws',
    category: 'Labor',
    description:
      'Post-18th Amendment, labor is a provincial subject. Key laws include Punjab/Sindh/KP/Balochistan Industrial Relations Acts, Factories Act, Payment of Wages Act, EOBI Act, Workers\' Welfare Fund Ordinance, and Minimum Wages Ordinance.',
    keyProvisions: [
      'Factories Act 1934: Health, safety, working hours, leave',
      'S. 33B: Max 48 hours/week, 9 hours/day',
      'S. 35: Weekly holiday (one day)',
      'S. 49B: Annual leave with pay (14 days)',
      'S. 49D: Casual leave (10 days)',
      'S. 49E: Sick leave (8-16 days depending on province)',
      'Payment of Wages Act 1936: Wages to be paid before 7th (under 1000 workers) or 10th of month',
      'Industrial Relations Act: Registration of trade unions, collective bargaining, strikes/lockouts',
      'Standing Orders: Terms of employment, termination, misconduct',
      'Termination: 1 month notice or pay in lieu; gratuity after 1 year service',
      'EOBI Act 1976: Old age pension, invalidity pension, survivors\' pension',
      'Workers\' Welfare Fund: Education, housing, medical for workers',
      'Minimum Wages: Determined by provincial governments (currently Rs. 37,000/month in Punjab)',
      'Workmen\'s Compensation Act 1923: Compensation for injury/death during employment',
      'Employment of Children Act 1991: Prohibition of child labor under 14',
      'Bonded Labour System (Abolition) Act 1992: Prohibition of bonded/forced labor',
    ],
    sections: [
      {
        heading: 'Termination and Dismissal',
        details:
          'Termination: 1 month written notice or 1 month pay in lieu (for permanent workers) | Misconduct: Show cause notice -> inquiry -> findings -> dismissal order | Grounds for misconduct: Willful disobedience, theft, fraud, habitual absence, striking illegally | Retrenchment: Last in first out, 30 days\' notice, compensation (30 days\' wages per year of service) | Unfair labor practice: Reinstatement + back wages through Labor Court | Gratuity: 30 days\' wages for each year of service (after 1 year).',
      },
      {
        heading: 'Industrial Disputes Resolution',
        details:
          'Step 1: Raise dispute through CBA (Collective Bargaining Agent) | Step 2: Conciliation before Conciliator (15 days) | Step 3: If fails, reference to Labor Court or Arbitrator | Step 4: Labor Court adjudicates (appeal to NIRC/High Court) | Strike: Legal after failure of conciliation, 14 days\' notice | Lockout: Employer\'s counter to strike, same notice required | Illegal strike: During conciliation, without notice, in essential services.',
      },
    ],
  },
  {
    id: 'environmental-law',
    icon: '\u{1F33F}',
    color: 'from-green-600/20 to-green-800/10',
    title: 'Environmental Law of Pakistan',
    shortTitle: 'Environment',
    category: 'Environmental',
    description:
      'Governed by Pakistan Environmental Protection Act 1997 (federal) and provincial EPAs. Covers pollution control, Environmental Impact Assessments (EIA), and environmental tribunals.',
    keyProvisions: [
      'S. 3 -- Pakistan Environmental Protection Council',
      'S. 6 -- National Environmental Quality Standards (NEQS)',
      'S. 11 -- Prohibition on emission/discharge exceeding NEQS',
      'S. 12 -- Environmental Impact Assessment (EIA) required for scheduled projects',
      'S. 13 -- Initial Environmental Examination (IEE) for smaller projects',
      'S. 14 -- Prohibition on import of hazardous waste',
      'S. 15 -- Handling of hazardous substances',
      'S. 16 -- Environmental tribunals for adjudication',
      'S. 17 -- Penalties: Fine Rs. 100,000 + Rs. 1,000 per day for continuing violation',
      'Art. 9 of Constitution: Right to life includes right to clean environment (judicial interpretation)',
      'Art. 184(3): PIL for environmental protection through Supreme Court',
      'Provincial EPAs: Punjab EPA 2012, Sindh EPA 2014, KP EPA 2014, Balochistan EPA',
      'Climate Change Act 2017: Pakistan Climate Change Council, adaptation/mitigation',
    ],
    sections: [
      {
        heading: 'Environmental Impact Assessment (EIA)',
        details:
          'Required for Schedule I projects (major): Highways, dams, large industries, power plants, mining | Initial Environmental Examination (IEE) for Schedule II projects (smaller) | Process: Screening -> Scoping -> EIA Report -> Public Review -> EPA Decision -> Monitoring | EIA must cover: Project description, baseline environment, impact prediction, mitigation measures, monitoring plan | Time limit: EPA must decide within 4 months | Appeal: To Environmental Tribunal within 30 days.',
      },
      {
        heading: 'Landmark Environmental Cases',
        details:
          'Shehla Zia v. WAPDA (1994): Right to life includes right to clean environment under Art. 9 | Rana Aftab Ahmed case: Ordered closure of polluting industry | Lahore Canal Road Widening case: Environmental rights as fundamental rights | Asghar Leghari v. Pakistan (2015): Climate change as violation of fundamental rights (landmark climate justice case) | These cases established public interest litigation (PIL) as a tool for environmental enforcement.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    icon: '\u{1F4A1}',
    color: 'from-violet-500/20 to-violet-700/10',
    title: 'Intellectual Property Laws',
    shortTitle: 'IP Law',
    category: 'Corporate',
    description:
      'Governed by Trade Marks Ordinance 2001, Patents Ordinance 2000, Copyright Ordinance 1962, Registered Designs Ordinance 2000, and administered by the Intellectual Property Organization of Pakistan (IPO-Pakistan).',
    keyProvisions: [
      'Trade Marks Ordinance 2001: Registration, infringement, passing off',
      'S. 3-5: Application for registration at IPO',
      'S. 27: Infringement of registered trade mark',
      'S. 28: Remedies: Injunction, damages, account of profits',
      'S. 40: Well-known marks protection even without registration',
      'Registration validity: 10 years, renewable indefinitely',
      'Patents Ordinance 2000: Protection of inventions',
      'S. 7: Patentable inventions (novel, inventive step, industrial application)',
      'S. 12: Non-patentable (scientific discoveries, mathematical methods, medical treatment methods)',
      'Patent term: 20 years from filing date',
      'S. 30: Rights of patentee (exclusive right to make, use, sell)',
      'S. 41: Compulsory licensing (public interest, dependent patents)',
      'Copyright Ordinance 1962: Protection of literary, musical, artistic, dramatic works',
      'S. 3: Works eligible for copyright protection',
      'S. 4: Copyright automatic, no registration required (but registration available)',
      'Term: Life of author + 50 years (literary/artistic), 50 years (films, sound recordings)',
      'S. 56: Infringement defined',
      'S. 66: Remedies: Injunction, damages, accounts, delivery up',
      'Registered Designs Ordinance 2000: Protection of industrial designs',
      'Design registration: 15 years (5+5+5)',
    ],
    sections: [
      {
        heading: 'Trademark Registration Process',
        details:
          'Step 1: Search IPO database for conflicts | Step 2: File application (Form TM-1) with IPO | Step 3: Examination by Registrar | Step 4: If accepted, published in Trade Marks Journal | Step 5: Opposition period (2 months) | Step 6: If no opposition, registration granted | Step 7: Certificate of registration issued | Timeline: 12-18 months | Classes: Nice Classification (45 classes) | International: Madrid Protocol (Pakistan is member since 2021).',
      },
      {
        heading: 'IP Enforcement',
        details:
          'Civil remedies: Injunction, damages, account of profits, delivery up of infringing goods | Criminal remedies: Imprisonment up to 3 years, fine for trademark counterfeiting | Customs enforcement: Border measures to seize counterfeit goods | FIA role: Investigation of IP crimes | IPO Tribunal: Hears appeals from Registrar decisions | Courts: IP cases in designated civil courts | Pakistan is member of: WIPO, Paris Convention, Berne Convention, PCT, Madrid Protocol, TRIPS (WTO).',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Quick Reference data                                              */
/* ------------------------------------------------------------------ */

const COURT_HIERARCHY = [
  { level: 0, name: 'Supreme Court of Pakistan', note: 'Appellate, Advisory, Review (Art. 184-191)' },
  { level: 1, name: 'Federal Shariat Court', note: 'Repugnancy to Islam (Art. 203A-J)' },
  { level: 1, name: 'High Courts (5)', note: 'Lahore, Sindh, Peshawar, Balochistan, Islamabad (Art. 199)' },
  { level: 2, name: 'District & Sessions Courts', note: 'Original + appellate civil/criminal jurisdiction' },
  { level: 2, name: 'Special Courts/Tribunals', note: 'ATC, Banking, NAB, Labor, Environmental, Tax' },
  { level: 3, name: 'Civil Judge / Magistrate', note: 'First instance civil suits / minor criminal offences' },
  { level: 3, name: 'Family Courts', note: 'Marriage, divorce, custody, maintenance, dower' },
  { level: 4, name: 'Rent Tribunals / Consumer Courts', note: 'Specialized subject-matter jurisdiction' },
];

const FIR_STEPS = [
  'Victim/informant visits the police station having jurisdiction',
  'Oral or written information of a cognizable offence is given to the SHO',
  'SHO is bound to register FIR (S. 154 CrPC) -- refusal is punishable',
  'Information is recorded in the FIR book (prescribed form)',
  'FIR is read over to the informant for verification',
  'Informant signs or affixes thumb impression',
  'Free copy of FIR is given to the informant',
  'Entry made in the Daily Diary (Roznamcha)',
  'Investigation begins immediately (S. 156 CrPC)',
  'If SHO refuses: Application to SP/DPO under S. 154(3) or complaint to Magistrate under S. 22A(6)',
];

const BAIL_TYPES = [
  { type: 'Pre-Arrest Bail (S. 498 CrPC)', desc: 'Before arrest; protective remedy; applicant must show reasonable apprehension of arrest in a non-bailable case. Ad-interim bail may be granted first.' },
  { type: 'Bail in Bailable Offence (S. 496)', desc: 'Right of the accused; police/court must grant bail. Cannot be refused.' },
  { type: 'Bail in Non-Bailable Offence (S. 497)', desc: 'Discretionary; court considers: gravity of charge, nature of evidence, likelihood of absconding, previous record.' },
  { type: 'Post-Conviction Bail (S. 426)', desc: 'Pending appeal; court considers merit of appeal and sentence severity.' },
  { type: 'Interim Bail', desc: 'Temporary bail pending hearing of main bail application; usually 1-2 weeks.' },
  { type: 'Transit Bail', desc: 'Granted by one court for appearance before another court in a different jurisdiction.' },
  { type: 'Bail in Murder (S. 497 proviso)', desc: 'Stricter test: "further inquiry" principle; statutory caution; not a right unless evidence is insufficient.' },
];

const APPEAL_TIMELINES = [
  { from: 'Magistrate/Civil Judge', to: 'District/Sessions Court', period: '30 days', law: 'S. 96 CPC / S. 410 CrPC' },
  { from: 'District/Sessions Court', to: 'High Court', period: '90 days (civil) / 30 days (criminal)', law: 'S. 96/100 CPC / S. 411A CrPC' },
  { from: 'High Court', to: 'Supreme Court', period: '30 days (leave to appeal)', law: 'Art. 185 Constitution' },
  { from: 'ATC', to: 'High Court', period: '30 days', law: 'S. 19 ATA' },
  { from: 'Accountability Court', to: 'High Court', period: '10 days', law: 'S. 26 NAB Ordinance' },
  { from: 'Tax Officer', to: 'Commissioner (Appeals)', period: '30 days', law: 'S. 127 ITO 2001' },
  { from: 'Commissioner (Appeals)', to: 'ATIR', period: '60 days', law: 'S. 131 ITO 2001' },
  { from: 'ATIR', to: 'High Court (Reference)', period: '90 days', law: 'S. 133 ITO 2001' },
  { from: 'Family Court', to: 'District Court', period: '30 days', law: 'S. 14 Family Courts Act' },
  { from: 'Labor Court', to: 'NIRC / High Court', period: '30 days', law: 'Industrial Relations Act' },
  { from: 'Revision (CPC)', to: 'High Court', period: '90 days', law: 'S. 115 CPC' },
  { from: 'Review (CPC)', to: 'Same Court', period: '30 days', law: 'S. 114 / Order XLVII CPC' },
];

const CATEGORIES = ['All', 'Constitutional', 'Criminal', 'Procedural', 'Family', 'Property', 'Civil', 'Taxation', 'Corporate', 'Labor', 'Environmental'];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function LearnPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeQuickRef, setActiveQuickRef] = useState<string>('hierarchy');

  const filteredTopics = useMemo(() => {
    return TOPICS.filter((t) => {
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.shortTitle.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.keyProvisions.some((p) => p.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const toggleTopic = (id: string) => {
    setExpandedTopic(expandedTopic === id ? null : id);
    setExpandedSection(null);
  };

  const toggleSection = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brass-400/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-12 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brass-400/10 border border-brass-400/20 text-brass-300 text-xs font-medium mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Comprehensive Legal Education
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Legal Learning Hub
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-2">
              Your complete guide to Pakistani law. Study every major statute, code, and legal principle
              from the Constitution to Cyber Crime laws -- organized, searchable, and always accessible.
            </p>
            <p className="text-gray-500 text-sm">
              Covering 16 core legal areas with key provisions, procedural steps, court hierarchy, and quick references.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-20">
        {/* Search & Filter */}
        <div className="court-panel p-5 mb-8 sticky top-16 z-30 backdrop-blur-xl bg-navy-950/90">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search topics, sections, articles..."
                className="input-field !pl-10 !border-brass-400/10 focus:!border-brass-400/30 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selectedCategory === cat
                      ? 'bg-brass-400/20 text-brass-300 border-brass-400/30'
                      : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {search && (
            <p className="text-xs text-gray-500 mt-2">
              Showing {filteredTopics.length} of {TOPICS.length} topics
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Main Content -- Topic Cards */}
          <div className="flex-1 min-w-0">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 font-display text-lg">No topics found</p>
                <p className="text-gray-600 text-sm mt-1">Try a different search term or category</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic) => {
                  const isExpanded = expandedTopic === topic.id;
                  return (
                    <div
                      key={topic.id}
                      className={`rounded-xl border transition-all duration-300 ${
                        isExpanded
                          ? 'bg-white/[0.04] border-brass-400/20 shadow-lg shadow-brass-400/5'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-brass-400/10'
                      }`}
                    >
                      {/* Card Header */}
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="w-full text-left p-5 md:p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl border border-white/[0.06]`}
                          >
                            {topic.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display font-semibold text-white text-lg leading-tight">
                                {topic.title}
                              </h3>
                            </div>
                            <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-brass-400/60 bg-brass-400/10 px-2 py-0.5 rounded mb-2">
                              {topic.category}
                            </span>
                            <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                              {topic.description}
                            </p>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-300 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ${
                          isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-5 md:px-6 pb-6 border-t border-brass-400/10">
                          {/* Description (full) */}
                          <p className="text-sm text-gray-400 leading-relaxed pt-4 mb-5">
                            {topic.description}
                          </p>

                          {/* Key Provisions */}
                          <div className="mb-5">
                            <h4 className="text-sm font-semibold text-brass-300 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Key Provisions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                              {topic.keyProvisions.map((provision, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-gray-300 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]"
                                >
                                  <span className="text-brass-400/50 mt-0.5 flex-shrink-0">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                  <span>{provision}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed Sections */}
                          <div>
                            <h4 className="text-sm font-semibold text-brass-300 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              Detailed Breakdown
                            </h4>
                            <div className="space-y-2">
                              {topic.sections.map((section, idx) => {
                                const sectionKey = `${topic.id}-${idx}`;
                                const isSectionExpanded = expandedSection === sectionKey;
                                return (
                                  <div
                                    key={idx}
                                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                                  >
                                    <button
                                      onClick={() => toggleSection(sectionKey)}
                                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                                    >
                                      <span className="text-sm font-medium text-white">
                                        {section.heading}
                                      </span>
                                      <svg
                                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                          isSectionExpanded ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                    <div
                                      className={`overflow-hidden transition-all duration-300 ${
                                        isSectionExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                                      }`}
                                    >
                                      <div className="px-4 pb-4 border-t border-white/[0.04]">
                                        <p className="text-xs text-gray-400 leading-relaxed pt-3 whitespace-pre-wrap">
                                          {section.details.split(' | ').map((part, i) => (
                                            <span key={i} className="block mb-1.5">
                                              <span className="text-brass-400/40 mr-1.5">{'>'}</span>
                                              {part}
                                            </span>
                                          ))}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Reference Sidebar */}
          <aside className="lg:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-36">
              <h2 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brass-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Reference
              </h2>

              {/* Tab Buttons */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[
                  { key: 'hierarchy', label: 'Court Hierarchy' },
                  { key: 'fir', label: 'FIR Process' },
                  { key: 'bail', label: 'Bail Types' },
                  { key: 'appeals', label: 'Appeal Timelines' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveQuickRef(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      activeQuickRef === tab.key
                        ? 'bg-brass-400/15 text-brass-300 border-brass-400/25'
                        : 'bg-white/[0.03] text-gray-500 border-white/[0.06] hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Court Hierarchy */}
              {activeQuickRef === 'hierarchy' && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="text-sm font-semibold text-brass-300 mb-4">Pakistani Court Hierarchy</h3>
                  <div className="space-y-1">
                    {COURT_HIERARCHY.map((court, idx) => (
                      <div key={idx} className="flex items-start gap-2" style={{ paddingLeft: `${court.level * 16}px` }}>
                        <div className="flex flex-col items-center flex-shrink-0 mt-1">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              court.level === 0
                                ? 'bg-brass-400'
                                : court.level === 1
                                ? 'bg-brass-400/70'
                                : court.level === 2
                                ? 'bg-brass-400/40'
                                : court.level === 3
                                ? 'bg-brass-400/25'
                                : 'bg-brass-400/15'
                            }`}
                          />
                          {idx < COURT_HIERARCHY.length - 1 && (
                            <div className="w-px h-4 bg-white/[0.06]" />
                          )}
                        </div>
                        <div className="pb-2">
                          <p className="text-xs font-medium text-white leading-tight">{court.name}</p>
                          <p className="text-[10px] text-gray-500 leading-tight">{court.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FIR Process */}
              {activeQuickRef === 'fir' && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="text-sm font-semibold text-brass-300 mb-4">FIR Registration Process (S. 154 CrPC)</h3>
                  <ol className="space-y-2.5">
                    {FIR_STEPS.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brass-400/15 border border-brass-400/20 flex items-center justify-center text-[10px] font-bold text-brass-300">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-gray-300 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Bail Types */}
              {activeQuickRef === 'bail' && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="text-sm font-semibold text-brass-300 mb-4">Types of Bail in Pakistan</h3>
                  <div className="space-y-3">
                    {BAIL_TYPES.map((bail, idx) => (
                      <div key={idx} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                        <p className="text-xs font-semibold text-white mb-1">{bail.type}</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{bail.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appeal Timelines */}
              {activeQuickRef === 'appeals' && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="text-sm font-semibold text-brass-300 mb-4">Appeal Limitation Periods</h3>
                  <div className="space-y-2">
                    {APPEAL_TIMELINES.map((a, idx) => (
                      <div key={idx} className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] text-gray-400">{a.from}</span>
                          <svg className="w-3 h-3 text-brass-400/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-[10px] text-gray-400">{a.to}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-brass-300">{a.period}</span>
                          <span className="text-[9px] text-gray-600 font-mono">{a.law}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Tips Box */}
              <div className="rounded-xl border border-brass-400/10 bg-brass-400/5 p-5 mt-4">
                <h3 className="text-sm font-semibold text-brass-300 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Study Tips
                </h3>
                <ul className="space-y-1.5">
                  {[
                    'Always read sections in conjunction with relevant case law',
                    'Focus on understanding ratios decidendi, not just holdings',
                    'Practice writing case briefs: Facts, Issue, Held, Reasoning',
                    'Cross-reference statutes -- many provisions overlap',
                    'Use the Constitution as your foundation for all other laws',
                    'Pay special attention to limitation periods and procedural timelines',
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-400">
                      <span className="text-brass-400/50 mt-0.5 flex-shrink-0">*</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
