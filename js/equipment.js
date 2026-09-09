

let allEquipment = [];
let editingEquipmentId = null;


async function loadEquipment() {
  const { data, error } = await supabaseClient
    .from("equipment")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  allEquipment = data;
  renderEquipmentTable(allEquipment);
  updateDashboardStats();
  populateEquipmentDropdown(allEquipment);
}

function updateDashboardStats() {
  const total = allEquipment.length;
  const available = allEquipment.filter((e) => e.availability === "Available").length;
  const borrowed = allEquipment.filter((e) => e.availability === "Borrowed").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statAvailable").textContent = available;
  document.getElementById("statBorrowed").textContent = borrowed;

}

function renderEquipmentTable(list) {
  const tbody = document.getElementById("equipmentTableBody");
  tbody.innerHTML = "";

  list.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.asset_code}</td>
      <td>${item.equipment_name}</td>
      <td>${item.category}</td>
      <td>${item.condition}</td>
      <td><span class="badge ${item.availability === "Available" ? "badge-green" : "badge-orange"}">${item.availability}</span></td>
      <td>
        <button class="btn-small" onclick="startEditEquipment(${item.id})">Edit</button>
        <button class="btn-small btn-danger" onclick="deleteEquipment(${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateEquipmentDropdown(list) {
  const select = document.getElementById("borrowEquipmentSelect");
  if (!select) return;
  select.innerHTML = "";
  // BR-03: Only available equipment may be borrowed
  list
    .filter((e) => e.availability === "Available")
    .forEach((e) => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = `${e.equipment_name} (${e.asset_code})`;
      select.appendChild(opt);
    });
}


const equipmentForm = document.getElementById("equipmentForm");
if (equipmentForm) {
  equipmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("equipmentFormError");
    errorBox.textContent = "";

    const equipment_name = document.getElementById("eqName").value.trim();
    const category = document.getElementById("eqCategory").value.trim();
    const asset_code = document.getElementById("eqAssetCode").value.trim();
    const condition = document.getElementById("eqCondition").value;

    
    if (!equipment_name) {
      errorBox.textContent = "Equipment name cannot be empty.";
      return;
    }
    
    const duplicate = allEquipment.find(
      (e) => e.asset_code === asset_code && e.id !== editingEquipmentId
    );
    if (duplicate) {
      errorBox.textContent = "Asset code must be unique.";
      return;
    }

    if (editingEquipmentId) {
      
      const { error } = await supabaseClient
        .from("equipment")
        .update({ equipment_name, category, asset_code, condition })
        .eq("id", editingEquipmentId);

      if (error) {
        errorBox.textContent = error.message;
        return;
      }
      editingEquipmentId = null;
      document.getElementById("equipmentFormTitle").textContent = "Add New Equipment";
    } else {
    
      const { error } = await supabaseClient
        .from("equipment")
        .insert([{ equipment_name, category, asset_code, condition, availability: "Available" }]);

      if (error) {
        errorBox.textContent = error.message;
        return;
      }
    }

    equipmentForm.reset();
    closeEquipmentModal();
    await loadEquipment();
  });
}

function startEditEquipment(id) {
  const item = allEquipment.find((e) => e.id === id);
  if (!item) return;

  editingEquipmentId = id;
  document.getElementById("eqName").value = item.equipment_name;
  document.getElementById("eqCategory").value = item.category;
  document.getElementById("eqAssetCode").value = item.asset_code;
  document.getElementById("eqCondition").value = item.condition;
  document.getElementById("equipmentFormTitle").textContent = "Edit Equipment";
  openEquipmentModal();
}


async function deleteEquipment(id) {
  // BR-10: Deletion requires user confirmation
  const confirmed = confirm("Are you sure you want to delete this equipment?");
  if (!confirmed) return;

  const { error } = await supabaseClient.from("equipment").delete().eq("id", id);
  if (error) {
    alert(error.message);
    return;
  }
  await loadEquipment();
}


const equipmentSearchInput = document.getElementById("equipmentSearch");
if (equipmentSearchInput) {
  equipmentSearchInput.addEventListener("input", () => {
    const term = equipmentSearchInput.value.toLowerCase();
    const filtered = allEquipment.filter(
      (e) =>
        e.equipment_name.toLowerCase().includes(term) ||
        e.asset_code.toLowerCase().includes(term)
    );
    renderEquipmentTable(filtered);
  });
}


const equipmentFilterSelect = document.getElementById("equipmentAvailabilityFilter");
if (equipmentFilterSelect) {
  equipmentFilterSelect.addEventListener("change", () => {
    const val = equipmentFilterSelect.value;
    if (val === "All") {
      renderEquipmentTable(allEquipment);
    } else {
      renderEquipmentTable(allEquipment.filter((e) => e.availability === val));
    }
  });
}


function openEquipmentModal() {
  document.getElementById("equipmentModal").classList.add("show");
}
function closeEquipmentModal() {
  document.getElementById("equipmentModal").classList.remove("show");
  editingEquipmentId = null;
  document.getElementById("equipmentFormTitle").textContent = "Add New Equipment";
  const form = document.getElementById("equipmentForm");
  if (form) form.reset();
}

const addEquipmentBtn = document.getElementById("addEquipmentBtn");
if (addEquipmentBtn) addEquipmentBtn.addEventListener("click", openEquipmentModal);
