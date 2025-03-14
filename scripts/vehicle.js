

function openLogoutModal() {
    const logoutModal = document.getElementById('logoutModal')
    const logoutModalcontent = document.getElementById('logoutModalcontent')
    
    logoutModal.classList.add("active");
    logoutModalcontent.classList.remove("hide");
}

function closeLogoutModal() {
    const logoutModal = document.getElementById('logoutModal')
    const logoutModalcontent = document.getElementById('logoutModalcontent')

    logoutModalcontent.classList.add("hide")
    logoutModalcontent.addEventListener('animationend', () => {
        logoutModal.classList.remove("active")
    },{once: true})
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openSidebarButton = document.getElementById('open-sidebar');

    openSidebarButton.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    openSidebarButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('-translate-x-full');
    });

    // Close the sidebar when clicking outside of it
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !openSidebarButton.contains(e.target)) {
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.add('sidebar-close');
        }
    });
});

// Toggle vehicle status filter
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="vehicleFilter"]');
    const tbody = document.querySelector('table tbody');
    const searchInput = document.getElementById('searchInput');
    let currentFilter = null;
    
    function getStatusBadge(status) {
        const badges = {
            'Fixed': `<span class="text-green-500 font-bold">✔ Cleared</span>`,
            'Needs Repairs': `<span class="text-yellow-600 font-bold">⚠ Needs Repairs</span>`,
            'No Repairs': `<span class="text-gray-500 font-bold">No Repairs</span>`
        };
        return badges[status] || `<span class="text-gray-500 font-bold"> ${status}</span>`;
    }

    async function updateVehicles(filter, search= "") {
        try {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center p-4">
                        <i class="fas fa-spinner fa-spin"></i> Loading...
                    </td>
                </tr>
            `;
            
            const response = await fetch(`api/filter_vehicles.php?filter=${filter}&search=${search}`);
            const data = await response.json();
            
            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || 'Server error occurred');
            }
    
            if (data.data.length === 0) {
                const message = filter === 'cleared' ? 'No cleared vehicles found' : 
                              filter === 'repairs' ? 'No vehicles needing repairs found' : 
                              filter === 'no_repairs' ? 'No vehicles without repairs found' : 
                              'No vehicles found';
                              
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center p-4">${message}</td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = data.data.map((vehicle, index) => `
                <tr class="hover:bg-gray-300" data-vehicle-id="${vehicle.id}">
                    <td class="p-4 border-b font-bold">${index + 1}</td>
                    <td class="p-4 border-b uppercase">${formatText(vehicle.reg_no, 'reg')}</td>
                    <td class="p-4 border-b capitalize">${formatText(vehicle.type)}</td>
                    <td class="p-4 border-b capitalize">${formatText(vehicle.make)}</td>
                    <td class="p-4 border-b capitalize">${formatText(vehicle.location)}</td>
                    <td class="p-4 border-b" id="status-${vehicle.id}">${getStatusBadge(vehicle.status, vehicle.needs_repairs)}</td>
                    <td class="p-4 border-b">${vehicle.inspection_date || 'N/A'}</td>
                    <td class="p-4 border-b flex items-center justify-around space-x-2 text-lg">
                    <button onclick="showDetails(${vehicle.id})" 
                            class="text-blue-500 hover:text-blue-700">ℹ</button>
                    ${vehicle.status === 'Fixed' ? `
                        <button class="text-yellow-500 opacity-50 cursor-not-allowed" 
                                disabled title="This vehicle is fixed and cannot be edited">
                            <i class="fa-solid fa-pen-to-squar</button>e"></i>
                        </button>
                        <button onclick="openClearModal(${vehicle.id}, '${vehicle.reg_no}')"
                                class="text-green-500 opacity-50 cursor-not-allowed" 
                                disabled title="This vehicle is already cleared">✔ Clear</button>
                    ` : hasPermission('edit_vehicle') ?`
                        <button onclick="editVehicle(${vehicle.id})" 
                                class="text-yellow-500 hover:text-yellow-700">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="openClearModal(${vehicle.id}, '${vehicle.reg_no}')" 
                           class="text-green-500 hover:text-green-700">✔ Clear</button>
                    `: ''}
                    ${hasPermission('delete_vehicle') ? `
                    <button onclick="openDeleteModal(${vehicle.id}, '${vehicle.reg_no}')"
                            class="text-red-500 hover:text-red-700">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    ` : ''}
                </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center p-4 text-red-500">
                        <i class="fas fa-exclamation-circle mr-1"></i>
                        Error loading vehicles: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    function handleFilterClick(e) {
        const clickedFilter = e.target;
        const filterValue = clickedFilter.value;
        
        if (currentFilter === filterValue) {
            clickedFilter.checked = false;
            currentFilter = null;
            updateVehicles('all', searchInput.value);
            
            document.querySelectorAll('input[name="vehicleFilter"] + label').forEach(label => {
                label.classList.remove('bg-yellow-500');
                label.classList.add('bg-gray-700');
            });
        } else {
            currentFilter = filterValue;
            updateVehicles(filterValue, searchInput.value);
            
            document.querySelectorAll('input[name="vehicleFilter"] + label').forEach(label => {
                label.classList.remove('bg-yellow-500');
                label.classList.add('bg-gray-700');
            });
            clickedFilter.nextElementSibling.classList.remove('bg-gray-700');
            clickedFilter.nextElementSibling.classList.add('bg-yellow-500');
        }
    }

    radioButtons.forEach(radio => {
        radio.addEventListener('click', handleFilterClick);
    });

    searchInput.addEventListener('input', () => {
        updateVehicles(currentFilter || 'all', searchInput.value);
    });

    updateVehicles('all');
});

