function openLogoutModal() {
    document.getElementById('logoutModal').classList.remove('hidden');
    document.getElementById('logoutModal').classList.add('flex');
}

function closeLogoutModal() {
    document.getElementById('logoutModal').classList.add('hidden');
    document.getElementById('logoutModal').classList.remove('flex');
}

function toggleRepairType() {
    const repairField = document.getElementById("repairTypeField");
    const needsRepairsCheckbox = document.getElementById("needsRepairs");
    const repairTypeTextarea = document.getElementById("repair_type");

    if (needsRepairsCheckbox.checked) {
        repairField.classList.remove("hidden");
        repairTypeTextarea.focus();
    } else {
        repairField.classList.add("hidden");
        repairTypeTextarea.value = "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const needsRepairsCheckbox = document.getElementById("needsRepairs");
    if (needsRepairsCheckbox) {
        needsRepairsCheckbox.addEventListener("change", toggleRepairType);
    }
});

function openModal() {
    const modal = document.getElementById("vehicleModal");
    const modalContent = document.getElementById("vehicleModalContent");
  
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


const createResponseElement = () => {
    let responseMessage = document.getElementById('responseMessage');
    if (!responseMessage) {
        responseMessage = document.createElement('div');
        responseMessage.id = 'responseMessage';
        // Add it after the form
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
    
    // Log the FormData contents for debugging (optional)
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    fetch('add_vehicle.php', {
        method: 'POST',
        body: formData
    })

     
    .then(response => response.text()) // Fetch raw text for debugging
    .then(text => {
        console.log('Raw server response:', text); // Debug log

        // Parse JSON and handle HTML or other invalid responses
        let data; 
        try {
            data = JSON.parse(text);
        } catch (e) {
            // Provide a clear message if the response isn’t valid JSON
            throw new Error(`Server error: ${text.replace(/<[^>]*>/g, '')}`);
        }
        
        // Check if the server returned an error status
        if (!data.status || data.status !== 'success') {
            throw new Error(data.message || 'Server error occurred');
        }

        // Success handling
        responseMessage.classList.remove('text-red-600');
        responseMessage.textContent = data.message;
        responseMessage.classList.add('text-green-600');
        
        // Close modal and refresh vehicle list if functions exist
        if (typeof closeModal === 'function') {
            closeModal();
        }
        if (typeof addVehicleToTable === 'function') {
            addVehicleToTable(data.vehicle);
        }
    

    })
    .catch(error => {
        console.error('Error:', error);
        responseMessage.textContent = error.message || 'An error occurred while uploading. Please try again.';
        responseMessage.classList.remove('text-green-600');
        responseMessage.classList.add('text-red-600');
    });
    

});


function addVehicleToTable(vehicle) {
    // Remove any existing rows with this vehicle ID
    const existingRows = document.querySelectorAll(`tr[data-vehicle-id="${vehicle.id}"]`);
    existingRows.forEach(row => row.remove());

    const tbody = document.querySelector("table tbody");

    // Determine the status display based on the vehicle's status
    let statusDisplay = '';
    switch (vehicle.status) {
        case 'Needs Repairs':
            statusDisplay = `<span class="text-yellow-600 font-bold">⚠ Needs Repairs</span>`;
            break;
        case 'Fixed':
            statusDisplay = `<span class="text-green-500 font-bold">✔ Cleared</span>`;
            break;
        default:
            statusDisplay = `<span class="text-gray-500 font-bold">No Repairs</span>`;
    }

    // Create a new row
    const newRow = document.createElement("tr");
    newRow.setAttribute("data-vehicle-id", vehicle.id);
    newRow.innerHTML = `
        <td class="p-4 border-b">${vehicle.reg_no}</td>
        <td class="p-4 border-b">${vehicle.type}</td>
        <td class="p-4 border-b">${vehicle.make}</td>
        <td class="p-4 border-b">${vehicle.location}</td>
        <td class="p-4 border-b">${statusDisplay}</td>
        <td class="p-4 border-b">${vehicle.inspection_date}</td>
        <td class="p-4 border-b flex items-center justify-around space-x-2 text-lg">
            <button onclick="showDetails(${vehicle.id})" class="text-blue-500 hover:text-blue-700">ℹ</button>
            <button onclick="editVehicle(${vehicle.id})" class="text-yellow-500 hover:text-yellow-700"><i class="fa-solid fa-pen-to-square"></i></button>
            <a href="clear_vehicle.php?id=${vehicle.id}" class="text-green-500 hover:text-green-700">✔ Clear</a>
            <button class="text-red-500 hover:text-red-700 delete-button" data-vehicle-id="${vehicle.id}" onclick="openDeleteModal(${vehicle.id})"><i class="fa-solid fa-trash-can"></i></button>
        </td>
    `;

    // Append the new row to the tbody
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
                        imgContainer.className = "relative group";
                        
                        const img = document.createElement("img");
                        img.src = `../assets/vehicles/${image.trim()}`;
                        img.className = "w-full h-32 object-cover rounded cursor-pointer";
                        img.onclick = () => {
                            document.getElementById("carouselModal").classList.remove("hidden");
                            document.getElementById("enlargedImg").src = img.src;
                            currentIndex = index;
                        };
                        
                        imgContainer.appendChild(img);
                        imageGallery.appendChild(imgContainer);
                    });
                }
            }

            // Show modal
            detailsModal.classList.remove("hidden");
            detailsModal.classList.add("active");
            detailsModalContent.classList.remove("hide");
        })
        .catch(error => {
            console.error('Error fetching vehicle details:', error);
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
}

function previewImages() {
    const imagePreview = document.getElementById('imagePreview');
    const files = document.getElementById('images').files;

    imagePreview.innerHTML = ''; // Clear previous previews

    for (const file of files) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const imgElement = document.createElement('img');
            imgElement.src = event.target.result;
            imgElement.classList.add('w-40', 'h-40', 'object-cover', 'rounded');
            imagePreview.appendChild(imgElement);
        };

        reader.readAsDataURL(file);
    }

    console.log("Preview function called");
}

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
let images = []; 
let currentIndex = 0;

