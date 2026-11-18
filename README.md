# Laboratory Exercise 3 — Submission

Name: 
Kean Ide

Section:
BSIT 3B
---

## 1. GitHub Repository URL
```
https://github.com/keancrusader21-hue/SAD-EquipmentBorrowing-Ide
```

## 2. GitHub Pages Live System URL
```
https://keancrusader21-hue.github.io/SAD-EquipmentBorrowing-Ide/
```

## Test Account (Supabase Auth)
Email: admin@gmail.com
Password: 123456


## 3. README Documentation
The College currently records equipment borrowing manually, making it hard to track which items are borrowed, who holds them, when they are due, and which transactions are overdue. This affects students, faculty, and staff who borrow laptops, projectors, and other ICT equipment, as well as the custodian managing them. The manual process causes lost records, unreturned items, and no reliable way to check availability in real time. The proposed Online Equipment Borrowing and Return Monitoring System addresses this by centralizing equipment records and borrowing transactions in a Supabase database, automatically updating availability and flagging overdue items.
## 4. Use Case Diagram

```
User
  |
  |-- Login
  |-- View Dashboard
  |-- Manage Equipment
  |     |-- Add
  |     |-- View
  |     |-- Edit
  |     |-- Delete
  |
  |-- Record Borrowing
  |-- View Transactions
  |-- Return Equipment
  |-- Search
  |-- Filter
  |-- Logout
```

"Manage Equipment" includes Add, View, Edit, Delete as sub-actions. "Search" and "Filter" apply to both the Equipment list and the Transactions list. "Return Equipment" is distinct from "Record Borrowing" because it updates two records at once (the transaction and the equipment's availability).

## 5. Entity-Relationship Diagram (ERD)

```
EQUIPMENT
--------------------
PK id
equipment_name
category
asset_code
condition
availability
     |
     | 1
     |
     V M
BORROW_TRANSACTION
--------------------
PK id
FK equipment_id
borrower_name
borrower_type
department
date_borrowed
due_date
date_returned
status
user_id
```

**Relationship:** One equipment item may appear in multiple borrowing transactions over time, but each borrowing transaction refers to exactly one equipment item — a **one-to-many (1:M)** relationship enforced by the `equipment_id` foreign key.

## 6. Requirements Traceability Matrix

| Requirement | Feature | Test |
|---|---|---|
| FR-01 | User Login | TC-01 |
| FR-02 | Add Equipment | TC-02 |
| FR-03 | Edit Equipment | TC-03 |
| FR-04 | Delete Equipment | TC-04 |
| FR-05 | Record Borrowing | TC-05 |
| FR-06 | Return Equipment | TC-06 |
| FR-07 | Detect Overdue | TC-07 |
| FR-08 | Search Records | TC-08 |
| FR-09 | Filter Records | TC-09 |
| FR-10 | Dashboard Summary | TC-10 |



## 7. Functional Testing Results

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-01 | Login with valid account | Dashboard displayed | Dashboard displayed with stats and user email shown | **PASS** |
| TC-02 | Add equipment | Record successfully saved | Equipment saved and shown in table | **PASS** |
| TC-03 | Edit equipment | Changes displayed | Edited equipment condition; table updated immediately | **PASS** |
| TC-04 | Delete equipment | Confirmation shown before deletion | Browser confirm() dialog appeared before record was removed | **PASS** |
| TC-05 | Borrow available equipment | Transaction saved and equipment becomes Borrowed | Transaction recorded, equipment status changed | **PASS** |
| TC-06 | Return equipment | Transaction becomes Returned and equipment becomes Available | Transaction status changed to Returned, equipment back to Available | **PASS** |
| TC-07 | View late borrowing | Record displayed as Overdue | Transaction with past due_date correctly flagged Overdue with red badge | **PASS** |
| TC-08 | Search borrower | Matching transactions displayed | Typing borrower name filtered table to matching rows | **PASS** |
| TC-09 | Filter Borrowed status | Only Borrowed transactions displayed | Status filter dropdown correctly narrowed the list | **PASS** |
| TC-10 | Open deployment URL | System accessible online | Live at keancrusader21-hue.github.io/SAD-EquipmentBorrowing-Ide/, dashboard and data load correctly | **PASS** |