function toggleRepairType() {
    const needsRepairsCheckbox = document.getElementById("needsRepairs");
    const repairTypeField = document.getElementById("repairTypeField");

    if (!needsRepairsCheckbox || !repairTypeField) {
        console.error("Checkbox or repair type field not found!");
        return;
    }

    console.log("Checkbox initial state:", needsRepairsCheckbox.checked);
    
    repairTypeField.style.display = needsRepairsCheckbox.checked ? "block" : "none";
    
    if (!needsRepairsCheckbox.checked) {
        const repairTypeTextarea = document.getElementById("repair_type");
        if (repairTypeTextarea) {
            repairTypeTextarea.value = "";
        }
    }

    console.log("Checkbox checked:", needsRepairsCheckbox.checked);
    console.log("Repair type field display:", repairTypeField.style.display);
}

function hasPermission(permission) {
    
    if (window.isAdmin === true) {
        return true;
    }
    
    if (typeof window.userPermissions === 'object' && window.userPermissions !== null) {
        return Boolean(window.userPermissions[permission]);
    }
    
    console.warn('Permissions not properly initialized');
    return false;
}

function openModal() {
    const modal = document.getElementById("vehicleModal");
    const modalContent = document.getElementById("vehicleModalContent");
    console.log("add vehicle modal")

    if (!hasPermission('add_vehicle')) {
        showAlert('You do not have permission to add vehicles');
        return;
    }

    modal.classList.add("active");
    modalContent.classList.remove("hide");
}
  
  function closeModal() {
    const modal = document.getElementById("vehicleModal");
    const modalContent = document.getElementById("vehicleModalContent");
  
    modalContent.classList.add("hide");
    modalContent.addEventListener("animationend", () => {
      modal.classList.remove("active");
    }, { once: true });
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

const createResponseElement = () => {
    let responseMessage = document.getElementById('responseMessage');
    if (!responseMessage) {
        responseMessage = document.createElement('div');
        responseMessage.id = 'responseMessage';
        const form = document.getElementById('addVehicleForm');
        form.parentNode.insertBefore(responseMessage, form.nextSibling);
    }
    return responseMessage;
};

document.getElementById('addVehicleForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Create or get response message element
    const responseMessage = createResponseElement();
    responseMessage.textContent = 'Uploading...';
    responseMessage.className = '';

    const formData = new FormData(this);

    const needsRepairsCheckbox = document.getElementById("needsRepairs");
    formData.set('needs_repairs', needsRepairsCheckbox.checked ? '1' : '0');
    
    
    // Log the FormData contents for debugging (optional)
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }  

    fetch('add_vehicle.php', {
        method: 'POST',
        body: formData
    })

     
    .then((response) => response.text())
    .then((text) => {
        console.log('Raw server response:', text); 

        let data; 
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            throw new Error(`Server response was not valid JSON: ${text.replace(/<[^>]*>/g, '')}`);
        }
        
        if (!data.status || data.status !== 'success') {
            throw new Error(data.message || 'Server error occurred');
        }

        responseMessage.classList.remove('text-red-600');
        responseMessage.textContent = data.message;
        responseMessage.classList.add('text-green-600');

        if (typeof closeModal === 'function') {
            closeModal();
            this.reset();
            clearImagePreviews();
            responseMessage.textContent = '';
        }
        if (typeof addVehicleToTable === 'function') {
            addVehicleToTable(data.vehicle);
            showAlert('Vehicle Added successfully', 'success')
            console.log("Adding vehicle with data:", data.vehicle);
            this.reset();
        }

    })
    .catch(error => {
        console.error('Error:', error);
        responseMessage.textContent = error.message || 'An error occurred while uploading. Please try again.';
        responseMessage.classList.remove('text-green-600');
        responseMessage.classList.add('text-red-600');
    });

});