function openCarousel(index = 0) {
    if (!Array.isArray(images) || images.length === 0) {
        console.error('No images available');
        return;
    }

    const carousel = document.getElementById('carouselModal');
    carousel.classList.remove('hidden'); 

    // Ensure index is within bounds
    currentIndex = Math.min(Math.max(index, 0), images.length - 1);

    updateCarouselImage(); 
}

function updateCarouselImage() {
    const enlargedImg = document.getElementById("enlargedImg");
    
    if (images[currentIndex]) {
        enlargedImg.src = `../assets/vehicles/${images[currentIndex]}`; 
        enlargedImg.alt = `Vehicle Image ${currentIndex + 1}`;
    } else {
        console.error("Image not found.");
    }
}



function showPrevImage() {
    if (images.length <= 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;  // Loop to previous image
    updateCarouselImage();
}

function showNextImage() {
    if (images.length <= 0) return;
    currentIndex = (currentIndex + 1) % images.length;  // Loop to next image
    updateCarouselImage();
}

function closeCarousel() {
    const carousel = document.getElementById('carouselModal');
    carousel.classList.add('hidden'); 
}

// Attach the image array from the details modal to the carousel
function setCarouselImages(imageArray) {
    images = imageArray;
    currentIndex = 0;  // Reset index to start from the first image
}

// Event Listeners for the Carousel
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('carouselModal').addEventListener('click', (e) => {
        if (e.target.id === 'carouselModal') {
            closeCarousel();
        }
    });

    document.getElementById('closeCarousel').addEventListener('click', closeCarousel);
    document.getElementById('prevImage').addEventListener('click', showPrevImage);
    document.getElementById('nextImage').addEventListener('click', showNextImage);
});

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
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const detailsModal = document.getElementById("detailsModal");
    const editModal = document.getElementById("EditvehicleModal");
    const vehicleModal = document.getElementById("vehicleModal");

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
