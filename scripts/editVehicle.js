function editVehicle(vehicleId) {
    console.log("Opening edit modal for vehicle ID:", vehicleId);

    if (!hasPermission('edit_vehicle')) {
        alert('You do not have permission to edit vehicles');
        return;
    }
    
    const form = document.getElementById('editVehicleForm');
    form.reset();

    const modal = document.getElementById("EditvehicleModal");
    const modalContent = document.getElementById("EditvehicleContent");

    modal.classList.add("active");
    modalContent.classList.remove("hide");

    fetch(`get_vehicle_details.php?id=${vehicleId}`)
        .then(response => response.json())
        .then(vehicle => {
            console.log("Vehicle data:", vehicle);

            console.log(vehicle.needs_repairs) 

            document.getElementById("reg_no").value = vehicle.reg_no || "";
            document.getElementById("type").value = vehicle.type || "";
            document.getElementById("make").value = vehicle.make || "";
            document.getElementById("location").value = vehicle.location || "";
            document.getElementById("inspection_date").value = vehicle.inspection_date || "";
            document.getElementById("vehicleId").value = vehicle.id || "";

    
            const editNeedsRepairsCheckbox  = document.getElementById("editNeedsRepairs");
            const repairTypeField = document.getElementById("repairTypeField");
            const repairTypeTextarea = document.getElementById("repair_type");
            
            console.log("Vehicle needs repairs:", vehicle.needs_repairs);
            editNeedsRepairsCheckbox.checked = parseInt(vehicle.needs_repairs) === 1;
            console.log("Checkbox checked state:", editNeedsRepairsCheckbox .checked);

            repairTypeField.style.display = "block";
            repairTypeTextarea.value = vehicle.repair_type || "";

            updateStatusDisplay(vehicle.id, editNeedsRepairsCheckbox .checked);

            editNeedsRepairsCheckbox .removeEventListener("change", handleCheckboxChange);
            editNeedsRepairsCheckbox .addEventListener("change", handleCheckboxChange);

           
        console.log("Edit modal successfully populated.");
        if (vehicle.images) {
            updateImageGallery(vehicle.images, vehicle.id);
        }
    })
    .catch(error => {
        console.error("Error loading vehicle data:", error);
        showAlert("Error loading vehicle data", "error");
    });
}

function handleCheckboxChange() {
    const vehicleId = document.getElementById("vehicleId").value;
    const isChecked = this.checked;
    console.log("Checkbox changed:", isChecked);
    
    // Update status display immediately
    const statusField = document.getElementById(`status-${vehicleId}`);
    if (statusField) {
        statusField.innerHTML = getStatusBadge(isChecked ? 'Needs Repairs' : 'No Repairs', isChecked ? 1 : 0);
    }
}

function updateStatusDisplay(vehicleId, isChecked) {
    const statusField = document.getElementById(`status-${vehicleId}`);
    if (statusField) {
        statusField.innerHTML = isChecked 
            ? `<span class="text-yellow-600 font-bold">⚠ Needs Repairs</span>`
            : `<span class="text-gray-500 font-bold">No Repairs</span>`;
    }
}


function updateImageGallery(images, vehicleId) {
    const imageGallery = document.getElementById("editImagePreview");
    imageGallery.innerHTML = "";

    const imagesArray = typeof images === "string" ? images.split(",") : images;
    
    if (imagesArray && imagesArray.length > 0) {
        imagesArray.forEach((image, index) => {
            if (image.trim()) {
                const imageContainer = createImageContainer(image.trim(), index, vehicleId);
                imageGallery.appendChild(imageContainer);
            }
        });
    }
}

function createImageContainer(image, index, vehicleId) {
    const container = document.createElement("div");
    container.className = "relative group";

    const img = document.createElement("img");
    img.src = `../assets/vehicles/${image}`;
    img.className = "w-40 h-40 object-cover rounded-lg shadow-lg";

    const deleteButton = document.createElement('button');
    deleteButton.className = 'text-lg absolute block top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center';
    deleteButton.innerHTML = 'X';
    deleteButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this image?')) {
            deleteImage(image, vehicleId, container);
        }
    };

    container.appendChild(img);
    container.appendChild(deleteButton);
    return container;
}