function clearImagePreviews() {
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
    
    const imageInput = document.getElementById('images');
    if (imageInput) {
        imageInput.value = '';
    }
}

function getStatusBadge(status, needsRepairs) {
    console.log("Getting status badge:", { status, needsRepairs });

    const repairsNeeded = parseInt(needsRepairs) || 0;
    
    if (repairsNeeded === 1) {
        return `<span class="text-yellow-600 font-bold">⚠ Needs Repairs</span>`;
    } else if (status === 'Fixed') {
        return `<span class="text-green-500 font-bold">✔ Cleared</span>`;
    }
    return `<span class="text-gray-500 font-bold">No Repairs</span>`;
}

function updateVehicleStatus(vehicleId) {
    const row = document.querySelector(`tr[data-vehicle-id="${vehicleId}"]`);
    if (row) {
        const statusCell = row.querySelector('.status-cell');
        if (statusCell) {
            statusCell.innerHTML = getStatusBadge('Fixed', 0);
        }

        const actionCell = row.querySelector('.action-cell');
        if (actionCell) {
            actionCell.innerHTML = `
                <button onclick="showDetails(${vehicleId})" class="text-blue-500 hover:text-blue-700">ℹ</button>
                <button class="text-yellow-500 opacity-50 cursor-not-allowed" disabled>
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="text-green-500 opacity-50 cursor-not-allowed" disabled>✔ Clear</button>
            `;
        }

        const repairsCell = row.querySelector('.repairs-cell');
        if (repairsCell) {
            repairsCell.innerHTML = '<span class="text-gray-500 font-bold">No Repairs</span>';
        }
    }
}

