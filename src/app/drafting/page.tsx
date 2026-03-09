'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { GavelSVG } from '@/components/CourtElements';
import { useToast } from '@/components/Toast';

interface Template {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Criminal', label: 'Criminal' },
  { value: 'Civil', label: 'Civil' },
  { value: 'Constitutional', label: 'Constitutional' },
  { value: 'Family', label: 'Family' },
  { value: 'Property', label: 'Property' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Banking', label: 'Banking' },
  { value: 'Labor', label: 'Labor' },
  { value: 'Consumer', label: 'Consumer' },
];

const TEMPLATES: Template[] = [
  // ===== CRIMINAL =====
  {
    id: 'bail_before_arrest',
    title: 'Pre-Arrest Bail Application',
    category: 'Criminal',
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    content: `IN THE COURT OF [SESSIONS JUDGE / ADDITIONAL SESSIONS JUDGE]
[DISTRICT NAME]

Criminal Miscellaneous No. _______ of [YEAR]

IN THE MATTER OF:

[APPLICANT FULL NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC NUMBER]
Resident of [FULL ADDRESS]
                                                    ... Applicant/Accused

                        VERSUS

THE STATE
Through SHO Police Station [PS NAME]
District [DISTRICT]
FIR No. [FIR NUMBER] dated [FIR DATE]
Under Sections [SECTIONS e.g. 302/324/34 PPC]
                                                    ... Respondent

APPLICATION FOR PRE-ARREST BAIL UNDER SECTION 498 Cr.P.C.

RESPECTFULLY SHEWETH:

1. That the applicant is a respectable citizen and permanent resident of the above-mentioned address. The applicant apprehends arrest in connection with FIR No. [FIR NUMBER] registered at Police Station [PS NAME].

2. That the brief facts of the case are as follows:
[DESCRIBE THE FACTS OF THE CASE IN DETAIL - WHAT HAPPENED, WHEN, WHERE]

3. That the applicant is innocent and has been falsely implicated in this case due to [REASON FOR FALSE IMPLICATION - e.g., personal enmity, property dispute, etc.].

4. GROUNDS FOR BAIL:

   (a) That the applicant is innocent and has not committed the alleged offence.

   (b) That there is no direct evidence against the applicant connecting him/her with the commission of the alleged offence.

   (c) That the applicant is neither a previous convict nor a habitual offender.

   (d) That the investigation of the case has been completed / the applicant is no longer required for investigation purposes.

   (e) That the applicant has deep roots in society and there is no likelihood of absconding or fleeing from justice.

   (f) That the co-accused in the instant case has already been granted bail by this Hon'ble Court / the High Court.

   (g) That keeping the applicant behind bars would serve no useful purpose as the trial is likely to take considerable time.

   (h) [ADD ANY OTHER SPECIFIC GROUNDS]

5. That the applicant is willing to furnish surety bonds and bail bonds to the satisfaction of this Hon'ble Court.

6. That the applicant undertakes to appear before the Court on each and every date of hearing.

PRAYER:

It is, therefore, most respectfully prayed that this Hon'ble Court may graciously be pleased to:

(a) Grant pre-arrest bail to the applicant in FIR No. [FIR NUMBER] registered at Police Station [PS NAME];
(b) Direct the applicant to furnish bail bonds to the satisfaction of this Court;
(c) Any other relief which this Hon'ble Court deems fit and proper in the circumstances of the case.

Dated: [DATE]
Place: [CITY]

                                            ________________________
                                            Advocate for the Applicant
                                            License No. [LICENSE NO]`,
  },
  {
    id: 'bail_after_arrest',
    title: 'Post-Arrest Bail Application',
    category: 'Criminal',
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    content: `IN THE COURT OF [SESSIONS JUDGE / ADDITIONAL SESSIONS JUDGE]
[DISTRICT NAME]

Criminal Miscellaneous No. _______ of [YEAR]

[APPLICANT NAME] Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Currently confined in [JAIL NAME]
                                                    ... Applicant/Accused

                        VERSUS

THE STATE
FIR No. [FIR NUMBER] dated [DATE]
Police Station [PS NAME], District [DISTRICT]
Under Sections [SECTIONS]
                                                    ... Respondent

APPLICATION FOR POST-ARREST BAIL UNDER SECTION 497 Cr.P.C.

RESPECTFULLY SHEWETH:

1. That the applicant has been arrested on [DATE OF ARREST] in connection with the above-mentioned FIR and is currently confined in [JAIL NAME].

2. That the brief facts of the case are:
[DESCRIBE FACTS]

3. That the applicant is innocent and has been falsely implicated in this case.

4. GROUNDS FOR BAIL:

   (a) That no specific role has been attributed to the applicant in the FIR.
   (b) That the prosecution evidence is based on contradictory statements.
   (c) That the applicant has been in custody since [DATE] and the investigation is complete.
   (d) That the challan has already been submitted and further detention serves no useful purpose.
   (e) That the case of the applicant falls within the ambit of further inquiry as envisaged under Section 497(2) Cr.P.C.
   (f) That the applicant is not a flight risk and has permanent roots in society.
   (g) [ADD SPECIFIC GROUNDS]

5. That delay in trial should not be counted against the applicant, and the rule of consistency demands grant of bail.

PRAYER:

It is most respectfully prayed that bail after arrest may be granted to the applicant in the above case on such terms and conditions as this Hon'ble Court may deem appropriate.

Dated: [DATE]
                                            ________________________
                                            Advocate for the Applicant`,
  },
  {
    id: 'fir_quashment',
    title: 'Application for Quashment of FIR',
    category: 'Criminal',
    icon: 'M6 18L18 6M6 6l12 12',
    content: `IN THE [HIGH COURT NAME]
[BENCH AT CITY]

Writ Petition No. _______ of [YEAR]

[PETITIONER NAME] Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Petitioner

                        VERSUS

1. THE STATE through Advocate General [PROVINCE]
2. SHO Police Station [PS NAME], District [DISTRICT]
3. [COMPLAINANT NAME] (if applicable)
                                                    ... Respondent(s)

PETITION UNDER SECTION 561-A Cr.P.C. READ WITH ARTICLE 199 OF THE CONSTITUTION
FOR QUASHMENT OF FIR No. [FIR NUMBER]

RESPECTFULLY SHEWETH:

1. That the petitioner is aggrieved by the registration of FIR No. [FIR NUMBER] dated [DATE] at Police Station [PS NAME] under Sections [SECTIONS] which has been registered without any lawful authority and is an abuse of process of law.

2. BRIEF FACTS:
[DESCRIBE HOW AND WHY THE FIR IS ABUSE OF PROCESS]

3. GROUNDS:

   (a) That the FIR does not disclose commission of any cognizable offence.
   (b) That the FIR has been lodged with mala fide intentions to harass the petitioner.
   (c) That continuation of proceedings would amount to abuse of process of Court.
   (d) That no useful purpose would be served by allowing the investigation to continue.
   (e) [ADD SPECIFIC GROUNDS]

4. That the petitioner has no other adequate or efficacious remedy except to approach this Hon'ble Court.

PRAYER:

It is most respectfully prayed that this Hon'ble Court may:
(a) Accept this petition;
(b) Quash FIR No. [FIR NUMBER] dated [DATE] registered at PS [PS NAME];
(c) Grant any other relief deemed just and proper.

Dated: [DATE]
                                            ________________________
                                            Advocate for the Petitioner`,
  },
  {
    id: 'complaint_u156',
    title: 'Private Complaint (Section 200 CrPC)',
    category: 'Criminal',
    icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
    content: `IN THE COURT OF [MAGISTRATE DESIGNATION]
[DISTRICT NAME]

Complaint Case No. _______ of [YEAR]

[COMPLAINANT NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Complainant

                        VERSUS

[ACCUSED NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC] (if known)
Resident of [ADDRESS]
                                                    ... Accused

COMPLAINT UNDER SECTION 200 Cr.P.C.

RESPECTFULLY SHEWETH:

1. That the complainant is a law abiding citizen residing at the above-mentioned address.

2. That the accused person(s) named above committed the following offence(s):
[DESCRIBE THE OFFENCE IN DETAIL - WHAT, WHEN, WHERE, HOW]

3. That the offence falls under Sections [SECTIONS e.g. 420/468/471 PPC].

4. That the complainant approached Police Station [PS NAME] for registration of FIR but the police [refused to register FIR / did not take action / delayed investigation].

5. That the complainant has the following evidence in support:
   (a) [LIST DOCUMENTARY EVIDENCE]
   (b) [LIST WITNESSES WITH ADDRESSES]
   (c) [ANY OTHER EVIDENCE]

6. That the complainant has not filed any other complaint in any other court regarding this matter.

PRAYER:

It is prayed that this Hon'ble Court may:
(a) Take cognizance of the offence under Sections [SECTIONS];
(b) Summon the accused and proceed according to law;
(c) Punish the accused in accordance with law.

VERIFICATION:

I, [COMPLAINANT NAME], do hereby verify that the contents of this complaint are true and correct to the best of my knowledge and belief.

Dated: [DATE]

                                            ________________________
                                            Complainant / Advocate`,
  },

  // ===== CIVIL =====
  {
    id: 'civil_suit',
    title: 'Plaint (Civil Suit)',
    category: 'Civil',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    content: `IN THE COURT OF [CIVIL JUDGE / SENIOR CIVIL JUDGE]
[DISTRICT NAME]

Civil Suit No. _______ of [YEAR]

[PLAINTIFF NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [FULL ADDRESS]
                                                    ... Plaintiff

                        VERSUS

[DEFENDANT NAME]
Son/Daughter of [FATHER NAME]
Resident of [FULL ADDRESS]
                                                    ... Defendant

SUIT FOR [RECOVERY OF MONEY / SPECIFIC PERFORMANCE / DECLARATION / INJUNCTION / DAMAGES]

VALUE OF SUIT: Rs. [AMOUNT]/-
COURT FEE: Rs. [AMOUNT]/-

The Plaintiff above named most respectfully submits as under:

1. That the plaintiff is a resident of [ADDRESS] and the defendant is a resident of [ADDRESS]. This Hon'ble Court has territorial jurisdiction to try this suit.

2. That the cause of action arose on [DATE] at [PLACE] within the jurisdiction of this Hon'ble Court.

3. FACTS OF THE CASE:

   (a) [DESCRIBE THE RELATIONSHIP BETWEEN PARTIES]
   (b) [DESCRIBE WHAT HAPPENED]
   (c) [DESCRIBE THE GRIEVANCE / BREACH / WRONG]
   (d) [DESCRIBE ATTEMPTS TO RESOLVE - NOTICES SENT ETC.]

4. That the plaintiff has suffered loss/damage to the tune of Rs. [AMOUNT]/- on account of [DESCRIBE].

5. That the suit is within limitation as the cause of action arose on [DATE].

6. That the plaintiff has not filed any other suit regarding this matter in any other court.

7. That the value of the suit for the purposes of jurisdiction and court fee is Rs. [AMOUNT]/-.

PRAYER:

In view of the above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

(a) Decree the suit in favour of the plaintiff and against the defendant;
(b) [SPECIFIC RELIEF SOUGHT - e.g., Direct the defendant to pay Rs. ___];
(c) Award costs of the suit to the plaintiff;
(d) Grant any other relief which this Hon'ble Court deems just and proper.

VERIFICATION:

I, [PLAINTIFF NAME], the plaintiff above named, do hereby verify that the contents of paragraphs 1 to 7 are true to my personal knowledge and belief.

Verified at [PLACE] on [DATE].

                                            ________________________
                                            Plaintiff
                                            Through Advocate [NAME]`,
  },
  {
    id: 'legal_notice',
    title: 'Legal Notice',
    category: 'Civil',
    icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
    content: `LEGAL NOTICE UNDER SECTION 80 C.P.C.

Date: [DATE]
Ref No: [REFERENCE NUMBER]

THROUGH REGISTERED POST / COURIER / TCS

To:
[RECIPIENT NAME]
[DESIGNATION if applicable]
[FULL ADDRESS]

From:
[SENDER NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
[FULL ADDRESS]

Through: [ADVOCATE NAME]
Advocate High Court
[OFFICE ADDRESS]
Contact: [PHONE NUMBER]

Subject: LEGAL NOTICE FOR [BRIEF SUBJECT e.g., Recovery of Amount / Breach of Contract / Defamation / Eviction]

Dear Sir/Madam,

Under instructions from and on behalf of my client, [SENDER NAME], I do hereby serve upon you the following Legal Notice:

1. That my client is [DESCRIBE RELATIONSHIP/STANDING - e.g., the owner of property situated at..., party to an agreement dated...].

2. FACTS:
[DESCRIBE THE COMPLETE FACTS IN NUMBERED PARAGRAPHS]
(a) [FACT 1]
(b) [FACT 2]
(c) [FACT 3]

3. That despite repeated requests, you have failed/refused to [DESCRIBE WHAT THE RECIPIENT FAILED TO DO].

4. That by virtue of your above acts/omissions, you have caused loss and damage to my client to the tune of Rs. [AMOUNT]/-.

5. DEMAND:

You are hereby called upon to [SPECIFIC DEMAND - e.g., pay the outstanding amount of Rs. ___ / vacate the premises / fulfill contractual obligations / cease and desist from defamatory statements] within FIFTEEN (15) days from the receipt of this notice.

6. WARNING:

In the event of your failure to comply with the above demand within the stipulated period, my client shall be constrained to initiate appropriate civil and/or criminal proceedings against you before the competent court of law, at your own risk, cost and consequences, for which you alone shall be responsible.

7. A copy of this notice is being retained in our office for record and future reference.

This notice is issued without prejudice to the rights and remedies available to my client under the law.

                                            ________________________
                                            [ADVOCATE NAME]
                                            Advocate High Court
                                            License No: [LICENSE NO]

CC: [SENDER NAME] - for information and record`,
  },
  {
    id: 'power_of_attorney',
    title: 'General Power of Attorney',
    category: 'Civil',
    icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
    content: `GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS:

That I, [PRINCIPAL NAME], Son/Daughter of [FATHER NAME], CNIC No. [CNIC NUMBER], resident of [FULL ADDRESS] (hereinafter referred to as the "PRINCIPAL") do hereby make, constitute, nominate and appoint:

[ATTORNEY NAME], Son/Daughter of [FATHER NAME], CNIC No. [CNIC NUMBER], resident of [FULL ADDRESS] (hereinafter referred to as the "ATTORNEY")

as my true and lawful Attorney, in my name and on my behalf, to do and execute all or any of the following acts, deeds and things:

1. PROPERTY MATTERS:
   (a) To manage, administer, lease, rent, sell, transfer, or otherwise deal with my property situated at [PROPERTY ADDRESS / DETAILS].
   (b) To execute sale deeds, lease agreements, and all necessary documents.
   (c) To appear before the Sub-Registrar and other authorities for registration of documents.
   (d) To receive and pay rent, taxes, and other charges.

2. LEGAL MATTERS:
   (a) To institute, defend, or compromise any suit, appeal, or proceedings in any Court.
   (b) To appoint, instruct, and change advocates.
   (c) To sign, verify, and present pleadings, applications, and petitions.
   (d) To withdraw or compromise any case on my behalf.

3. FINANCIAL MATTERS:
   (a) To operate my bank account(s) at [BANK NAME AND BRANCH].
   (b) To deposit and withdraw money, sign cheques, and execute banking instruments.
   (c) To receive payments, issue receipts, and acknowledge debts.

4. GOVERNMENT/OFFICIAL MATTERS:
   (a) To appear before and deal with all Government departments, authorities, and bodies.
   (b) To submit applications, obtain NOCs, licenses, permits, and approvals.
   (c) To sign and execute all necessary documents and forms.

5. GENERAL:
   (a) To do all such acts, deeds, and things as may be necessary or expedient for carrying out the above purposes.
   (b) To sub-delegate the powers herein granted, wholly or in part.

I hereby ratify, confirm, and agree to all acts, deeds, and things lawfully done by my said Attorney by virtue of these presents.

This Power of Attorney shall remain in force until revoked by me in writing.

IN WITNESS WHEREOF, I have hereunto set my hand and seal on this [DAY] day of [MONTH], [YEAR] at [CITY].

PRINCIPAL:

________________________
[PRINCIPAL NAME]
CNIC: [CNIC]

IN THE PRESENCE OF:

WITNESS 1:                              WITNESS 2:
Name: _______________                   Name: _______________
CNIC: _______________                   CNIC: _______________
Address: _____________                  Address: _____________
Signature: ___________                  Signature: ___________

NOTARIZED BY:

________________________
Notary Public / Oath Commissioner`,
  },
  {
    id: 'rent_agreement',
    title: 'Rent Agreement / Lease Deed',
    category: 'Property',
    icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z',
    content: `RENT AGREEMENT / LEASE DEED

This Rent Agreement is made and executed on this [DAY] day of [MONTH], [YEAR] at [CITY].

BETWEEN:

[LANDLORD NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
(Hereinafter referred to as the "LANDLORD/LESSOR", which term includes heirs, legal representatives, and assigns)

                            AND

[TENANT NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
(Hereinafter referred to as the "TENANT/LESSEE", which term includes heirs, legal representatives, and assigns)

WHEREAS the Landlord is the owner of the property more particularly described hereunder and has agreed to let out the same to the Tenant on the following terms and conditions:

1. PROPERTY DESCRIPTION:
[FULL ADDRESS AND DESCRIPTION OF THE PROPERTY - Floor, apartment number, area in sq ft, number of rooms, etc.]

2. LEASE PERIOD:
This lease shall be for a period of [DURATION - e.g., 1 year] commencing from [START DATE] and ending on [END DATE], unless renewed by mutual consent.

3. MONTHLY RENT:
The Tenant shall pay a monthly rent of Rs. [AMOUNT]/- (Rupees [AMOUNT IN WORDS] only), payable in advance on or before the [DATE - e.g., 5th] of each month.

4. SECURITY DEPOSIT:
The Tenant has paid a security deposit of Rs. [AMOUNT]/- (Rupees [AMOUNT IN WORDS] only) which shall be refunded without interest upon vacation of the premises after deducting any outstanding dues/damages.

5. UTILITY CHARGES:
All utility bills including electricity, gas, water, and telephone shall be borne and paid by the [TENANT/LANDLORD].

6. MAINTENANCE:
(a) Minor repairs and day-to-day maintenance shall be the responsibility of the Tenant.
(b) Major structural repairs shall be the responsibility of the Landlord.

7. USE OF PREMISES:
The premises shall be used exclusively for [RESIDENTIAL / COMMERCIAL / OFFICE] purposes.

8. SUBLETTING:
The Tenant shall not sublet the premises or any part thereof without prior written consent of the Landlord.

9. TERMINATION:
Either party may terminate this agreement by giving [1/2/3] month(s) written notice to the other party.

10. CONDITION OF PREMISES:
The Tenant shall maintain the premises in good condition and return the same in the condition it was received, subject to normal wear and tear.

11. DISPUTE RESOLUTION:
Any dispute arising out of this agreement shall be resolved through mutual negotiation, failing which through the competent court at [CITY].

12. GOVERNING LAW:
This agreement shall be governed by the [Punjab/Sindh/KPK/Balochistan] Rented Premises Act and other applicable laws.

IN WITNESS WHEREOF, both parties have signed this agreement on the date first mentioned above.

LANDLORD:                               TENANT:
________________________                ________________________
[LANDLORD NAME]                         [TENANT NAME]
CNIC: [CNIC]                            CNIC: [CNIC]

WITNESSES:
1. Name: _______________    CNIC: _______________    Signature: _______________
2. Name: _______________    CNIC: _______________    Signature: _______________`,
  },

  // ===== CONSTITUTIONAL =====
  {
    id: 'writ_petition',
    title: 'Writ Petition (Article 199)',
    category: 'Constitutional',
    icon: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z',
    content: `IN THE [LAHORE / SINDH / PESHAWAR / BALOCHISTAN / ISLAMABAD] HIGH COURT
[BENCH AT CITY]

Writ Petition No. _______ of [YEAR]

[PETITIONER NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Petitioner

                        VERSUS

1. [RESPONDENT 1 - e.g., Federation of Pakistan through Secretary, Ministry of ___]
2. [RESPONDENT 2 - Government Department / Official]
3. [RESPONDENT 3 - if applicable]
                                                    ... Respondent(s)

CONSTITUTIONAL PETITION UNDER ARTICLE 199 OF THE CONSTITUTION OF THE ISLAMIC REPUBLIC OF PAKISTAN, 1973

RESPECTFULLY SHEWETH:

1. That the petitioner is a citizen of Pakistan and invokes the jurisdiction of this Hon'ble Court under Article 199 of the Constitution.

2. BRIEF FACTS:
[PARAGRAPH-WISE DETAILED FACTS OF THE CASE]

3. FUNDAMENTAL RIGHTS VIOLATED:
The impugned action/order violates the following Fundamental Rights of the Petitioner:
   (a) Article 4 - Right of individuals to be dealt with in accordance with law
   (b) Article 9 - Security of person
   (c) Article 10A - Right to fair trial and due process
   (d) Article 14 - Inviolability of dignity of man
   (e) Article 18 - Freedom of trade, business or profession
   (f) Article 23 - Provision as to property
   (g) Article 25 - Equality of citizens
   [SPECIFY WHICH ARTICLES ARE ACTUALLY VIOLATED]

4. GROUNDS:
   (a) That the impugned action/order is without lawful authority and of no legal effect.
   (b) That the impugned action is mala fide, arbitrary, and discriminatory.
   (c) That principles of natural justice have been violated.
   (d) That the petitioner was not afforded a reasonable opportunity of being heard.
   (e) [ADD SPECIFIC LEGAL GROUNDS]

5. That the petitioner has no other adequate remedy available under the law.

6. That no similar petition has been filed before any other Court.

PRAYER:

It is, therefore, most respectfully prayed that this Hon'ble Court may graciously be pleased to:

(a) Accept this petition;
(b) Declare the impugned action/order dated [DATE] as illegal, without lawful authority, and of no legal effect;
(c) Issue a writ of [mandamus/certiorari/prohibition/quo warranto/habeas corpus] directing [SPECIFIC DIRECTION];
(d) Grant costs of this petition;
(e) Grant any other relief which this Hon'ble Court deems just and proper.

Dated: [DATE]

                                            ________________________
                                            Advocate for the Petitioner
                                            License No: [LICENSE NO]`,
  },

  // ===== FAMILY =====
  {
    id: 'khula_application',
    title: 'Khula Application (Wife)',
    category: 'Family',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    content: `IN THE COURT OF FAMILY JUDGE
[DISTRICT NAME]

Suit No. _______ of [YEAR]

[WIFE NAME]
Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Plaintiff/Wife

                        VERSUS

[HUSBAND NAME]
Son of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Defendant/Husband

SUIT FOR KHULA / DISSOLUTION OF MARRIAGE UNDER
THE DISSOLUTION OF MUSLIM MARRIAGES ACT, 1939
AND WEST PAKISTAN FAMILY COURTS ACT, 1964

RESPECTFULLY SHEWETH:

1. That the plaintiff/wife was married to the defendant/husband on [MARRIAGE DATE] according to Muslim rites at [PLACE]. The Nikah was solemnized by [NIKAH KHAWAN NAME] and was duly registered with Union Council [UC NAME/NUMBER].

2. That the Haq Mehr (dower) fixed at the time of marriage was Rs. [AMOUNT]/- [PROMPT/DEFERRED].

3. That [NUMBER] children were born out of this wedlock, namely:
   (a) [CHILD NAME], aged [AGE], [GENDER]
   (b) [CHILD NAME], aged [AGE], [GENDER]

4. GROUNDS FOR KHULA:

   (a) That the defendant has been treating the plaintiff with cruelty - [DESCRIBE].
   (b) That the defendant has failed to maintain the plaintiff - [DESCRIBE].
   (c) That the conjugal relationship between the parties has irretrievably broken down.
   (d) That it is impossible for the parties to live within the limits prescribed by Almighty Allah.
   (e) [ADD SPECIFIC GROUNDS]

5. That the plaintiff is willing to return the Haq Mehr / benefits received at the time of marriage.

6. That reconciliation has been attempted but has failed, and there is no possibility of the parties living together as husband and wife.

PRAYER:

(a) That this Hon'ble Court may be pleased to dissolve the marriage between the plaintiff and the defendant by way of Khula;
(b) That the custody of minor children may be granted to the plaintiff;
(c) That the defendant be directed to pay maintenance for the minor children;
(d) That the dowry articles be returned to the plaintiff;
(e) Any other relief deemed just and proper.

Dated: [DATE]

                                            ________________________
                                            Advocate for the Plaintiff`,
  },
  {
    id: 'child_custody',
    title: 'Custody (Hizanat) Petition',
    category: 'Family',
    icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    content: `IN THE COURT OF FAMILY JUDGE / GUARDIAN JUDGE
[DISTRICT NAME]

Guardian Petition No. _______ of [YEAR]

[PETITIONER NAME (Mother/Father)]
[RELATIONSHIP]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Petitioner

                        VERSUS

[RESPONDENT NAME]
[RELATIONSHIP]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Respondent

PETITION UNDER SECTION 25 OF THE GUARDIANS AND WARDS ACT, 1890
FOR CUSTODY (HIZANAT) OF MINOR CHILD(REN)

RESPECTFULLY SHEWETH:

1. That the petitioner is the [MOTHER/FATHER] of the following minor child(ren):
   (a) [CHILD NAME], born on [DATE OF BIRTH], aged [AGE]
   (b) [CHILD NAME], born on [DATE OF BIRTH], aged [AGE]

2. That the petitioner was married to the respondent on [DATE] and the marriage was dissolved on [DATE] through [KHULA/DIVORCE/COURT DECREE].

3. That since the dissolution of marriage, the minor child(ren) [is/are] in the custody of the [RESPONDENT/OTHER PERSON] which is against the welfare of the minor(s).

4. GROUNDS:

   (a) Under Muslim Personal Law, the mother has the preferential right of custody (Hizanat) for boys up to the age of 7 years and for girls until puberty.
   (b) The petitioner is a fit and proper person to have custody of the minor child(ren).
   (c) The welfare of the minor child(ren) demands that custody be granted to the petitioner.
   (d) [DESCRIBE WHY THE CURRENT CUSTODY ARRANGEMENT IS HARMFUL]
   (e) [ADD SPECIFIC GROUNDS]

5. That the petitioner has adequate means and resources to maintain and educate the minor child(ren).

PRAYER:

(a) That custody of the minor child(ren) be granted to the petitioner;
(b) That the respondent be directed to pay maintenance for the minor child(ren);
(c) That reasonable visitation rights be granted to the respondent;
(d) Any other relief deemed just and proper.

Dated: [DATE]

                                            ________________________
                                            Advocate for the Petitioner`,
  },
  {
    id: 'nikah_registration',
    title: 'Nikah Registration Application',
    category: 'Family',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
    content: `APPLICATION FOR REGISTRATION OF NIKAH / MARRIAGE

To:
The Nikah Registrar / Chairman
Union Council No. [UC NUMBER]
[TEHSIL / TOWN], [DISTRICT]

Subject: Application for Registration of Nikah

Respected Sir,

It is respectfully submitted that the Nikah/Marriage between the following persons was solemnized on [DATE OF NIKAH] at [PLACE OF NIKAH]:

DETAILS OF HUSBAND (BRIDEGROOM):
Name: [HUSBAND FULL NAME]
Father's Name: [FATHER NAME]
CNIC No: [CNIC]
Date of Birth: [DOB]
Age at Marriage: [AGE]
Marital Status: [BACHELOR / DIVORCED / WIDOWER]
Occupation: [OCCUPATION]
Permanent Address: [FULL ADDRESS]
Present Address: [FULL ADDRESS]

DETAILS OF WIFE (BRIDE):
Name: [WIFE FULL NAME]
Father's Name: [FATHER NAME]
CNIC No: [CNIC]
Date of Birth: [DOB]
Age at Marriage: [AGE]
Marital Status: [MAIDEN / DIVORCED / WIDOW]
Occupation: [OCCUPATION]
Permanent Address: [FULL ADDRESS]
Present Address: [FULL ADDRESS]

DETAILS OF NIKAH:
Nikah Khawan/Solemnizer: [NAME]
Date of Nikah: [DATE]
Place of Nikah: [ADDRESS]

HAQ MEHR (DOWER):
Prompt (Muajjal): Rs. [AMOUNT]/-
Deferred (Muwajjal): Rs. [AMOUNT]/-
Total: Rs. [AMOUNT]/-

WITNESSES:
1. Name: [WITNESS 1 NAME], CNIC: [CNIC], Address: [ADDRESS]
2. Name: [WITNESS 2 NAME], CNIC: [CNIC], Address: [ADDRESS]

WALI (GUARDIAN) OF BRIDE:
Name: [WALI NAME]
Relationship: [RELATIONSHIP]
CNIC: [CNIC]

It is requested that the above Nikah may kindly be registered in accordance with the Muslim Family Laws Ordinance, 1961 and the relevant rules.

Dated: [DATE]

Husband: _______________     Wife: _______________
Nikah Khawan: _______________

Enclosures:
1. Copies of CNIC of Bride and Groom
2. Copies of CNIC of Witnesses
3. Copy of CNIC of Wali
4. Photographs (if required)
5. Previous Nikah Nama / Divorce Deed (if applicable)`,
  },

  // ===== PROPERTY =====
  {
    id: 'sale_agreement',
    title: 'Sale Agreement (Property)',
    category: 'Property',
    icon: 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819',
    content: `AGREEMENT TO SELL IMMOVABLE PROPERTY

This Agreement to Sell is made and executed on this [DAY] day of [MONTH], [YEAR] at [CITY].

BETWEEN:

SELLER/VENDOR:
[SELLER NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
(Hereinafter referred to as the "SELLER")

                            AND

BUYER/VENDEE:
[BUYER NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
(Hereinafter referred to as the "BUYER")

WHEREAS the Seller is the absolute and lawful owner of the immovable property described below and has agreed to sell the same to the Buyer on the following terms and conditions:

1. DESCRIPTION OF PROPERTY:
   Type: [RESIDENTIAL / COMMERCIAL / AGRICULTURAL / PLOT]
   Address: [COMPLETE ADDRESS]
   Area: [AREA IN MARLAS/KANALS/SQ FT/SQ YARDS]
   Khasra No: [KHASRA NUMBER]
   Khata No: [KHATA NUMBER]
   Khatooni No: [KHATOONI NUMBER]
   Mouza/Scheme: [MOUZA/HOUSING SCHEME NAME]
   Tehsil: [TEHSIL]
   District: [DISTRICT]
   Bounded as follows:
   North: [BOUNDARY]
   South: [BOUNDARY]
   East: [BOUNDARY]
   West: [BOUNDARY]

2. TOTAL SALE PRICE: Rs. [AMOUNT]/- (Rupees [AMOUNT IN WORDS] only)

3. PAYMENT SCHEDULE:
   (a) Earnest Money / Token: Rs. [AMOUNT]/- paid on [DATE] (receipt acknowledged)
   (b) Second Installment: Rs. [AMOUNT]/- due on [DATE]
   (c) Balance Amount: Rs. [AMOUNT]/- at the time of transfer/registry

4. TRANSFER/REGISTRY:
   The Seller shall execute the registered Sale Deed (Bay Nama) in favour of the Buyer or his nominee on or before [DATE] upon receipt of the full sale consideration.

5. CLEAR TITLE:
   The Seller hereby warrants that:
   (a) The property is free from all encumbrances, liens, charges, and litigation.
   (b) The Seller has clear and marketable title to the property.
   (c) All taxes, charges, and dues up to the date of transfer shall be paid by the Seller.

6. POSSESSION:
   Physical possession of the property shall be handed over to the Buyer on [DATE / upon execution of Sale Deed].

7. DEFAULT:
   (a) If the Buyer defaults, the Seller shall be entitled to forfeit the earnest money.
   (b) If the Seller defaults, the Seller shall return double the earnest money to the Buyer.

8. EXPENSES:
   All stamp duty, registration charges, and transfer fees shall be borne by the [BUYER/SELLER/EQUALLY].

9. JURISDICTION:
   The Courts at [CITY] shall have exclusive jurisdiction in case of any dispute.

IN WITNESS WHEREOF, both parties have signed this agreement in the presence of witnesses.

SELLER:                                 BUYER:
________________________                ________________________
[SELLER NAME]                           [BUYER NAME]
CNIC: [CNIC]                            CNIC: [CNIC]

WITNESSES:
1. Name: _______________    CNIC: _______________    Signature: _______________
2. Name: _______________    CNIC: _______________    Signature: _______________`,
  },

  // ===== CORPORATE =====
  {
    id: 'partnership_deed',
    title: 'Partnership Deed',
    category: 'Corporate',
    icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    content: `PARTNERSHIP DEED

This Partnership Deed is made and executed on this [DAY] day of [MONTH], [YEAR] at [CITY].

BETWEEN:

1. [PARTNER 1 NAME], Son/Daughter of [FATHER], CNIC: [CNIC], Resident of [ADDRESS]
   (Hereinafter referred to as the "First Partner")

2. [PARTNER 2 NAME], Son/Daughter of [FATHER], CNIC: [CNIC], Resident of [ADDRESS]
   (Hereinafter referred to as the "Second Partner")

3. [PARTNER 3 NAME], Son/Daughter of [FATHER], CNIC: [CNIC], Resident of [ADDRESS]
   (Hereinafter referred to as the "Third Partner")

(Collectively referred to as "Partners")

WHEREAS the Partners have mutually agreed to carry on business in partnership on the following terms and conditions:

1. NAME OF FIRM: [FIRM NAME]

2. NATURE OF BUSINESS: [DESCRIBE BUSINESS - e.g., Trading, Import/Export, Services, etc.]

3. PRINCIPAL PLACE OF BUSINESS: [FULL ADDRESS]

4. COMMENCEMENT DATE: [DATE]

5. DURATION: The partnership shall be [AT WILL / FOR A FIXED PERIOD OF ___ YEARS].

6. CAPITAL CONTRIBUTION:
   First Partner:  Rs. [AMOUNT]/-  ([PERCENTAGE]%)
   Second Partner: Rs. [AMOUNT]/-  ([PERCENTAGE]%)
   Third Partner:  Rs. [AMOUNT]/-  ([PERCENTAGE]%)
   Total Capital:  Rs. [AMOUNT]/-

7. PROFIT AND LOSS SHARING:
   Profits and losses shall be shared in the following ratio:
   First Partner:  [PERCENTAGE]%
   Second Partner: [PERCENTAGE]%
   Third Partner:  [PERCENTAGE]%

8. MANAGEMENT:
   (a) [PARTNER NAME] shall be the Managing Partner.
   (b) All Partners shall devote their full time and attention to the business.
   (c) No Partner shall carry on any competing business.

9. BANKING:
   The firm's bank account shall be maintained at [BANK NAME, BRANCH].
   Account shall be operated [jointly / by the Managing Partner].

10. ACCOUNTS AND AUDIT:
    Proper books of accounts shall be maintained and audited annually.

11. DRAWINGS:
    Each Partner may draw up to Rs. [AMOUNT]/- per month as drawings against profits.

12. ADMISSION/RETIREMENT:
    No new partner shall be admitted without unanimous consent of existing partners.

13. DISSOLUTION:
    The partnership may be dissolved by mutual consent or as per the Partnership Act, 1932.

14. ARBITRATION:
    Any dispute shall be referred to arbitration under the Arbitration Act, 1940.

15. GOVERNING LAW:
    This deed shall be governed by the Partnership Act, 1932 and the laws of Pakistan.

IN WITNESS WHEREOF, the Partners have signed this deed on the date first mentioned above.

First Partner: ________________________    Date: _______________
Second Partner: ________________________   Date: _______________
Third Partner: ________________________    Date: _______________

WITNESSES:
1. Name: _______________    CNIC: _______________    Signature: _______________
2. Name: _______________    CNIC: _______________    Signature: _______________`,
  },

  // ===== CONSUMER =====
  {
    id: 'consumer_complaint',
    title: 'Consumer Court Complaint',
    category: 'Consumer',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    content: `IN THE [DISTRICT / DIVISION] CONSUMER COURT
[CITY / DISTRICT NAME]

Complaint No. _______ of [YEAR]

[COMPLAINANT NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
Contact: [PHONE]
                                                    ... Complainant

                        VERSUS

[COMPANY/BUSINESS NAME]
Through its [CEO/Manager/Owner]
[BUSINESS ADDRESS]
NTN: [NTN NUMBER if known]
                                                    ... Respondent

COMPLAINT UNDER THE [PUNJAB/SINDH/KPK/BALOCHISTAN] CONSUMER PROTECTION ACT

RESPECTFULLY SHEWETH:

1. That the complainant purchased [PRODUCT/SERVICE DETAILS] from the respondent on [DATE] for Rs. [AMOUNT]/-. (Receipt/Invoice No. [NUMBER] attached).

2. That the product/service was [DEFECTIVE / NOT AS DESCRIBED / NOT DELIVERED / SUBSTANDARD] in the following manner:
[DESCRIBE THE DEFECT OR ISSUE IN DETAIL]

3. That the complainant brought this issue to the attention of the respondent on [DATE] through [VERBAL COMPLAINT / WRITTEN COMPLAINT / EMAIL] but the respondent [REFUSED TO RESOLVE / IGNORED / GAVE UNSATISFACTORY RESPONSE].

4. That the complainant has suffered the following losses:
   (a) Cost of product/service: Rs. [AMOUNT]/-
   (b) Consequential damages: Rs. [AMOUNT]/-
   (c) Mental agony and harassment: Rs. [AMOUNT]/-
   Total Claim: Rs. [AMOUNT]/-

5. EVIDENCE:
   (a) Purchase receipt/invoice
   (b) Warranty card (if applicable)
   (c) Photographs of defective product
   (d) Correspondence with respondent
   (e) [OTHER EVIDENCE]

PRAYER:

(a) Direct the respondent to replace the defective product / refund the amount of Rs. [AMOUNT]/-;
(b) Award compensation of Rs. [AMOUNT]/- for mental agony and harassment;
(c) Impose penalty on the respondent for unfair trade practice;
(d) Award costs of this complaint;
(e) Any other relief deemed just and proper.

Dated: [DATE]

                                            ________________________
                                            Complainant / Advocate`,
  },

  // ===== LABOR =====
  {
    id: 'wrongful_termination',
    title: 'Wrongful Termination Complaint',
    category: 'Labor',
    icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
    content: `IN THE LABOUR COURT / NIRC
[DISTRICT / CITY]

Case No. _______ of [YEAR]

[EMPLOYEE NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Former Employee of [COMPANY NAME]
Employee No: [EMPLOYEE NUMBER]
Resident of [ADDRESS]
                                                    ... Complainant/Workman

                        VERSUS

[EMPLOYER/COMPANY NAME]
Through [CEO/MANAGING DIRECTOR/OWNER]
[COMPANY ADDRESS]
NTN: [NTN]
                                                    ... Respondent/Employer

COMPLAINT/GRIEVANCE PETITION FOR WRONGFUL TERMINATION

RESPECTFULLY SHEWETH:

1. That the complainant was employed by the respondent since [DATE OF JOINING] as [DESIGNATION] in [DEPARTMENT] at a monthly salary of Rs. [AMOUNT]/-.

2. That the complainant was terminated/dismissed from service on [DATE OF TERMINATION] vide order/letter dated [DATE].

3. That the termination is illegal, unlawful, and in violation of:
   (a) The Industrial and Commercial Employment (Standing Orders) Ordinance, 1968
   (b) [APPLICABLE LABOR LAW]
   (c) The terms and conditions of the employment contract

4. GROUNDS:

   (a) That no show cause notice was issued before termination.
   (b) That no inquiry was conducted as required by law.
   (c) That the principles of natural justice were violated.
   (d) That the termination was without any valid reason/justification.
   (e) [ADD SPECIFIC GROUNDS]

5. RELIEF CLAIMED:
   (a) Reinstatement to the original position with full back benefits
   (b) Payment of salary from the date of termination till reinstatement
   (c) Payment of outstanding dues: Rs. [AMOUNT]/-
   (d) Compensation for mental agony: Rs. [AMOUNT]/-

PRAYER:

(a) Declare the termination as illegal, void, and of no legal effect;
(b) Order reinstatement with full back benefits;
(c) Award compensation as claimed above;
(d) Any other relief deemed just and proper.

Dated: [DATE]

                                            ________________________
                                            Complainant / Advocate`,
  },

  // ===== BANKING =====
  {
    id: 'cheque_bounce',
    title: 'Cheque Dishonour Complaint',
    category: 'Banking',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    content: `IN THE COURT OF [MAGISTRATE / SESSIONS JUDGE]
[DISTRICT NAME]

Complaint Case No. _______ of [YEAR]

[COMPLAINANT NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Complainant

                        VERSUS

[ACCUSED NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Accused

COMPLAINT UNDER SECTION 489-F OF THE PAKISTAN PENAL CODE
(DISHONESTLY ISSUING A CHEQUE)

RESPECTFULLY SHEWETH:

1. That the accused issued the following cheque(s) to the complainant:
   Cheque No: [CHEQUE NUMBER]
   Date: [DATE ON CHEQUE]
   Amount: Rs. [AMOUNT]/- (Rupees [IN WORDS])
   Bank: [BANK NAME AND BRANCH]
   Account No: [ACCOUNT NUMBER]

2. That the cheque was issued against [DESCRIBE THE CONSIDERATION - e.g., payment for goods, repayment of loan, against services rendered, etc.].

3. That the complainant presented the said cheque at [BANK NAME] on [DATE OF PRESENTATION] but the cheque was dishonoured/bounced with the following remarks:
   "[REASON FOR DISHONOUR - e.g., Insufficient Funds / Account Closed / Payment Stopped / Refer to Drawer]"

4. That the dishonour memo/return memo dated [DATE] was received by the complainant.

5. That the complainant issued a Legal Notice dated [DATE] through registered post/courier to the accused demanding payment within 15 days.

6. That despite receipt of the Legal Notice, the accused has failed/refused to make the payment.

7. That the accused has committed an offence punishable under Section 489-F PPC which provides for imprisonment up to three years or fine or both.

EVIDENCE:
(a) Original dishonoured cheque
(b) Bank's dishonour/return memo
(c) Copy of Legal Notice with postal receipt
(d) Acknowledgment/tracking of Legal Notice
(e) [ANY OTHER RELEVANT EVIDENCE]

PRAYER:

(a) Take cognizance of the offence under Section 489-F PPC;
(b) Summon the accused and proceed according to law;
(c) Punish the accused with imprisonment and/or fine;
(d) Direct the accused to pay the cheque amount of Rs. [AMOUNT]/- as compensation;
(e) Any other relief deemed just and proper.

VERIFICATION:
I solemnly affirm that the contents of this complaint are true and correct.

Dated: [DATE]

                                            ________________________
                                            Complainant / Advocate`,
  },

  // ===== APPEAL =====
  {
    id: 'civil_appeal',
    title: 'Civil Appeal / Revision Petition',
    category: 'Civil',
    icon: 'M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15',
    content: `IN THE [HIGH COURT / DISTRICT COURT / APPELLATE COURT]
[CITY / DISTRICT]

[Civil Appeal / Civil Revision] No. _______ of [YEAR]

[APPELLANT NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Appellant

                        VERSUS

[RESPONDENT NAME]
Son/Daughter of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Respondent

APPEAL/REVISION AGAINST THE JUDGMENT AND DECREE/ORDER
DATED [DATE] PASSED BY [COURT NAME] IN [SUIT/CASE NO.]

RESPECTFULLY SHEWETH:

1. That the learned [Trial Court / Lower Court / Family Court] passed the impugned judgment and decree/order dated [DATE] in [CASE DETAILS] whereby [DESCRIBE WHAT WAS DECIDED].

2. BRIEF FACTS:
[DESCRIBE THE CASE HISTORY AND FACTS]

3. GROUNDS OF APPEAL:

   (a) That the impugned judgment is against the law and facts of the case.
   (b) That the learned trial court misread/non-read the material evidence on record.
   (c) That the findings of the trial court are based on conjectures and surmises.
   (d) That the trial court failed to appreciate the evidence produced by the appellant.
   (e) That the trial court erred in law by not following the binding precedents of the Superior Courts.
   (f) That the impugned judgment suffers from material irregularity and illegality.
   (g) [ADD SPECIFIC GROUNDS WITH REFERENCE TO EVIDENCE AND LAW]

4. That the appeal/revision is within limitation.

5. That no similar appeal/revision has been filed in any other court.

PRAYER:

(a) Accept this appeal/revision;
(b) Set aside the impugned judgment and decree/order dated [DATE];
(c) [SPECIFIC RELIEF - e.g., Decree the suit in favour of the appellant / Remand the case for fresh trial];
(d) Award costs throughout;
(e) Any other relief deemed just and proper.

Dated: [DATE]

                                            ________________________
                                            Advocate for the Appellant
                                            License No: [LICENSE NO]`,
  },

  // ===== AFFIDAVIT =====
  {
    id: 'general_affidavit',
    title: 'General Affidavit / Sworn Statement',
    category: 'Civil',
    icon: 'M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 012.625 1.25',
    content: `AFFIDAVIT / SWORN STATEMENT

I, [DEPONENT NAME], Son/Daughter of [FATHER NAME], aged about [AGE] years, CNIC No. [CNIC], Muslim, resident of [FULL ADDRESS], do hereby solemnly affirm and state on oath as under:

1. That I am the deponent and am competent to make this affidavit being conversant with the facts stated herein.

2. That [STATE THE PURPOSE OF THE AFFIDAVIT]

3. [STATE FACT 1]

4. [STATE FACT 2]

5. [STATE FACT 3]

6. [STATE FACT 4]

7. [ADD MORE PARAGRAPHS AS NEEDED]

8. That the contents of the above affidavit are true and correct to the best of my knowledge and belief and nothing has been concealed therein.

VERIFICATION:

Verified at [CITY] on this [DAY] day of [MONTH], [YEAR] that the contents of my above affidavit are true and correct to the best of my knowledge and belief. No part of this affidavit is false and nothing has been concealed or misstated therein.

                                            ________________________
                                            DEPONENT

SWORN BEFORE ME on this [DAY] day of [MONTH], [YEAR].

                                            ________________________
                                            Oath Commissioner / Notary Public
                                            [NAME AND SEAL]`,
  },
  // ===== ADDITIONAL CRIMINAL =====
  {
    id: 'fir_application',
    title: 'Application for Registration of FIR',
    category: 'Criminal',
    icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
    content: `TO,
The Station House Officer (SHO),
Police Station [PS NAME],
[DISTRICT]

Subject: Application for Registration of FIR Under Section [SECTION NUMBER] PPC

Respected Sir,

I, [COMPLAINANT NAME], Son/Daughter of [FATHER NAME], CNIC No. [CNIC], resident of [ADDRESS], respectfully submit as under:

1. That on [DATE] at about [TIME], at [PLACE OF OCCURRENCE], the following incident took place:

[DESCRIBE THE INCIDENT IN DETAIL]

2. That the accused persons are:
   (i)  [ACCUSED 1 NAME], Son of [FATHER NAME], resident of [ADDRESS]
   (ii) [ACCUSED 2 NAME], Son of [FATHER NAME], resident of [ADDRESS]

3. That the following offences have been committed:
   [LIST APPLICABLE SECTIONS OF PPC/OTHER LAWS]

4. That the following witnesses were present:
   (i)  [WITNESS 1 NAME AND ADDRESS]
   (ii) [WITNESS 2 NAME AND ADDRESS]

5. That [ANY INJURIES/LOSSES SUFFERED]

It is therefore most respectfully requested that an FIR may kindly be registered against the above-named accused persons under the relevant sections of law and investigation may be conducted.

Dated: [DATE]
Place: [CITY]

                                            ________________________
                                            Complainant
                                            [COMPLAINANT NAME]
                                            CNIC: [CNIC]`,
  },
  {
    id: 'bail_cancellation',
    title: 'Application for Cancellation of Bail',
    category: 'Criminal',
    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    content: `IN THE COURT OF [SESSIONS JUDGE / ADDITIONAL SESSIONS JUDGE]
[DISTRICT NAME]

Criminal Miscellaneous No. _______ of [YEAR]

FIR No. [FIR NUMBER]
Under Sections [SECTIONS] PPC
Police Station [PS NAME], [DISTRICT]

IN THE MATTER OF:

The State through [COMPLAINANT NAME]
                                                    ... Complainant/Petitioner

                        VERSUS

[ACCUSED NAME]
Son of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Respondent/Accused

APPLICATION FOR CANCELLATION OF BAIL
Under Section 497(5) Cr.P.C.

Most Respectfully Showeth:

1. That the respondent/accused was granted bail by this Honourable Court vide order dated [DATE] in Cr. Misc. No. [NUMBER]/[YEAR].

2. That subsequent to the grant of bail, the respondent/accused has:
   (a) [STATE GROUNDS - e.g., threatened witnesses]
   (b) [STATE GROUNDS - e.g., tampered with evidence]
   (c) [STATE GROUNDS - e.g., absconded/violated bail conditions]

3. That the continuation of bail is prejudicial to the fair trial and administration of justice.

PRAYER:

It is, therefore, most respectfully prayed that the bail already granted to the respondent/accused may graciously be cancelled in the interest of justice.

Dated: [DATE]
Place: [CITY]

                                            ________________________
                                            Advocate for Complainant
                                            [ADVOCATE NAME]
                                            License No. [LICENSE NO]`,
  },
  {
    id: 'section_22a_application',
    title: 'Application u/s 22-A/22-B CrPC',
    category: 'Criminal',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z',
    content: `IN THE COURT OF [SESSIONS JUDGE / EX-OFFICIO JUSTICE OF PEACE]
[DISTRICT NAME]

Criminal Miscellaneous No. _______ of [YEAR]

IN THE MATTER OF:

[APPLICANT NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Applicant

APPLICATION UNDER SECTION 22-A/22-B Cr.P.C.
(For Direction to SHO to Register FIR)

Most Respectfully Showeth:

1. That the applicant approached Police Station [PS NAME], [DISTRICT] on [DATE] for registration of FIR in respect of the following cognizable offence:

   [DESCRIBE THE OFFENCE]

2. That the SHO/Police concerned refused to register the FIR without any lawful justification.

3. That the applicant has a legal right to get the FIR registered as the offence is cognizable and the police are duty-bound under Section 154 Cr.P.C.

4. That the refusal of the police to register the FIR is illegal and against the mandate of law.

PRAYER:

It is therefore most respectfully prayed that the learned Justice of Peace may graciously be pleased to direct the SHO, Police Station [PS NAME] to register the FIR of the applicant under the relevant sections of law.

Dated: [DATE]
Place: [CITY]

                                            ________________________
                                            Advocate for Applicant
                                            [ADVOCATE NAME]`,
  },
  // ===== ADDITIONAL CIVIL =====
  {
    id: 'suit_recovery',
    title: 'Suit for Recovery of Money',
    category: 'Civil',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    content: `IN THE COURT OF [CIVIL JUDGE / SENIOR CIVIL JUDGE]
[DISTRICT NAME]

Civil Suit No. _______ of [YEAR]

[PLAINTIFF NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Plaintiff

                        VERSUS

[DEFENDANT NAME]
Son/Daughter of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Defendant

SUIT FOR RECOVERY OF RS. [AMOUNT]/- WITH INTEREST

The plaintiff above-named most respectfully submits as under:

1. That the plaintiff is a resident of [ADDRESS] and the defendant is a resident of [ADDRESS]. This Honourable Court has territorial and pecuniary jurisdiction to try and decide this suit.

2. That the defendant borrowed/is liable to pay a sum of Rs. [AMOUNT]/- (Rupees [AMOUNT IN WORDS] only) to the plaintiff on account of [STATE CAUSE - loan/services/goods/damages].

3. That the said amount was due and payable on [DUE DATE].

4. That despite repeated demands and a legal notice dated [DATE], the defendant has failed and refused to pay the outstanding amount.

5. That the plaintiff is entitled to recover the said amount along with [INTEREST RATE]% interest from [DATE] till realization.

6. That the cause of action arose on [DATE] when the defendant failed to make payment.

7. That the suit is within limitation.

PRAYER:

In the light of above facts and circumstances, it is most respectfully prayed that a decree for recovery of Rs. [AMOUNT]/- along with [INTEREST]% interest per annum from [DATE] till realization may graciously be passed in favour of the plaintiff and against the defendant, with costs of the suit.

Any other relief which this Honourable Court deems fit and proper may also be granted.

Dated: [DATE]
Place: [CITY]

                                            ________________________
                                            Advocate for Plaintiff
                                            [ADVOCATE NAME]

VERIFICATION:
I, [PLAINTIFF NAME], do hereby verify that the contents of paragraphs 1 to 7 are true and correct to the best of my knowledge and belief.

                                            ________________________
                                            Plaintiff`,
  },
  {
    id: 'temporary_injunction',
    title: 'Application for Temporary Injunction (O.XXXIX R.1&2 CPC)',
    category: 'Civil',
    icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    content: `IN THE COURT OF [CIVIL JUDGE / SENIOR CIVIL JUDGE]
[DISTRICT NAME]

Civil Suit No. _______ of [YEAR]

[PLAINTIFF NAME]
                                                    ... Plaintiff/Applicant
                        VERSUS
[DEFENDANT NAME]
                                                    ... Defendant/Respondent

APPLICATION UNDER ORDER XXXIX RULES 1 & 2 C.P.C.
(For Grant of Temporary Injunction)

Most Respectfully Showeth:

1. That the applicant/plaintiff has filed the above captioned suit for [NATURE OF SUIT].

2. That the applicant has a prima facie case in his/her favour as [BRIEFLY STATE THE CASE].

3. That if the temporary injunction is not granted, the applicant shall suffer irreparable loss and injury which cannot be compensated in terms of money.

4. That the balance of convenience lies in favour of the applicant.

5. That the respondent/defendant is likely to [STATE THE APPREHENDED ACT - e.g., alienate the property / destroy evidence / cause damage].

PRAYER:

It is therefore most respectfully prayed that pending the decision of the suit, the respondent/defendant may be restrained through an order of temporary injunction from [STATE SPECIFIC ACT TO BE RESTRAINED].

Dated: [DATE]

                                            ________________________
                                            Advocate for Plaintiff`,
  },
  {
    id: 'written_statement',
    title: 'Written Statement (Defence in Civil Suit)',
    category: 'Civil',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    content: `IN THE COURT OF [CIVIL JUDGE / SENIOR CIVIL JUDGE]
[DISTRICT NAME]

Civil Suit No. _______ of [YEAR]

[PLAINTIFF NAME]
                                                    ... Plaintiff
                        VERSUS
[DEFENDANT NAME]
                                                    ... Defendant

WRITTEN STATEMENT ON BEHALF OF THE DEFENDANT

Most Respectfully Showeth:

PRELIMINARY OBJECTIONS:

(i)   That the suit is not maintainable in the present form.
(ii)  That this Honourable Court lacks [territorial/pecuniary] jurisdiction.
(iii) That the suit is barred by limitation under [RELEVANT ARTICLE OF LIMITATION ACT].
(iv)  That the suit is bad for non-joinder/mis-joinder of necessary parties.

REPLY ON MERITS (Para-wise):

1. Para 1 of the plaint is [admitted/denied/not admitted]. [STATE RESPONSE]

2. Para 2 of the plaint is [admitted/denied/not admitted]. [STATE RESPONSE]

3. Para 3 of the plaint is [admitted/denied/not admitted]. [STATE RESPONSE]

4. [CONTINUE FOR REMAINING PARAGRAPHS]

ADDITIONAL PLEAS:

(a) That [STATE ANY ADDITIONAL DEFENCE]
(b) That [STATE ANY COUNTER CLAIM]

PRAYER:

In the light of above submissions, it is most respectfully prayed that the suit of the plaintiff may kindly be dismissed with costs.

Dated: [DATE]

                                            ________________________
                                            Advocate for Defendant
                                            [ADVOCATE NAME]

VERIFICATION:
I, [DEFENDANT NAME], do hereby verify that the contents of the above Written Statement are true and correct to my knowledge and belief.

                                            ________________________
                                            Defendant`,
  },
  // ===== ADDITIONAL FAMILY =====
  {
    id: 'maintenance_suit',
    title: 'Suit for Recovery of Maintenance (Nafaqa)',
    category: 'Family',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    content: `IN THE COURT OF [JUDGE FAMILY COURT]
[DISTRICT NAME]

Family Suit No. _______ of [YEAR]

[PLAINTIFF NAME] (Wife/Minor through Guardian)
Daughter/Son of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Plaintiff

                        VERSUS

[DEFENDANT NAME] (Husband/Father)
Son of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Defendant

SUIT FOR RECOVERY OF MAINTENANCE (NAFAQA)
Under Section 9 of the West Pakistan Family Courts Act, 1964

Most Respectfully Showeth:

1. That the plaintiff is the [wife/minor child] of the defendant.

2. That the marriage between the plaintiff and defendant was solemnized on [DATE] at [PLACE] as per Muslim Rites. The Nikah was registered with the concerned Nikah Registrar bearing Nikah Nama No. [NUMBER].

3. That out of the said wedlock, [NUMBER] children were born namely:
   (i)  [CHILD NAME], aged [AGE] years
   (ii) [CHILD NAME], aged [AGE] years

4. That the defendant has failed/refused to provide maintenance to the plaintiff [and minor children] since [DATE].

5. That the defendant is a person of means and earns approximately Rs. [AMOUNT]/- per month from [SOURCE OF INCOME].

6. That the plaintiff [and children] require Rs. [AMOUNT]/- per month for maintenance including food, clothing, shelter, education, and medical expenses.

7. That the plaintiff has no independent source of income and is entirely dependent upon the defendant.

PRAYER:

It is therefore most respectfully prayed that:
(a) A decree for maintenance @ Rs. [AMOUNT]/- per month may be passed in favour of the plaintiff [and minor children].
(b) Past maintenance from [DATE] may also be allowed.
(c) Costs of the suit may also be awarded.

Dated: [DATE]

                                            ________________________
                                            Advocate for Plaintiff`,
  },
  {
    id: 'guardianship_petition',
    title: 'Petition for Guardianship of Minor',
    category: 'Family',
    icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    content: `IN THE COURT OF [GUARDIAN JUDGE]
[DISTRICT NAME]

Guardianship Petition No. _______ of [YEAR]

IN THE MATTER OF:

[PETITIONER NAME]
[Relationship to Minor]
Resident of [ADDRESS]
                                                    ... Petitioner

PETITION UNDER SECTION 7 OF THE GUARDIANS AND WARDS ACT, 1890
For Appointment as Guardian of Person and Property of Minor

Most Respectfully Showeth:

1. That the minor [MINOR NAME], Son/Daughter of [FATHER NAME], was born on [DATE OF BIRTH] and is presently aged [AGE] years.

2. That the natural father of the minor, namely [FATHER NAME], has [died/abandoned the minor/is incapable due to...].

3. That the minor is currently residing with the petitioner at [ADDRESS].

4. That the petitioner is the [RELATIONSHIP] of the minor and is a fit and proper person to be appointed as guardian.

5. That the minor has the following property/assets:
   [DESCRIBE PROPERTY IF ANY, OR STATE "NO PROPERTY"]

6. That it is in the best interest and welfare of the minor that the petitioner be appointed as guardian of the person [and property] of the said minor.

7. That no previous application for guardianship of the said minor has been made to any court.

PRAYER:

It is therefore most respectfully prayed that the petitioner may be appointed as Guardian of the person [and property] of the minor [MINOR NAME].

Dated: [DATE]

                                            ________________________
                                            Advocate for Petitioner`,
  },
  {
    id: 'dower_recovery',
    title: 'Suit for Recovery of Dower (Haq Mehr)',
    category: 'Family',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
    content: `IN THE COURT OF [JUDGE FAMILY COURT]
[DISTRICT NAME]

Family Suit No. _______ of [YEAR]

[WIFE NAME]
Daughter of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Plaintiff

                        VERSUS

[HUSBAND NAME]
Son of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Defendant

SUIT FOR RECOVERY OF DOWER (HAQ MEHR)
Under Section 9 of West Pakistan Family Courts Act, 1964

Most Respectfully Showeth:

1. That the marriage between the plaintiff and defendant was solemnized on [DATE] as per Muslim Rites.

2. That the prompt dower (Haq Mehr-e-Muajjal) was fixed at Rs. [AMOUNT]/- [AND/OR deferred dower (Mehr-e-Muwajjal) was fixed at Rs. [AMOUNT]/-] as per Nikah Nama.

3. That the defendant has failed to pay the dower amount despite repeated demands.

4. That under Muslim Law, dower is a debt owed by the husband to the wife and is payable on demand.

PRAYER:

(a) A decree for recovery of Rs. [TOTAL AMOUNT]/- on account of dower (Haq Mehr) may be passed.
(b) Costs of the suit may be awarded to the plaintiff.

Dated: [DATE]

                                            ________________________
                                            Advocate for Plaintiff`,
  },
  // ===== PROPERTY =====
  {
    id: 'suit_possession',
    title: 'Suit for Possession of Immovable Property',
    category: 'Property',
    icon: 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819',
    content: `IN THE COURT OF [CIVIL JUDGE / SENIOR CIVIL JUDGE]
[DISTRICT NAME]

Civil Suit No. _______ of [YEAR]

[PLAINTIFF NAME]
Son/Daughter of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Plaintiff
                        VERSUS
[DEFENDANT NAME]
Son/Daughter of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Defendant

SUIT FOR POSSESSION OF IMMOVABLE PROPERTY

Most Respectfully Showeth:

1. That the plaintiff is the lawful owner of the property described in the Schedule below.

2. That the plaintiff acquired the said property by virtue of [sale deed/inheritance/gift deed/partition] dated [DATE], registered with [SUB-REGISTRAR OFFICE].

3. That the defendant has illegally occupied/taken possession of the said property on [DATE] without any right, title, or authority.

4. That the plaintiff has demanded the defendant to vacate the property, but the defendant has refused to do so.

5. That a legal notice dated [DATE] was also served upon the defendant, but to no avail.

SCHEDULE OF PROPERTY:

[DESCRIPTION OF PROPERTY - Khasra No., Khata No., Area, Location, Boundaries - North, South, East, West]

PRAYER:

(a) A decree for possession of the suit property may be passed in favour of the plaintiff.
(b) The defendant may be restrained from alienating or causing damage to the property.
(c) Costs of the suit may be awarded.
(d) Any other relief deemed fit may also be granted.

Dated: [DATE]

                                            ________________________
                                            Advocate for Plaintiff`,
  },
  {
    id: 'suit_preemption',
    title: 'Suit for Pre-emption (Shuf\'a)',
    category: 'Property',
    icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    content: `IN THE COURT OF [CIVIL JUDGE / SENIOR CIVIL JUDGE]
[DISTRICT NAME]

Civil Suit No. _______ of [YEAR]

[PLAINTIFF NAME]
Son/Daughter of [FATHER NAME]
Resident of [ADDRESS]
                                                    ... Plaintiff (Pre-emptor)
                        VERSUS
1. [VENDEE NAME] (Purchaser)
2. [VENDOR NAME] (Seller)
                                                    ... Defendants

SUIT FOR PRE-EMPTION (SHUF'A)
Under the Punjab Pre-emption Act, 1991

Most Respectfully Showeth:

1. That the defendant No. 2 (vendor) was the owner of property bearing [KHASRA/KHATA NO.], measuring [AREA], situated at [LOCATION].

2. That the defendant No. 2 sold the said property to defendant No. 1 on [DATE] for a consideration of Rs. [AMOUNT]/-.

3. That the plaintiff is a [CO-sharer/Adjoining owner] of the property and has a superior right of pre-emption under Section [4/6] of the Punjab Pre-emption Act, 1991.

4. That the plaintiff came to know about the sale on [DATE].

5. That the plaintiff performed TALB-I-MUWASIBAT (demand by immediate jumping up) on [DATE] by declaring his intention to pre-empt in the presence of [WITNESS NAMES].

6. That the plaintiff performed TALB-I-ISHHAD (demand by attestation) on [DATE] in the presence of two witnesses.

7. That the plaintiff has deposited the sale consideration of Rs. [AMOUNT]/- with this Honourable Court.

PRAYER:

(a) A decree for pre-emption in respect of the suit property may be passed.
(b) The sale deed dated [DATE] may be substituted in favour of the plaintiff.
(c) Costs of suit may be awarded.

Dated: [DATE]

                                            ________________________
                                            Advocate for Plaintiff`,
  },
  // ===== LABOR =====
  {
    id: 'labor_court_complaint',
    title: 'Complaint Before Labour Court',
    category: 'Labor',
    icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
    content: `IN THE LABOUR COURT [NO.]
[DISTRICT NAME]

Grievance Petition No. _______ of [YEAR]

[WORKER NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Employee/Ex-Employee of [EMPLOYER NAME]
                                                    ... Petitioner/Workman

                        VERSUS

[EMPLOYER NAME / COMPANY NAME]
Through [MANAGING DIRECTOR/OWNER]
Address: [ADDRESS]
                                                    ... Respondent/Employer

GRIEVANCE PETITION
Under Section 33-A of the Industrial Relations Act, 2012

Most Respectfully Showeth:

1. That the petitioner was employed with the respondent as [DESIGNATION] w.e.f. [JOINING DATE] at a monthly salary of Rs. [SALARY]/-.

2. That the petitioner performed his/her duties diligently and faithfully throughout the period of employment.

3. That on [DATE], the respondent illegally [terminated/dismissed/retrenched] the petitioner without:
   (a) Any show cause notice
   (b) Any domestic inquiry
   (c) Any reasonable cause
   (d) Due compliance with Standing Orders/Service Rules

4. That the termination/dismissal is in violation of [Section ____ of the Industrial and Commercial Employment (Standing Orders) Ordinance, 1968 / relevant law].

5. That the petitioner is entitled to reinstatement with back wages and all other benefits.

PRAYER:

(a) The termination order dated [DATE] may be declared illegal, void, and of no effect.
(b) The petitioner may be reinstated with full back wages from the date of termination.
(c) All benefits including increments, promotions, and seniority may be restored.
(d) Costs may be awarded.

Dated: [DATE]

                                            ________________________
                                            Advocate for Petitioner`,
  },
  // ===== CONSTITUTIONAL =====
  {
    id: 'writ_petition_199',
    title: 'Constitutional Petition (Art. 199)',
    category: 'Constitutional',
    icon: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z',
    content: `IN THE [LAHORE/SINDH/PESHAWAR/BALOCHISTAN/ISLAMABAD] HIGH COURT
[BENCH NAME]

Writ Petition No. _______ of [YEAR]

[PETITIONER NAME]
Son/Daughter of [FATHER NAME]
CNIC No. [CNIC]
Resident of [ADDRESS]
                                                    ... Petitioner

                        VERSUS

1. [GOVERNMENT AUTHORITY/DEPARTMENT]
   Through its [Secretary/Director/Commissioner]
2. [OTHER RESPONDENT IF ANY]
                                                    ... Respondents

CONSTITUTIONAL PETITION UNDER ARTICLE 199 OF THE CONSTITUTION
OF THE ISLAMIC REPUBLIC OF PAKISTAN, 1973

Most Respectfully Showeth:

1. That the petitioner is a citizen of Pakistan and is aggrieved by the illegal/unconstitutional action/inaction of the respondents.

2. That the facts giving rise to this petition are:
   [STATE FACTS IN DETAIL]

3. That the impugned action/order dated [DATE] is:
   (a) Without lawful authority and jurisdiction
   (b) In violation of Article [ARTICLE NUMBER] of the Constitution
   (c) Contrary to the principles of natural justice
   (d) Arbitrary, mala fide, and unreasonable

4. That no other adequate remedy is available to the petitioner except this constitutional petition.

5. That no earlier petition on the same cause of action has been filed before any court.

PRAYER:

(a) The impugned [order/action/notification] dated [DATE] may be declared unlawful/unconstitutional and set aside.
(b) The respondents may be directed to [STATE SPECIFIC RELIEF].
(c) Any other relief deemed appropriate may also be granted.

Dated: [DATE]

                                            ________________________
                                            Advocate for Petitioner
                                            [ADVOCATE NAME]
                                            License No. [LICENSE NO]`,
  },
];

const DRAFT_STORAGE_KEY = 'tvl_draft_documents';
const ATTACHMENTS_KEY = 'tvl_draft_attachments';

interface SavedDraft {
  id: string;
  templateId: string;
  templateTitle: string;
  content: string;
  formData?: Record<string, string>;
  attachments?: AttachmentMeta[];
  savedAt: number;
}

interface AttachmentMeta {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

function useSavedDrafts() {
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) setDrafts(JSON.parse(stored));
    } catch {}
  }, []);

  const saveDraft = (draft: SavedDraft) => {
    setDrafts(prev => {
      const existing = prev.findIndex(d => d.id === draft.id);
      const next = existing >= 0
        ? prev.map((d, i) => i === existing ? { ...draft, savedAt: Date.now() } : d)
        : [...prev, { ...draft, savedAt: Date.now() }];
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeDraft = (id: string) => {
    setDrafts(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { drafts, saveDraft, removeDraft };
}

// Extract [PLACEHOLDER] fields from template content
function extractFields(content: string): { key: string; label: string }[] {
  const matches = content.match(/\[([^\]]+)\]/g) || [];
  const seen = new Set<string>();
  const fields: { key: string; label: string }[] = [];
  for (const m of matches) {
    const raw = m.slice(1, -1);
    if (!seen.has(raw)) {
      seen.add(raw);
      fields.push({ key: raw, label: raw.replace(/_/g, ' ') });
    }
  }
  return fields;
}

// ===== PROFESSIONAL DOCUMENT FORMATTER =====
function formatDocumentHtml(text: string, highlightPlaceholders = false): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = text.split('\n');
  const parts: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = esc(raw.trimEnd());
    const trimmed = raw.trim();

    // Empty line → spacing
    if (!trimmed) {
      parts.push('<div style="height:10px"></div>');
      continue;
    }

    // Court name / Header lines (ALL CAPS, first few lines, or specific patterns)
    if (/^IN THE (COURT|HIGH COURT|SUPREME|HON)/.test(trimmed) || /^(WRIT|CRIMINAL|CIVIL|SUIT|APPLICATION|PETITION|COMPLAINT|LEGAL NOTICE|APPEAL)/.test(trimmed)) {
      parts.push(`<div style="text-align:center;font-weight:bold;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:4px 0">${line}</div>`);
      continue;
    }

    // Centered lines: VERSUS, IN THE MATTER OF, RESPECTFULLY SHEWETH, PRAYER, VERIFICATION, ANNEXURES
    if (/^(VERSUS|V\/S)$/i.test(trimmed)) {
      parts.push(`<div style="text-align:center;font-weight:bold;font-size:13px;margin:12px 0;letter-spacing:2px">${line}</div>`);
      continue;
    }
    if (/^(IN THE MATTER OF|RESPECTFULLY SHEWETH|PRAYER|VERIFICATION|ANNEXURES):?$/i.test(trimmed)) {
      parts.push(`<div style="text-align:center;font-weight:bold;font-size:13px;text-decoration:underline;text-underline-offset:4px;margin:8px 0">${line}</div>`);
      continue;
    }

    // Section headings: "4. GROUNDS FOR BAIL:", "2. BRIEF FACTS:", numbered bold headings
    if (/^\d+\.\s+[A-Z][A-Z\s]+:/.test(trimmed)) {
      parts.push(`<div style="font-weight:bold;margin:8px 0 4px 0;text-decoration:underline;text-underline-offset:3px">${line}</div>`);
      continue;
    }

    // Right-aligned party designations: "... Applicant/Accused", "... Respondent", "... Petitioner", "... Plaintiff"
    if (/^\.\.\.\s*(Applicant|Respondent|Petitioner|Plaintiff|Defendant|Complainant|Accused)/i.test(trimmed)) {
      parts.push(`<div style="text-align:right;font-weight:bold;font-style:italic;margin:2px 0">${line}</div>`);
      continue;
    }

    // Right-aligned signature block (lines with many leading spaces or underscores)
    if (/^_{10,}/.test(trimmed) || (raw.startsWith('                                ') && trimmed.length > 3)) {
      parts.push(`<div style="text-align:right;margin:2px 0">${line}</div>`);
      continue;
    }

    // Dated/Place line
    if (/^(Dated|Place|Verified at):?\s/i.test(trimmed)) {
      parts.push(`<div style="margin:8px 0 2px 0">${line}</div>`);
      continue;
    }

    // Indented grounds: "(a) That..." or "(i) That..."
    if (/^\([a-z]\)\s/.test(trimmed) || /^\([ivxlcdm]+\)\s/i.test(trimmed)) {
      parts.push(`<div style="margin:4px 0 4px 40px;text-indent:-24px;padding-left:24px">${line}</div>`);
      continue;
    }

    // Numbered paragraphs: "1. That..."
    if (/^\d+\.\s+That\b/.test(trimmed) || /^\d+\.\s+[A-Z]/.test(trimmed)) {
      parts.push(`<div style="margin:6px 0;text-align:justify;text-indent:0">${line}</div>`);
      continue;
    }

    // Sub-items with letters: "(a) [DESCRIBE..."
    if (/^\([a-z]\)\s*\[/.test(trimmed)) {
      parts.push(`<div style="margin:3px 0 3px 40px">${line}</div>`);
      continue;
    }

    // Case number lines
    if (/^(Criminal|Civil|Writ|Constitutional|Family)\s+(Miscellaneous|Suit|Petition|Appeal|Case)\s+No/i.test(trimmed)) {
      parts.push(`<div style="text-align:center;margin:4px 0;font-weight:600">${line}</div>`);
      continue;
    }

    // Value/Court Fee lines
    if (/^(VALUE OF SUIT|COURT FEE|SUBJECT):/i.test(trimmed)) {
      parts.push(`<div style="font-weight:600;margin:4px 0">${line}</div>`);
      continue;
    }

    // "Through" / "To:" / "From:" lines in notices
    if (/^(Through|THROUGH|To:|From:|Ref No:)/i.test(trimmed)) {
      parts.push(`<div style="margin:2px 0;font-weight:500">${line}</div>`);
      continue;
    }

    // "Dear Sir/Madam" salutation
    if (/^Dear\s/i.test(trimmed)) {
      parts.push(`<div style="margin:8px 0">${line}</div>`);
      continue;
    }

    // "Annexure X:" items
    if (/^Annexure\s+[A-Z]:/i.test(trimmed)) {
      parts.push(`<div style="margin:3px 0 3px 20px;font-weight:500">${line}</div>`);
      continue;
    }

    // Default paragraph — justify text
    parts.push(`<div style="text-align:justify;margin:2px 0">${line}</div>`);
  }

  let html = parts.join('');

  // Highlight placeholders if requested
  if (highlightPlaceholders) {
    html = html.replace(/\[([^\]]+)\]/g, '<span style="background:rgba(196,164,96,0.2);color:#c4a460;padding:1px 4px;border-radius:3px;font-weight:500">[$1]</span>');
  }

  return html;
}

// ===== RICH TEXT TOOLBAR =====
function RichToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const btnClass = "p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-brass-300 transition-colors";

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
      <button onClick={() => exec('bold')} className={btnClass} title="Bold (Ctrl+B)">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
      </button>
      <button onClick={() => exec('italic')} className={btnClass} title="Italic (Ctrl+I)">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
      </button>
      <button onClick={() => exec('underline')} className={btnClass} title="Underline (Ctrl+U)">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
      </button>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button onClick={() => exec('justifyLeft')} className={btnClass} title="Align Left">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
      </button>
      <button onClick={() => exec('justifyCenter')} className={btnClass} title="Align Center">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
      </button>
      <button onClick={() => exec('justifyRight')} className={btnClass} title="Align Right">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
      </button>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button onClick={() => exec('insertUnorderedList')} className={btnClass} title="Bullet List">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </button>
      <button onClick={() => exec('insertOrderedList')} className={btnClass} title="Numbered List">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
      </button>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button onClick={() => exec('indent')} className={btnClass} title="Indent">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>
      </button>
      <button onClick={() => exec('outdent')} className={btnClass} title="Outdent">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>
      </button>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <select
        onChange={(e) => { if (e.target.value) exec('fontSize', e.target.value); e.target.value = ''; }}
        className="bg-transparent text-gray-400 text-xs border border-white/10 rounded px-1.5 py-1 hover:border-brass-400/30 focus:outline-none"
        defaultValue=""
      >
        <option value="" disabled>Size</option>
        <option value="1">Small</option>
        <option value="3">Normal</option>
        <option value="5">Large</option>
        <option value="7">Huge</option>
      </select>
      <select
        onChange={(e) => { if (e.target.value) exec('formatBlock', e.target.value); e.target.value = ''; }}
        className="bg-transparent text-gray-400 text-xs border border-white/10 rounded px-1.5 py-1 hover:border-brass-400/30 focus:outline-none"
        defaultValue=""
      >
        <option value="" disabled>Heading</option>
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="blockquote">Blockquote</option>
      </select>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button onClick={() => exec('removeFormat')} className={btnClass} title="Clear Formatting">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/></svg>
      </button>
      <button onClick={() => exec('undo')} className={btnClass} title="Undo">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
      </button>
      <button onClick={() => exec('redo')} className={btnClass} title="Redo">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
      </button>
    </div>
  );
}

