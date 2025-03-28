<?php
session_start();

// Check if user is not logged in
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header("Location: ../index.php");
    exit;
}

require_once '../includes/auth_functions.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta name="description" content="DRTS Assests Management - Equipment page">
    <link href="../style/style.css" rel="stylesheet">
    <link href="../style/output.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <title>Equipments page</title>
</head>
<body class="bg-gray-100 ">
    <button id="mobile-menu-button" class="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-yellow-500 text-black">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
    </button>

<div class="flex h-screen">

    <div class="hidden md:flex flex-col w-64 rounded-r-2xl shadow-2xl bg-yellow-500">
        <div id="sidebar" class="fixed left-0 top-0 w-64 h-screen rounded-xl shadow-lg transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out">
            <div class="flex flex-col flex-1">
                <nav class="flex flex-col flex-1 px-2 py-4 gap-10">
                    <div>
                        <a href="#" class="flex items-center text-gray-100">
                            <img class="w-20" src="../img/DRTS_logo.png" alt="DRTS Logo">
                            <h2 class="font-bold text-black text-lg">Directorate of Road Traffic Services</h2>
                        </a>
                    </div>
                    <div class="flex flex-col flex-1 gap-3">
                        <a href="vehicle_page.php" class="hover:bg-opacity-25 rounded-2xl bg-gray-900  hover:bg-gray-400 text-white px-4 py-2 flex items-center">
                            <i class="fa-solid fa-car mr-2"></i> Vehicles
                        </a>
                         <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
                            <a href="add_UsersPage.php" 
                                class="hover:bg-opacity-25 rounded-2xl bg-gray-900  hover:bg-gray-400 text-white px-4 py-2 flex items-center">
                                <i class="fas fa-user-plus mr-2"></i> Add User
                            </a>
                        <?php endif; ?>
                        <a href="profile.php" class="flex items-center px-4 py-2 text-gray-100 bg-gray-900 hover:bg-gray-500 rounded-2xl">
                            <i class="fa-solid fa-id-badge mr-2"></i>
                            Profile
                        </a>
                    </div>
                </nav>
            </div>
        </div>
    </div>

    <div class="flex flex-col flex-1 overflow-y-auto transition-margin duration-300 ease-in-out">

    <div class="grid xl:grid-cols-1 grid-cols-1">
        <div class="p-2 md:p-5">
            <div class="py-2 md:py-3 px-2 md:px-3 rounded-xl border-yellow-400 border-4 md:border-8 bg-gray-900">
                <div class="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
                    <div class="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                        <button id="open-sidebar" class="md:hidden top-4 left-4 z-50 p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>                        
                        <div class="flex items-center gap-4">
                            <label for="equipmentSelect" class="text-white font-medium">Select Equipment:</label>
                            <select id="equipmentSelect" class="p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white">
                                <option value="solar">Solar</option>
                                <option value="air_conditioners">Air Conditioners</option>
                                <option value="fire_extinguishers">Fire Extinguishers</option>
                                <option value="borehole">Borehole</option>
                                <option value="generator">Generators</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex flex-wrap md:flex-nowrap gap-2 md:gap-4">
                        <?php if (hasPermission('add_equipment')): ?>
                            <button id="addEquipmentButton" 
                                class="rounded bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 shadow-lg flex items-center gap-2">
                                <i class="fas fa-plus"></i> Add Equipment
                            </button>
                        <?php endif ?>

                        <button onclick="openLogoutModal()" 
                            class="rounded bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 shadow-lg flex items-center gap-2">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container p-4">
        <h1 class="text-3xl font-bold text-black mb-6">Equipments Managements</h1>

        <div class="grid xl:grid-cols-1 grid-cols-1">
                <div class="flex flex-wrap items-center p-2 rounded-xl bg-gray-800 mb-6 space-x-2">
                    <!-- Search Bar -->
                    <div class="w-auto flex">
                        <div class="flex">
                            <input type="text" 
                                id="equipmentSearch" 
                                placeholder="Search by location, model, type or status" 
                                class="border border-yellow-400 p-2 text-xs sm:text-sm md:text-base w-40 sm:w-56 md:w-96 rounded-l focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50">
                            <button onclick="searchEquipment()" 
                                class="bg-yellow-500 shrink-0 text-black font-semibold px-2 sm:px-4 py-2 rounded-r hover:bg-yellow-600 text-xs sm:text-sm">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        <!-- Modal -->
        <div id="addEquipmentModal" class="hidden fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div class="modal-content relative bg-white p-6 rounded-lg shadow-lg border-2 border-yellow-400 w-full max-w-lg md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-full">
                <button onclick="closeModal()" class="absolute top-2 right-2 text-gray-700 text-4xl">&times;</button>
                <h2 id="modalTitle" class="text-xl font-bold mb-4"></h2>
                <form id="addEquipmentForm">
                    <input type="hidden" id="equipmentType" name="equipmentType">
                    <div id="fields" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <!-- Fields input -->
                        
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="button" id="cancelButton" class="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit" class="bg-yellow-500 text-white py-2 px-4 rounded-lg shadow hover:bg-yellow-600">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div id="EditequipmentModal" class="hidden fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div class="modal-content relative bg-white p-6 rounded-lg shadow-lg border-2 border-yellow-400 w-full max-w-lg md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-full">
                <button onclick="closeEditModal()" class="absolute top-2 right-2 text-gray-700 text-4xl">&times;</button>
                <h2 id="modalTitle" class="text-xl font-bold mb-4"></h2>
                <form id="EditequipmentForm">
                    <input type="hidden" id="equipmentType" name="equipmentType">
                    <div id="fields" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <!-- Fields input -->
                        
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="button" onclick="closeEditModal()" class="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit" class="bg-yellow-500 text-white py-2 px-4 rounded-lg shadow hover:bg-yellow-600">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- LOGOUT MODAL -->
       <div id="logoutModal" class="modal-overlay items-center justify-center hidden fixed z-50 inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full px-4">
            <div id="logoutModalcontent" class="modal-content relative mx-auto shadow-xl rounded-md bg-white max-w-md">
                <div class="p-6 text-center">
                    <h2 class="text-2xl text-red-600 font-bold mb-4">Confirm Logout</h2>
                    <p class="mb-6 text-xl text-black">Are you sure you want to logout?</p>
                    <div class="flex justify-center gap-4">
                        <button onclick="closeLogoutModal()" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">No</button>
                        <a href="logout.php" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Yes</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- DELETE MODAL -->
        <div id="delEquipmentModal" class="modal-overlay items-center justify-center hidden fixed z-50 inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full px-4">
            <div id="delEquipmentModalcontent" class="modal-content relative mx-auto shadow-xl rounded-md bg-white max-w-md">
                <div class="p-6 pt-0 text-center">
                    <svg class="w-20 h-20 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-xl font-normal text-black mt-5 mb-6">Are you sure you want to delete this equipment: 
                        <span id="deleteEquipmentType" class="font-bold text-red-800"></span> at <span id="deleteEquipmentName" class="font-bold text-red-800"></span>?
                    </h3>
                    <button id="confirmDelete" 
                        class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2">
                        Yes, I'm sure
                    </button>
                    <button onclick="closeDeleteModal()" 
                        class="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center">
                        No, cancel
                    </button>
                </div>
            </div>
        </div>

    
        <!-- Table for Displaying Equipment Data -->
        <div id="equipmentTableContainer" class="overflow-x-auto">
            <table id="solarTable" class="w-full bg-white shadow-lg rounded overflow-hidden text-sm md:text-base">
                <thead class="bg-yellow-500 text-black">
                    <tr>
                        <th class="p-4 border-b">S/N</th>
                        <th class="p-4 border-b">Location</th>
                        <th class="p-4 border-b">Capacity</th>
                        <th class="p-4 border-b">Battery Type</th>
                        <th class="p-4 border-b">No. of Batteries</th>
                        <th class="p-4 border-b">No. of Panels</th>
                        <th class="p-4 border-b">Installation Date</th>
                        <th class="p-4 border-b">Service Rendered</th>
                        <th class="p-4 border-b">Action</th>
                    </tr>
                </thead>
                <tbody id="solarData"></tbody>
            </table>

            <table id="air_conditionersTable" class="w-full bg-white shadow-lg rounded overflow-hidden text-sm md:text-base hidden">
                <thead class="bg-yellow-500 text-black">
                    <tr>
                        <th class="p-4 border-b">S/N</th>
                        <th class="p-4 border-b">Location</th>
                        <th class="p-4 border-b">Model</th>
                        <th class="p-4 border-b">Type</th>
                        <th class="p-4 border-b">No. of Units</th>
                        <th class="p-4 border-b">Capacity</th>
                        <th class="p-4 border-b">Status</th>
                        <th class="p-4 border-b">Action</th>
                    </tr>
                </thead>
                <tbody id="air_conditionersData"></tbody>
            </table>

            <table id="fire_extinguishersTable" class="w-full bg-white shadow-lg rounded overflow-hidden text-sm md:text-base hidden">
                <thead class="bg-yellow-500 text-black">
                    <tr>
                        <th class="p-4 border-b">S/N</th>
                        <th class="p-4 border-b">Type</th>
                        <th class="p-4 border-b">Weight</th>
                        <th class="p-4 border-b">Amount</th>
                        <th class="p-4 border-b">Location</th>
                        <th class="p-4 border-b">Status</th>
                        <th class="p-4 border-b">Last Service Date</th>
                        <th class="p-4 border-b">Expiration Date</th>
                        <th class="p-4 border-b">Action</th>
                    </tr>
                </thead>
                <tbody id="fire_extinguishersData"></tbody>
            </table>

            <table id="boreholeTable" class="w-full bg-white shadow-lg rounded overflow-hidden text-sm md:text-base hidden">
                <thead class="bg-yellow-500 text-black">
                    <tr>
                        <th class="p-4 border-b">S/N</th>
                        <th class="p-4 border-b">Location</th>
                        <th class="p-4 border-b">Model</th>
                        <th class="p-4 border-b">Status</th>
                        <th class="p-4 border-b">Action</th>
                    </tr>
                </thead>
                <tbody id="boreholeData"></tbody>
            </table>

            <table id="generatorTable" class="w-full bg-white shadow-lg rounded overflow-hidden text-sm md:text-base hidden">
                <thead class="bg-yellow-500 text-black">
                    <tr>
                        <th class="p-4 border-b">S/N</th>
                        <th class="p-4 border-b">Location</th>
                        <th class="p-4 border-b">Model</th>
                        <th class="p-4 border-b">Status</th>
                        <th class="p-4 border-b">Capacity</th>
                        <th class="p-4 border-b">Action</th>
                    </tr>
                </thead>
                <tbody id="generatorData"></tbody>
            </table>
        </div>
    </div>
</div>
</div>
</div>
    <script>
         window.userPermissions = <?php 
            echo json_encode($_SESSION['permissions'] ?? [], JSON_FORCE_OBJECT); 
        ?>;
        window.isAdmin = <?php 
            echo isset($_SESSION['role']) && $_SESSION['role'] === 'admin' ? 'true' : 'false'; 
        ?>;
    </script>
    <script src="../scripts/Equipments.js"></script>
    <script src="../scripts/editEquipments.js"></script>
    <script src="https://kit.fontawesome.com/79a49acde1.js" crossorigin="anonymous"></script>
</body>
</html>