function formatText(text, type = 'normal') {
    if (!text) return '';
    if (type === 'reg') return text.toUpperCase();
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function addVehicleToTable(vehicle) {
    console.log("Adding vehicle with full data:", vehicle);

    const existingRows = document.querySelectorAll(`tr[data-vehicle-id="${vehicle.id}"]`);
    existingRows.forEach(row => row.remove());
    const tbody = document.querySelector("table tbody");

    const noVehiclesRow = tbody.querySelector('tr td[colspan="7"]');
    if (noVehiclesRow && noVehiclesRow.textContent.includes('No vehicles found')) {
        noVehiclesRow.parentElement.remove();
    }

    const serialNumber = tbody.children.length + 1;

    const needs_repairs = vehicle.needs_repairs === "1" || vehicle.needs_repairs === 1 ? 1 : 0;
    const status = needs_repairs === 1 ? 'Needs Repairs' : 'No Repairs';

    const statusDisplay = getStatusBadge(status, needs_repairs);

    console.log("Processing status:", { needs_repairs, status });

    const newRow = document.createElement("tr");
    newRow.setAttribute("data-vehicle-id", vehicle.id);
    newRow.className = "hover:bg-gray-500"

    const actionButtons = `
    <button onclick="showDetails(${vehicle.id})" class="text-blue-500 hover:text-blue-700">ℹ</button>
    ${hasPermission('edit_vehicle') ? 
        `<button onclick="editVehicle(${vehicle.id})" class="text-yellow-500 hover:text-yellow-700">
            <i class="fa-solid fa-pen-to-square"></i>
        </button>` : ''
    }
    ${hasPermission('clear_vehicle') ? 
        `<button data-vehicle-id="${vehicle.id}" 
            data-vehicle-reg-no="${vehicle.reg_no}"
            onclick="openClearModal(${vehicle.id}, '${vehicle.reg_no}')"
            class="text-green-500 hover:text-green-700">✔ Clear</button>` : ''
    }
    ${hasPermission('delete_vehicle') ? 
        `<button class="text-red-500 hover:text-red-700 delete-button" 
            data-vehicle-id="${vehicle.id}" 
            data-vehicle-reg-no="${vehicle.reg_no}">
            <i class="fa-solid fa-trash-can"></i>
        </button>` : ''
    }
`;

    newRow.innerHTML = `
        <td class="p-4 border-b font-bold">${serialNumber}</td>
        <td class="p-4 border-b uppercase">${formatText(vehicle.reg_no, 'reg')}</td>
        <td class="p-4 border-b">${formatText(vehicle.type)}</td>
        <td class="p-4 border-b">${formatText(vehicle.make)}</td>
        <td class="p-4 border-b">${formatText(vehicle.location)}</td>
        <td class="p-4 border-b" id="status-${vehicle.id}">${statusDisplay}</td>
        <td class="p-4 border-b">${vehicle.inspection_date}</td>
        <td class="p-4 border-b flex items-center justify-around space-x-2 text-lg">
            ${actionButtons}
        </td>
    `;

    tbody.appendChild(newRow);

    console.log("Row added for vehicle ID:", vehicle.id);
}


function showDetails(vehicleId) {
    console.log('Showing details for vehicle:', vehicleId);

    const detailsModal = document.getElementById("detailsModal");
    const detailsModalContent = document.getElementById("detailsModalContent");
    
    fetch(`get_vehicle_details.php?id=${vehicleId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(vehicle => {
            console.log('Vehicle data:', vehicle);
            
            // Update text content
            document.getElementById("detailRegNo").textContent = vehicle.reg_no || 'N/A';
            document.getElementById("detailType").textContent = vehicle.type || 'N/A';
            document.getElementById("detailMake").textContent = vehicle.make || 'N/A';
            document.getElementById("detailLocation").textContent = vehicle.location || 'N/A';
            document.getElementById("detailStatus").textContent = vehicle.status || 'N/A';
            document.getElementById("detailRepair").textContent = vehicle.repair_type || 'N/A';
            document.getElementById("detailInspectionDate").textContent = vehicle.inspection_date || 'N/A';
            document.getElementById("detailRepairDate").textContent = vehicle.repair_completion_date || 'Not fixed';

            // Handle images
            const imageGallery = document.getElementById("imageGallery");
            imageGallery.innerHTML = '';

            if (vehicle.images) {
                const imagesArray = typeof vehicle.images === 'string' 
                    ? vehicle.images.split(',').filter(img => img.trim())
                    : Array.isArray(vehicle.images) ? vehicle.images : [];

                if (imagesArray.length > 0) {
                    imagesArray.forEach((image, index) => {
                        const imgContainer = document.createElement("div");
                        imgContainer.className = "relative group cursor-pointer hover:opacity-75 transition-opacity";
                        
                        const img = document.createElement("img");
                        img.src = `../assets/vehicles/${image.trim()}`;
                        img.className = "w-full h-32 object-cover rounded-lg shadow-md";
                        img.alt = `Vehicle image ${index + 1}`;
                        
                        imgContainer.onclick = () => {
                            openCarousel(image.trim(), imagesArray);
                        };
                        
                        imgContainer.appendChild(img);
                        imageGallery.appendChild(imgContainer);
                    });

                    currentImages = imagesArray;
                }
            }

            // Show modal
            detailsModal.classList.remove("hidden");
            detailsModal.classList.add("active");
            detailsModalContent.classList.remove("hide");
        })
        .catch(error => {
            console.error('Error fetching vehicle details:', error);
            showAlert('Error loading vehicle details', 'error');
        });
}

function closeDetailsModal() {
    const detailsModal = document.getElementById("detailsModal");
    const detailsModalContent = document.getElementById("detailsModalContent");
    console.log("details model closed");
    
    detailsModalContent.classList.add("hide");  
    
    setTimeout(() => {
        detailsModal.classList.remove("active"); 
    }, 400);

    closeCarousel()
}

function previewImages() {
    const imagePreview = document.getElementById('imagePreview');
    const input = document.getElementById('images');
    const files = input.files;
    const maxImages = 2;

    imagePreview.innerHTML = '';

    if (files.length > maxImages) {
        showAlert(`Maximum ${maxImages} images allowed`, 'error');
        input.value = '';
        return;
    }

    const processedFiles = new Set();

    Array.from(files).forEach((file, index) => {
        
        if (processedFiles.has(file.name)) {
            return;
        }
        
        processedFiles.add(file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewWrapper = document.createElement('div');
            previewWrapper.className = 'relative group';
            previewWrapper.dataset.fileName = file.name;

            const imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.className = 'previewImg object-cover rounded-lg shadow-lg';

            const deleteButton = document.createElement('button');
            deleteButton.className = 'text-lg absolute block top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center';
            deleteButton.innerHTML = 'X';
            deleteButton.onclick = (e) => {
                e.preventDefault();
                removeImage(index, previewWrapper, input);
            };

            previewWrapper.appendChild(imgElement);
            previewWrapper.appendChild(deleteButton);
            imagePreview.appendChild(previewWrapper);
        };

        reader.readAsDataURL(file);
    });
}

function removeImage(index, previewWrapper, input) {
    if (!input || !input.files) return;

    const dt = new DataTransfer();
    const { files } = input;

    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }

    input.files = dt.files;
    previewWrapper.remove();
}

// document.addEventListener('DOMContentLoaded', () => {
//     const imageInput = document.getElementById('images');
//     if (imageInput) {
//         imageInput.addEventListener('change', previewImages);
//     }
// });

function showdetails() {
    document.getElementById("detailsModal").classList.remove("hidden");
    console.log("details model");
}

function closeDetails() {
    document.getElementById("detailsModal").classList.add("hidden");
    closeCarousel();
    console.log("details model closed");
}


// Ensure images is an array
let currentImages = [];
let currentImageIndex = 0;

function initializeCarousel(images) {
    currentImages = images;
    currentImageIndex = 0;
    updateCarouselImage();
    updateImageCounter();
}

function updateCarouselImage() {
    const img = document.getElementById('enlargedImg');
    img.src = `../assets/vehicles/${currentImages[currentImageIndex]}`;
}

function updateImageCounter() {
    document.getElementById('currentImageIndex').textContent = currentImageIndex + 1;
    document.getElementById('totalImages').textContent = currentImages.length;
}

function showPrevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
    } else {
        currentImageIndex = currentImages.length - 1;
    }
    updateCarouselImage();
    updateImageCounter();
}

function showNextImage() {
    if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
    } else {
        currentImageIndex = 0;
    }
    updateCarouselImage();
    updateImageCounter();
}

function openCarousel(imageSrc, images) {
    const modal = document.getElementById('carouselModal');
    const enlargedImg = document.getElementById('enlargedImg');
    
    // Reset any existing transform
    enlargedImg.style.transform = 'scale(1)';
    
    // Add loading state
    enlargedImg.classList.add('opacity-50');
    const loader = document.createElement('div');
    loader.className = 'absolute inset-0 flex items-center justify-center';
    loader.innerHTML = '<div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>';
    enlargedImg.parentElement.appendChild(loader);
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Initialize carousel with cleaned image array
    const cleanedImages = images.map(img => img.trim());
    initializeCarousel(cleanedImages);
    currentImageIndex = cleanedImages.indexOf(imageSrc.trim());
    
    // Preload image
    const img = new Image();
    img.onload = function() {
        enlargedImg.classList.remove('opacity-50');
        if (loader) loader.remove();
        updateCarouselImage();
        updateImageCounter();
    };
    img.src = `../assets/vehicles/${imageSrc}`;

    // Add keyboard navigation
    document.addEventListener('keydown', handleCarouselKeyPress);
}

function updateCarouselImage() {
    const img = document.getElementById('enlargedImg');
    if (!currentImages[currentImageIndex]) return;
    
    // Reset zoom before loading new image
    img.style.transform = 'scale(1)';
    
    img.src = `../assets/vehicles/${currentImages[currentImageIndex].trim()}`;
    img.className = 'max-h-[85vh] max-w-[85vw] w-auto h-auto object-contain rounded-lg transition-all duration-300';
    img.style.margin = 'auto';
}

// Improved zoom functionality
function addZoomCapability() {
    const enlargedImg = document.getElementById('enlargedImg');
    let scale = 1;
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let currentPos = { x: 0, y: 0 };
    
    enlargedImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(1, scale + delta), 3);
        
        if (newScale !== scale) {
            scale = newScale;
            enlargedImg.style.transform = `scale(${scale}) translate(${currentPos.x}px, ${currentPos.y}px)`;
        }
    });

    enlargedImg.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            startPos = {
                x: e.clientX - currentPos.x,
                y: e.clientY - currentPos.y
            };
        }
    });

    enlargedImg.addEventListener('mousemove', (e) => {
        if (isDragging && scale > 1) {
            currentPos = {
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            };
            enlargedImg.style.transform = `scale(${scale}) translate(${currentPos.x}px, ${currentPos.y}px)`;
        }
    });

    enlargedImg.addEventListener('mouseup', () => {
        isDragging = false;
    });

    enlargedImg.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    enlargedImg.addEventListener('dblclick', () => {
        scale = scale === 1 ? 2 : 1;
        currentPos = { x: 0, y: 0 };
        enlargedImg.style.transform = `scale(${scale})`;
    });
}

function closeCarousel() {
    const modal = document.getElementById('carouselModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    document.removeEventListener('keydown', handleCarouselKeyPress);
}

function resetCarousel() {
    const enlargedImg = document.getElementById('enlargedImg');
    if (enlargedImg) {
        enlargedImg.style.transform = 'scale(1)';
        currentPos = { x: 0, y: 0 };
        scale = 1;
    }
}

function handleCarouselKeyPress(e) {
    switch(e.key) {
        case 'ArrowLeft':
            showPrevImage();
            resetCarousel();
            break;
        case 'ArrowRight':
            showNextImage();
            resetCarousel();
            break;
        case 'Escape':
            closeCarousel();
            break;
        case '+':
            zoomIn();
            break;
        case '-':
            zoomOut();
            break;
    }
}


function updateDetailsModal(vehicle) {
    // Update text content
    document.getElementById("detailRegNo").textContent = vehicle.reg_no || "N/A";
    document.getElementById("detailType").textContent = vehicle.type || "N/A";
    document.getElementById("detailMake").textContent = vehicle.make || "N/A";
    document.getElementById("detailLocation").textContent = vehicle.location || "N/A";
    document.getElementById("detailStatus").textContent = vehicle.status || "N/A";
    document.getElementById("detailRepair").textContent = vehicle.repair_type || "N/A";
    document.getElementById("detailInspectionDate").textContent = vehicle.inspection_date || "N/A";
    document.getElementById("detailRepairDate").textContent = vehicle.repair_completion_date || "Not fixed";

    // Update images
    const imageGallery = document.getElementById("imageGallery");
    imageGallery.innerHTML = '';
    
    const imagesArray = vehicle.images ? vehicle.images.split(',').filter(img => img.trim()) : [];
    images = imagesArray; // Update global images array for carousel

    if (imagesArray.length > 0) {
        imageGallery.style.display = "grid";
        imagesArray.forEach((image, index) => {
            const imgElement = document.createElement("img");
            imgElement.src = `../assets/vehicles/${image}`;
            imgElement.classList.add("cursor-pointer", "rounded", "shadow-lg");
            imgElement.onclick = () => openCarousel(index);
            imageGallery.appendChild(imgElement);
        });
    } else {
        imageGallery.style.display = "none";
    }
}

function closeDetailsModal() {
    const detailsModal = document.getElementById("detailsModal");
    const detailsModalContent = document.getElementById("detailsModalContent");
    
    detailsModalContent.classList.add("hide");
    detailsModalContent.addEventListener('animationend', () => {
        detailsModal.classList.remove("active");
    }, { once: true });

    closeCarousel()
}

// Event listeners for closing modals
document.addEventListener('DOMContentLoaded', () => {
    const detailsModal = document.getElementById("detailsModal");
    const editModal = document.getElementById("EditvehicleModal");
    const vehicleModal = document.getElementById("vehicleModal");
    const deleteModal = document.getElementById("deleteModal")
    const clearModal = document.getElementById("clearModal")
    const logoutModal = document.getElementById("logoutModal")

    logoutModal.addEventListener('click', (e) => {
        if(e.target === logoutModal){
            closeLogoutModal()
        }
    })

    clearModal.addEventListener('click', (e) => {
        if(e.target === clearModal){
            closeClearModal()
        }
    })

    deleteModal.addEventListener('click', (e) => {
        if(e.target === deleteModal){
            closeDeleteModal();
        }
    })

    vehicleModal.addEventListener('click', (e) => {
        if (e.target === vehicleModal) {
            closeModal();
        }
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            closeDetailsModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailsModal.classList.contains('active')) {
            closeDetailsModal();
        }
    });
});