export default function DraftingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [draftId, setDraftId] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editorMode, setEditorMode] = useState<'editor' | 'form'>('editor');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [hiddenFields, setHiddenFields] = useState<Record<string, boolean>>({});
  const [factsMode, setFactsMode] = useState<Record<string, 'write' | 'generate'>>({});
  const [factsDocuments, setFactsDocuments] = useState<Record<string, { name: string; text: string }[]>>({});
  const [factsGenerating, setFactsGenerating] = useState<Record<string, boolean>>({});
  const [groundsItems, setGroundsItems] = useState<Record<string, string[]>>({});
  const [newGroundText, setNewGroundText] = useState<Record<string, string>>({});
  const [annexures, setAnnexures] = useState<{ label: string; fileName: string; file?: File }[]>([]);
  const [newAnnexureLabel, setNewAnnexureLabel] = useState('');
  const [savedEditorHtml, setSavedEditorHtml] = useState('');
  const [liveEditorHtml, setLiveEditorHtml] = useState('');
  const annexureFileRef = useRef<HTMLInputElement>(null);
  const factsFileRef = useRef<HTMLInputElement>(null);
  const [activateFactsKey, setActivateFactsKey] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { drafts, saveDraft, removeDraft } = useSavedDrafts();

  const openTemplate = (template: Template, content?: string) => {
    setSelectedTemplate(template);
    setEditableContent(content || template.content);
    setDraftId(content ? draftId : `draft_${Date.now()}`);
    setEditorMode('editor');
    setFormData({});
    setAttachments([]);
    setGroundsItems({});
    setAnnexures([]);
    setHiddenFields({});
    setFactsMode({});
    setFactsDocuments({});
    setSavedEditorHtml('');
  };

  const openDraft = (draft: SavedDraft) => {
    const template = TEMPLATES.find(t => t.id === draft.templateId);
    if (template) {
      setSelectedTemplate(template);
      setEditableContent(draft.content);
      setDraftId(draft.id);
      setFormData(draft.formData || {});
      setAttachments(draft.attachments || []);
    }
  };

  // Sync editor content when switching to editor mode
  useEffect(() => {
    if (editorMode === 'editor' && editorRef.current) {
      if (savedEditorHtml) {
        editorRef.current.innerHTML = savedEditorHtml;
        setLiveEditorHtml(savedEditorHtml);
      } else if (editableContent) {
        const html = formatDocumentHtml(editableContent, true);
        editorRef.current.innerHTML = html;
        setLiveEditorHtml(html);
      }
    }
    // Initialize grounds with predefined grounds when switching to form mode for the first time
    if (editorMode === 'form' && selectedTemplate) {
      const fields = extractFields(selectedTemplate.content);
      fields.forEach(f => {
        if (isGroundsFieldStatic(f.key) && !groundsItems[f.key]) {
          const predefined = getPredefinedGrounds(selectedTemplate);
          if (predefined.length > 0) {
            setGroundsItems(prev => ({ ...prev, [f.key]: predefined }));
          }
        }
      });
    }
  }, [editorMode, selectedTemplate]);

  // Static check for grounds field (used before component methods are available)
  const isGroundsFieldStatic = (key: string) => {
    const k = key.toUpperCase();
    return k.includes('ADD') && k.includes('GROUND');
  };

  // Check if a field key is a "facts" type field
  const isFactsField = (key: string) => {
    const k = key.toUpperCase();
    return (k.includes('FACTS') || k.includes('DESCRIBE THE FACTS') || k.includes('PARAGRAPH-WISE') || k.includes('DESCRIBE HOW AND WHY') || k.includes('DESCRIBE THE COMPLETE FACTS')) && !k.includes('RELATIONSHIP') && !k.includes('WHAT THE RECIPIENT');
  };

  // Check if a field key is a "grounds" type field
  const isGroundsField = (key: string) => {
    const k = key.toUpperCase();
    return k.includes('ADD') && k.includes('GROUND');
  };

  // Get predefined grounds from template (e.g., "(a) That the applicant...")
  const getPredefinedGrounds = (tmpl?: Template): string[] => {
    const t = tmpl || selectedTemplate;
    if (!t) return [];
    const lines = t.content.split('\n');
    const grounds: string[] = [];
    let inGroundsSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (/GROUNDS/i.test(trimmed) && /:/.test(trimmed)) { inGroundsSection = true; continue; }
      if (inGroundsSection) {
        if (/^\(\w\)\s+That/.test(trimmed)) {
          // Skip the placeholder ground like "(h) [ADD ANY OTHER SPECIFIC GROUNDS]"
          if (/\[.*GROUND.*\]/i.test(trimmed)) continue;
          grounds.push(trimmed);
        } else if (trimmed && !/^\(/.test(trimmed) && !/^\[/.test(trimmed) && grounds.length > 0 && !/^PRAYER|^RESPECTFULLY|^\d+\./.test(trimmed)) {
          // continuation of previous ground
        } else if (/^\d+\.|^PRAYER|^RESPECTFULLY/i.test(trimmed)) {
          inGroundsSection = false;
        }
      }
    }
    return grounds;
  };

  // Generate brief facts from uploaded documents (simulated AI)
  const generateBriefFacts = (key: string) => {
    const docs = factsDocuments[key] || [];
    if (docs.length === 0) return;
    setFactsGenerating(prev => ({ ...prev, [key]: true }));
    // Simulate generation with a timeout (in production this would call an AI endpoint)
    setTimeout(() => {
      const docSummaries = docs.map((d, i) => `${i + 1}. Based on ${d.name}: ${d.text.slice(0, 200)}${d.text.length > 200 ? '...' : ''}`).join('\n');
      const generated = `That the brief facts of the case are as follows:\n\n${docSummaries}\n\n[Please review and edit the above generated facts as needed]`;
      setFormData(prev => ({ ...prev, [key]: generated }));
      setFactsGenerating(prev => ({ ...prev, [key]: false }));
    }, 1500);
  };

  // Handle facts document upload
  const handleFactsDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const key = activateFactsKey;
    if (!files || !key) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        setFactsDocuments(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), { name: file.name, text: text.slice(0, 5000) }],
        }));
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  // Build content from form fields
  const buildContentFromForm = () => {
    if (!selectedTemplate) return '';
    let content = selectedTemplate.content;
    // Remove lines containing hidden field placeholders
    for (const key of Object.keys(hiddenFields)) {
      if (hiddenFields[key]) {
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        content = content.replace(new RegExp(`[^\\n]*\\[${escaped}\\][^\\n]*\\n?`, 'g'), '');
      }
    }
    // Replace grounds section — remove predefined grounds from template and insert all from groundsItems
    for (const [key, items] of Object.entries(groundsItems)) {
      if (items.length > 0 && !hiddenFields[key]) {
        // Remove the predefined ground lines from template (lines with "(a) That..." up to the placeholder)
        const groundsSectionRegex = /(\d+\.\s*(?:GROUNDS?\s*(?:FOR\s+\w+)?):?\s*\n)([\s\S]*?)(\[[\w\s]*GROUND[\w\s]*\])/i;
        const match = content.match(groundsSectionRegex);
        if (match) {
          const formatted = items.map((g, i) => {
            // If ground already has (x) prefix, use as-is but re-letter it
            const stripped = g.replace(/^\([a-z]\)\s*/, '');
            return `   (${String.fromCharCode(97 + i)}) ${stripped}`;
          }).join('\n\n');
          content = content.replace(groundsSectionRegex, `$1\n${formatted}`);
        } else {
          // Fallback: just replace the placeholder
          const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const formatted = items.map((g, i) => {
            const stripped = g.replace(/^\([a-z]\)\s*/, '');
            return `   (${String.fromCharCode(97 + i)}) ${stripped}`;
          }).join('\n\n');
          content = content.replace(new RegExp(`[^\\n]*\\[${escaped}\\]`, 'g'), formatted);
        }
      }
    }
    for (const [key, value] of Object.entries(formData)) {
      if (value && !hiddenFields[key]) {
        content = content.replace(new RegExp(`\\[${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g'), value);
      }
    }
    // Append annexures
    if (annexures.length > 0) {
      content += '\n\nANNEXURES:\n\n';
      annexures.forEach((a, i) => {
        content += `Annexure ${String.fromCharCode(65 + i)}: ${a.label}${a.fileName ? ` (${a.fileName})` : ''}\n`;
      });
    }
    return content;
  };

  const getEditorText = () => {
    if (editorMode === 'form') return buildContentFromForm();
    if (editorRef.current) {
      return editorRef.current.innerText || editorRef.current.textContent || editableContent;
    }
    return editableContent;
  };

  const getEditorHtml = () => {
    if (editorMode === 'form') {
      return formatDocumentHtml(buildContentFromForm(), false);
    }
    return editorRef.current?.innerHTML || '';
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    const content = getEditorText();
    saveDraft({
      id: draftId,
      templateId: selectedTemplate.id,
      templateTitle: selectedTemplate.title,
      content,
      formData,
      attachments,
      savedAt: Date.now(),
    });
    toast('Draft saved', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEditorText());
    toast('Copied to clipboard', 'success');
  };

  const handleDownload = () => {
    const blob = new Blob([getEditorText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.title || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Document downloaded', 'success');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const text = getEditorText();
    const html = formatDocumentHtml(text, false);
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${selectedTemplate?.title || 'Legal Document'}</title>
<style>
  @page { margin: 1in; }
  body { font-family: 'Times New Roman', 'Georgia', serif; font-size: 13pt; line-height: 1.8; color: #000; max-width: 700px; margin: 0 auto; }
  div { page-break-inside: avoid; }
</style>
</head><body>${html}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    toast(`${files.length} file(s) attached`, 'success');
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    toast(`${files.length} document(s) uploaded`, 'success');
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredTemplates = TEMPLATES.filter(t => {
    if (filterCategory && t.category !== filterCategory) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const formFields = selectedTemplate ? extractFields(selectedTemplate.content) : [];

  // ===== EDITOR VIEW =====
  if (selectedTemplate) {
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <main className="w-full px-4 pt-24 pb-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedTemplate(null); setEditableContent(''); setAttachments([]); setFormData({}); }}
                className="flex items-center gap-2 text-sm text-brass-400/70 hover:text-brass-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Templates
              </button>
              <span className="text-gray-600">|</span>
              <h2 className="text-lg font-display font-semibold text-white">{selectedTemplate.title}</h2>
              <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06] text-xs">{selectedTemplate.category}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={handleSave} className="btn-outline !py-2 !px-2.5 sm:!px-4 text-sm flex items-center gap-1.5" title="Save">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                <span className="hidden sm:inline">Save</span>
              </button>
              <button onClick={handleCopy} className="btn-outline !py-2 !px-2.5 sm:!px-4 text-sm flex items-center gap-1.5" title="Copy">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button onClick={handleDownload} className="btn-outline !py-2 !px-2.5 sm:!px-4 text-sm flex items-center gap-1.5" title="Download">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                <span className="hidden sm:inline">Download</span>
              </button>
              <button onClick={handlePrint} className="btn-gavel !py-2 !px-2.5 sm:!px-4 text-sm flex items-center gap-1.5" title="Print">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12z" /></svg>
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
              <button
                onClick={() => {
                  if (editorMode === 'form') {
                    // Only update editableContent if no saved HTML (means user hasn't been in editor yet)
                    if (!savedEditorHtml) {
                      const content = buildContentFromForm();
                      setEditableContent(content);
                    }
                  }
                  setEditorMode('editor');
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${editorMode === 'editor' ? 'bg-brass-400/20 text-brass-300 shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  Rich Editor
                </span>
              </button>
              <button
                onClick={() => {
                  if (editorMode === 'editor' && editorRef.current) {
                    // Save both the HTML and plain text
                    setSavedEditorHtml(editorRef.current.innerHTML || '');
                    setEditableContent(editorRef.current.innerText || '');
                  }
                  setEditorMode('form');
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${editorMode === 'form' ? 'bg-brass-400/20 text-brass-300 shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
                  Form Mode
                </span>
              </button>
            </div>

            {/* Attachment buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
              <input ref={docInputRef} type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf" onChange={handleDocUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                Attach Files
              </button>
              <button
                onClick={() => docInputRef.current?.click()}
                className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                Upload Document
              </button>
            </div>
          </div>

          {/* Attachments Bar */}
          {attachments.length > 0 && (
            <div className="glass p-3 mb-4 !border-brass-400/15">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-3.5 h-3.5 text-brass-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                <span className="text-xs font-semibold text-brass-400/50 uppercase tracking-wider">Attachments ({attachments.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-1.5 border border-white/[0.06] group">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {att.type.startsWith('image/') ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      )}
                    </svg>
                    <span className="text-xs text-gray-300 max-w-[150px] truncate">{att.name}</span>
                    <span className="text-xs text-gray-600">{formatFileSize(att.size)}</span>
                    <button onClick={() => removeAttachment(i)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all ml-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-side: Editor/Form + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Editor or Form */}
            <div className="min-w-0">
              {/* Rich Editor Mode */}
              {editorMode === 'editor' && (
                <div className="court-panel p-0 overflow-hidden">
                  <RichToolbar editorRef={editorRef} />
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full min-h-[70vh] bg-transparent text-gray-200 text-sm leading-relaxed p-8 focus:outline-none prose prose-invert max-w-none"
                    style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
                    onInput={() => {
                      if (editorRef.current) {
                        setLiveEditorHtml(editorRef.current.innerHTML);
                      }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formatDocumentHtml(editableContent, true)
                    }}
                  />
                </div>
              )}

              {/* Form Mode */}
              {editorMode === 'form' && (
                <div className="space-y-4">
                  <div className="glass p-3 flex items-center gap-2 !border-brass-400/15">
                    <svg className="w-4 h-4 text-brass-400/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                    <span className="text-xs text-gray-400">Fill in the fields below. The preview updates live on the right.</span>
                  </div>

                  {/* Hidden file input for facts document upload */}
                  <input ref={factsFileRef} type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png" onChange={handleFactsDocUpload} />
                  <input ref={annexureFileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && newAnnexureLabel.trim()) {
                      setAnnexures(prev => [...prev, { label: newAnnexureLabel.trim(), fileName: file.name, file }]);
                      setNewAnnexureLabel('');
                    }
                    e.target.value = '';
                  }} />

                  <div className="court-panel p-6">
                    <h3 className="text-sm font-semibold text-brass-400/70 uppercase tracking-wider mb-4">Document Fields ({formFields.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formFields.map(f => {
                        // ===== BRIEF FACTS FIELD (Write / Generate) =====
                        if (isFactsField(f.key)) {
                          const mode = factsMode[f.key] || 'write';
                          const docs = factsDocuments[f.key] || [];
                          const generating = factsGenerating[f.key] || false;
                          return (
                            <div key={f.key} className={`md:col-span-2 ${hiddenFields[f.key] ? 'opacity-40' : ''} transition-opacity`}>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs text-gray-400 font-medium">{f.label}</label>
                                <div className="flex items-center gap-2">
                                  <div className="flex bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
                                    <button
                                      onClick={() => setFactsMode(prev => ({ ...prev, [f.key]: 'write' }))}
                                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'write' ? 'bg-brass-400/20 text-brass-300' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                      Write
                                    </button>
                                    <button
                                      onClick={() => setFactsMode(prev => ({ ...prev, [f.key]: 'generate' }))}
                                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'generate' ? 'bg-brass-400/20 text-brass-300' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                      Generate from Documents
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => setHiddenFields(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${hiddenFields[f.key] ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:text-gray-300'}`}
                                  >
                                    {hiddenFields[f.key] ? (
                                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>Hidden</>
                                    ) : (
                                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Hide</>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {mode === 'generate' && !hiddenFields[f.key] && (
                                <div className="glass p-4 mb-3 !border-brass-400/15 space-y-3">
                                  <p className="text-xs text-gray-400">Upload relevant documents (FIR, agreements, notices, etc.) to auto-generate brief facts.</p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => { setActivateFactsKey(f.key); setTimeout(() => factsFileRef.current?.click(), 50); }}
                                      className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                      Upload Documents
                                    </button>
                                    {docs.length > 0 && (
                                      <button
                                        onClick={() => generateBriefFacts(f.key)}
                                        disabled={generating}
                                        className="btn-gavel !py-1.5 !px-4 text-xs flex items-center gap-1.5"
                                      >
                                        {generating ? (
                                          <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</>
                                        ) : (
                                          <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>Generate Brief Facts</>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  {docs.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {docs.map((d, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-1.5 border border-white/[0.06] group">
                                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                          <span className="text-xs text-gray-300 max-w-[120px] truncate">{d.name}</span>
                                          <button onClick={() => setFactsDocuments(prev => ({ ...prev, [f.key]: (prev[f.key] || []).filter((_, j) => j !== i) }))} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <textarea
                                value={formData[f.key] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                                placeholder={mode === 'generate' ? 'Generated facts will appear here — you can edit them after generation' : f.label}
                                rows={5}
                                className="input-field !py-2 text-sm w-full resize-y"
                                disabled={hiddenFields[f.key]}
                              />
                            </div>
                          );
                        }

                        // ===== GROUNDS FIELD (Point-by-point) =====
                        if (isGroundsField(f.key)) {
                          const items = groundsItems[f.key] || [];
                          const predefined = getPredefinedGrounds();
                          return (
                            <div key={f.key} className={`md:col-span-2 ${hiddenFields[f.key] ? 'opacity-40' : ''} transition-opacity`}>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs text-gray-400 font-medium">{f.label}</label>
                                <button
                                  onClick={() => setHiddenFields(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${hiddenFields[f.key] ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:text-gray-300'}`}
                                >
                                  {hiddenFields[f.key] ? (
                                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>Hidden</>
                                  ) : (
                                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Hide</>
                                  )}
                                </button>
                              </div>

                              {!hiddenFields[f.key] && (
                                <div className="space-y-2">
                                  <p className="text-[10px] text-brass-400/50 uppercase tracking-wider font-semibold">Grounds — edit, reorder, or delete as needed</p>
                                  {items.map((g, i) => (
                                    <div key={i} className="flex items-start gap-2 group">
                                      <span className="text-xs text-brass-400/60 font-mono mt-2 min-w-[24px]">({String.fromCharCode(97 + i)})</span>
                                      <textarea
                                        value={g}
                                        onChange={(e) => {
                                          const updated = [...items];
                                          updated[i] = e.target.value;
                                          setGroundsItems(prev => ({ ...prev, [f.key]: updated }));
                                        }}
                                        rows={2}
                                        className="input-field !py-2 text-sm flex-1 resize-none"
                                      />
                                      <button
                                        onClick={() => setGroundsItems(prev => ({ ...prev, [f.key]: items.filter((_, j) => j !== i) }))}
                                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all mt-2"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                    </div>
                                  ))}

                                  {/* Add new ground */}
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs text-brass-400/40 font-mono mt-2 min-w-[24px]">({String.fromCharCode(97 + items.length)})</span>
                                    <input
                                      type="text"
                                      value={newGroundText[f.key] || ''}
                                      onChange={(e) => setNewGroundText(prev => ({ ...prev, [f.key]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (newGroundText[f.key] || '').trim()) {
                                          setGroundsItems(prev => ({ ...prev, [f.key]: [...(prev[f.key] || []), (newGroundText[f.key] || '').trim()] }));
                                          setNewGroundText(prev => ({ ...prev, [f.key]: '' }));
                                        }
                                      }}
                                      placeholder="Type a ground and press Enter to add..."
                                      className="input-field !py-2 text-sm flex-1"
                                    />
                                    <button
                                      onClick={() => {
                                        if ((newGroundText[f.key] || '').trim()) {
                                          setGroundsItems(prev => ({ ...prev, [f.key]: [...(prev[f.key] || []), (newGroundText[f.key] || '').trim()] }));
                                          setNewGroundText(prev => ({ ...prev, [f.key]: '' }));
                                        }
                                      }}
                                      className="btn-outline !py-2 !px-3 text-xs mt-0.5"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }

                        // ===== REGULAR FIELD =====
                        return (
                          <div key={f.key} className={`relative ${hiddenFields[f.key] ? 'opacity-40' : ''} transition-opacity`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs text-gray-400 font-medium">{f.label}</label>
                              <button
                                onClick={() => setHiddenFields(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${hiddenFields[f.key] ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:text-gray-300'}`}
                                title={hiddenFields[f.key] ? 'Show in document' : 'Hide from document'}
                              >
                                {hiddenFields[f.key] ? (
                                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>Hidden</>
                                ) : (
                                  <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Hide</>
                                )}
                              </button>
                            </div>
                            {f.key.includes('FACTS') || f.key.includes('DETAIL') || f.key.includes('DESCRIBE') || f.key.includes('ADDRESS') ? (
                              <textarea
                                value={formData[f.key] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                                placeholder={f.label}
                                rows={3}
                                className="input-field !py-2 text-sm w-full resize-none"
                                disabled={hiddenFields[f.key]}
                              />
                            ) : (
                              <input
                                type={f.key.includes('DATE') ? 'date' : f.key.includes('YEAR') ? 'number' : f.key.includes('AMOUNT') ? 'number' : f.key.includes('EMAIL') ? 'email' : f.key.includes('PHONE') || f.key.includes('CNIC') ? 'tel' : 'text'}
                                value={formData[f.key] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                                placeholder={f.label}
                                className="input-field !py-2 text-sm w-full"
                                disabled={hiddenFields[f.key]}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ===== ANNEXURES SECTION ===== */}
                  <div className="court-panel p-6">
                    <h3 className="text-sm font-semibold text-brass-400/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                      Annexures
                    </h3>

                    {/* Existing annexures */}
                    {annexures.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {annexures.map((a, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-4 py-2.5 border border-white/[0.06] group">
                            <span className="text-xs font-mono text-brass-400 font-bold min-w-[80px]">Annexure {String.fromCharCode(65 + i)}</span>
                            <span className="text-sm text-gray-300 flex-1">{a.label}</span>
                            {a.fileName && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                {a.fileName}
                              </span>
                            )}
                            <button onClick={() => setAnnexures(prev => prev.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new annexure */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-brass-400/50 font-bold min-w-[80px]">Annexure {String.fromCharCode(65 + annexures.length)}</span>
                      <input
                        type="text"
                        value={newAnnexureLabel}
                        onChange={(e) => setNewAnnexureLabel(e.target.value)}
                        placeholder="e.g., Copy of FIR, Sale Agreement, CNIC..."
                        className="input-field !py-2 text-sm flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newAnnexureLabel.trim()) {
                            annexureFileRef.current?.click();
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newAnnexureLabel.trim()) {
                            annexureFileRef.current?.click();
                          }
                        }}
                        className="btn-outline !py-2 !px-3 text-xs flex items-center gap-1.5"
                        title="Add with document"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                        With File
                      </button>
                      <button
                        onClick={() => {
                          if (newAnnexureLabel.trim()) {
                            setAnnexures(prev => [...prev, { label: newAnnexureLabel.trim(), fileName: '' }]);
                            setNewAnnexureLabel('');
                          }
                        }}
                        className="btn-outline !py-2 !px-3 text-xs"
                        title="Add without document"
                      >
                        Add
                      </button>
                    </div>
                    {annexures.length === 0 && (
                      <p className="text-xs text-gray-600 mt-2">Add annexures to reference supporting documents in your draft.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Live Preview */}
            <div className="min-w-0">
              <div className="court-panel p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <h3 className="text-sm font-semibold text-brass-400/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Live Preview
                </h3>
                <div
                  className="text-gray-300 text-sm leading-relaxed"
                  style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
                  dangerouslySetInnerHTML={{
                    __html: editorMode === 'form'
                      ? formatDocumentHtml(buildContentFromForm(), false)
                      : liveEditorHtml || formatDocumentHtml(editableContent, true)
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===== TEMPLATE LIST VIEW =====
  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-2">
          <GavelSVG size={28} className="opacity-40" />
          <h1 className="text-3xl font-display font-bold text-white">Legal Document Drafting</h1>
        </div>
        <p className="text-gray-400 text-sm mb-8">Select a template, edit it with your details, then download or print</p>

        {/* Saved Drafts */}
        {drafts.length > 0 && (
          <div className="court-panel p-6 mb-8">
            <h3 className="text-xs font-semibold text-brass-400/50 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Saved Drafts
            </h3>
            <div className="space-y-2">
              {drafts.map(d => (
                <div key={d.id} className="flex items-center gap-3 group py-2">
                  <button
                    onClick={() => openDraft(d)}
                    className="flex-1 text-left text-sm text-gray-300 hover:text-brass-300 transition-colors truncate"
                  >
                    {d.templateTitle}
                    <span className="text-xs text-gray-600 ml-2">
                      {new Date(d.savedAt).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    onClick={() => removeDraft(d.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field !py-2.5 flex-1"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field !py-2.5 sm:w-48"
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => openTemplate(t)}
              className="card-court text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-brass-400/10 border border-brass-400/20 flex items-center justify-center text-brass-400 mb-4 transition-transform duration-300 group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-white group-hover:text-brass-300 transition-colors mb-1">{t.title}</h3>
              <span className="text-xs text-brass-400/50">{t.category}</span>
            </button>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <GavelSVG size={50} className="mx-auto mb-4 opacity-15" />
            <p className="text-gray-400 font-display">No templates found</p>
            <p className="text-sm mt-1 text-gray-600">Try a different search or category</p>
          </div>
        )}
      </main>
    </div>
  );
}
