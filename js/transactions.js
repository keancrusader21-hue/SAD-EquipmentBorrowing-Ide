

let allTransactions = [];


async function loadTransactions() {
  const { data, error } = await supabaseClient
    .from("borrow_transactions")
    .select("*, equipment(equipment_name, asset_code)")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  
  allTransactions = data.map(applyOverdueLogic);
  renderTransactionsTable(allTransactions);
  updateTransactionStats();
}


function applyOverdueLogic(tx) {
  const today = new Date().toISOString().split("T")[0];
  if (tx.status !== "Returned" && tx.due_date < today) {
    return { ...tx, status: "Overdue" };
  }
  return tx;
}

function updateTransactionStats() {
  const returned = allTransactions.filter((t) => t.status === "Returned").length;
  const overdue = allTransactions.filter((t) => t.status === "Overdue").length;
  document.getElementById("statReturned").textContent = returned;
  document.getElementById("statOverdue").textContent = overdue;
}

function renderTransactionsTable(list) {
  const tbody = document.getElementById("transactionsTableBody");
  tbody.innerHTML = "";

  list.forEach((tx) => {
    const tr = document.createElement("tr");
    const statusClass =
      tx.status === "Returned" ? "badge-green" : tx.status === "Overdue" ? "badge-red" : "badge-orange";

    tr.innerHTML = `
      <td>${tx.equipment ? tx.equipment.equipment_name : "N/A"}</td>
      <td>${tx.borrower_name}</td>
      <td>${tx.borrower_type}</td>
      <td>${tx.department}</td>
      <td>${tx.date_borrowed}</td>
      <td>${tx.due_date}</td>
      <td>${tx.date_returned || "-"}</td>
      <td><span class="badge ${statusClass}">${tx.status}</span></td>
      <td>
        ${tx.status !== "Returned" ? `<button class="btn-small" onclick="returnEquipment(${tx.id})">Return</button>` : ""}
      </td>
    `;
    tbody.appendChild(tr);
  });
}


const borrowForm = document.getElementById("borrowForm");
if (borrowForm) {
  borrowForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("borrowFormError");
    errorBox.textContent = "";

    const equipment_id = document.getElementById("borrowEquipmentSelect").value;
    const borrower_name = document.getElementById("borrowerName").value.trim();
    const borrower_type = document.getElementById("borrowerType").value;
    const department = document.getElementById("borrowerDepartment").value.trim();
    const date_borrowed = document.getElementById("dateBorrowed").value;
    const due_date = document.getElementById("dueDate").value;

    
    if (!borrower_name) {
      errorBox.textContent = "Borrower name must be provided.";
      return;
    }
    
    if (due_date < date_borrowed) {
      errorBox.textContent = "Due date cannot be earlier than the borrowing date.";
      return;
    }
    if (!equipment_id) {
      errorBox.textContent = "Please select an available equipment item.";
      return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();

    
    const { error: txError } = await supabaseClient.from("borrow_transactions").insert([
      {
        equipment_id,
        borrower_name,
        borrower_type,
        department,
        date_borrowed,
        due_date,
        status: "Borrowed",
        user_id: session ? session.user.id : null,
      },
    ]);

    if (txError) {
      errorBox.textContent = txError.message;
      return;
    }

    
    const { error: eqError } = await supabaseClient
      .from("equipment")
      .update({ availability: "Borrowed" })
      .eq("id", equipment_id);

    if (eqError) {
      errorBox.textContent = eqError.message;
      return;
    }

    borrowForm.reset();
    closeBorrowModal();
    await loadEquipment();
    await loadTransactions();
  });
}


async function returnEquipment(transactionId) {
  const tx = allTransactions.find((t) => t.id === transactionId);
  if (!tx) return;


  if (tx.status === "Returned") {
    alert("This transaction has already been returned.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const { error: txError } = await supabaseClient
    .from("borrow_transactions")
    .update({ date_returned: today, status: "Returned" })
    .eq("id", transactionId);

  if (txError) {
    alert(txError.message);
    return;
  }

  
  const { error: eqError } = await supabaseClient
    .from("equipment")
    .update({ availability: "Available" })
    .eq("id", tx.equipment_id);

  if (eqError) {
    alert(eqError.message);
    return;
  }

  await loadEquipment();
  await loadTransactions();
}


const transactionSearchInput = document.getElementById("transactionSearch");
if (transactionSearchInput) {
  transactionSearchInput.addEventListener("input", () => {
    const term = transactionSearchInput.value.toLowerCase();
    const filtered = allTransactions.filter(
      (t) =>
        t.borrower_name.toLowerCase().includes(term) ||
        (t.equipment && t.equipment.equipment_name.toLowerCase().includes(term)) ||
        (t.equipment && t.equipment.asset_code.toLowerCase().includes(term))
    );
    renderTransactionsTable(filtered);
  });
}


const transactionFilterSelect = document.getElementById("transactionStatusFilter");
if (transactionFilterSelect) {
  transactionFilterSelect.addEventListener("change", () => {
    const val = transactionFilterSelect.value;
    if (val === "All") {
      renderTransactionsTable(allTransactions);
    } else {
      renderTransactionsTable(allTransactions.filter((t) => t.status === val));
    }
  });
}


function openBorrowModal() {
  document.getElementById("dateBorrowed").value = new Date().toISOString().split("T")[0];
  document.getElementById("borrowModal").classList.add("show");
}
function closeBorrowModal() {
  document.getElementById("borrowModal").classList.remove("show");
}

const recordBorrowingBtn = document.getElementById("recordBorrowingBtn");
if (recordBorrowingBtn) recordBorrowingBtn.addEventListener("click", openBorrowModal);