function deleteImage(imageName, vehicleId, container) {
    fetch(`delete_image.php?vehicle_id=${vehicleId}&image=${imageName}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                container.style.display = 'none';
                container.classList.add('pending-delete');
                container.dataset.imageName = imageName;
                showAlert('Image marked for deletion', 'info');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error marking image for deletion', 'error');
        });
}

function closeEditModal() {
    console.log("Closing Edit Modal");

    const editModal = document.getElementById("EditvehicleModal")
    const editModalContent = document.getElementById("EditvehicleContent")

    editModalContent.classList.add("hide")
    editModalContent.addEventListener("animationend", () => {
        editModal.classList.remove("active")
    }, {once: true})

    const form = document.getElementById('editVehicleForm');
    form.reset();
    
    const needsRepairsCheckbox = document.getElementById("needsRepairs");
    const repairTypeField = document.getElementById("repairTypeField");
    needsRepairsCheckbox.checked = false;
    
    needsRepairsCheckbox.removeEventListener("change", handleCheckboxChange);
}

function uploadNewImage(vehicleId) {
    const fileInput = document.getElementById("new_images");
    const existingImages = document.querySelectorAll('#editImagePreview .relative').length;
    const maxTotalImages = 2;

    if (!vehicleId) {
        showAlert("Vehicle ID is missing.", "error");
        return;
    }

    if (fileInput.files.length === 0) {
        showAlert("Please select at least one image.", "error");
        return;
    }

    if (existingImages >= maxTotalImages) {
        showAlert("Maximum images reached. Please delete an existing image before adding new ones.", "error");
        fileInput.value = '';
        return;
    }

    if (existingImages + fileInput.files.length > maxTotalImages) {
        showAlert(`Only ${maxTotalImages - existingImages} more image(s) can be added.`, "error");
        fileInput.value = '';
        return;
    }

    const formData = new FormData();
    formData.append("vehicle_id", vehicleId);

    for (const file of fileInput.files) {
        formData.append("new_image[]", file);
    }

    fetch("upload_new_image.php", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showAlert("Image(s) uploaded successfully!", "success");
            updateImageGallery(result.new_images, vehicleId);
            fileInput.value = "";
        } else {
            showAlert(result.error || "Failed to upload image(s)", "error");
        }
    })
    .catch(error => {
        console.error("Error uploading images:", error);
        showAlert("An error occurred while uploading images", "error");
    });
}

function submitEditForm(e) {
    e.preventDefault();
    
    const form = document.getElementById('editVehicleForm');
    const formData = new FormData(form);

    const deletedImages = document.querySelectorAll('.pending-delete');
    const imagesToDelete = [];
    deletedImages.forEach(img => {
        imagesToDelete.push(img.dataset.imageName);
    });
    formData.append('images_to_delete', JSON.stringify(imagesToDelete));
    
    const editNeedsRepairsCheckbox  = document.getElementById("editNeedsRepairs");
    console.log("Checkbox state:", editNeedsRepairsCheckbox .checked);

    formData.set('needs_repairs', editNeedsRepairsCheckbox .checked ? '1' : '0');

    console.log("Form data before submit:", Object.fromEntries(formData));


    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    fetch("edit_vehicle.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        console.log("Response from server:", result);
        if (result.success) {
            const updatedVehicle = result.vehicle;
            console.log("Updated vehicle:", updatedVehicle);

            updateTableRow(updatedVehicle);
            // updateStatusDisplay(updatedVehicle.id, updatedVehicle.needs_repairs === 1);

            closeEditModal();
            showAlert('Vehicle updated successfully', 'success');
        } else {
            showAlert(result.error || 'Error updating vehicle', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred while updating the vehicle', 'error');
    });
}
document.getElementById('editVehicleForm').removeEventListener('submit', submitEditForm);


// function showAlert(message, type = 'success') {
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
//         type === 'success' ? 'bg-green-100' : 'bg-red-500'
//     } text-white`;
//     alertDiv.textContent = message;
//     document.body.appendChild(alertDiv);
    
//     setTimeout(() => {
//         alertDiv.remove();
//     }, 3000);
// }
function formatText(text, type = 'normal') {
    if (!text) return '';
    if (type === 'reg') return text.toUpperCase();
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function updateTableRow(vehicle) {
    const row = document.querySelector(`tr[data-vehicle-id="${vehicle.id}"]`);
    if (!row) return;

    console.log("Updating row with vehicle data:", vehicle);

    const needs_repairs = parseInt(vehicle.needs_repairs);
    console.log("Needs repairs value:", needs_repairs);

    const serialNumber = row.cells[0].textContent;

    row.innerHTML = `
        <td class="p-4 border-b text-center">${serialNumber}</td>
        <td class="p-4 border-b uppercase">${formatText(vehicle.reg_no, 'reg')}</td>
        <td class="p-4 border-b">${formatText(vehicle.type)}</td>
        <td class="p-4 border-b">${formatText(vehicle.make)}</td>
        <td class="p-4 border-b">${formatText(vehicle.location)}</td>
        <td class="p-4 border-b" id="status-${vehicle.id}">${getStatusBadge(vehicle.status, needs_repairs)}</td>
        <td class="p-4 border-b">${vehicle.inspection_date}</td>
        <td class="p-4 border-b flex items-center justify-around space-x-2 text-lg">
            <button onclick="showDetails(${vehicle.id})" class="text-blue-500 hover:text-blue-700">ℹ</button>
            <button onclick="editVehicle(${vehicle.id})" class="text-yellow-500 hover:text-yellow-700">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button href="clear_vehicle.php?id=${vehicle.id}" class="text-green-500 hover:text-green-700">✔ Clear</button>
            <button onclick="openDeleteModal(${vehicle.id}, '${vehicle.reg_no}')" class="text-red-500 hover:text-red-700">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </td>
    `;
}