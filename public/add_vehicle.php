<?php
include '../config/db.php';

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $needs_repairs = 0;
    $status = 'No Repairs';
    
    if (!empty($_POST['needs_repairs']) && $_POST['needs_repairs'] === "1") {
        $needs_repairs = 1;
        $status = 'Needs Repairs';
        $repair_type = !empty($_POST['repair_type']) ? filter_var($_POST['repair_type'], FILTER_SANITIZE_STRING) : null;
    } elseif (!empty($_POST['fixed']) && $_POST['fixed'] === "1") {
        $status = 'Fixed';
    }

    $required_fields = ['reg_no', 'type', 'make', 'location', 'inspection_date'];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("$field is required");
        }
    }

    $reg_no = filter_var($_POST['reg_no'], FILTER_SANITIZE_STRING);
    $type = filter_var($_POST['type'], FILTER_SANITIZE_STRING);
    $make = filter_var($_POST['make'], FILTER_SANITIZE_STRING);
    $location = filter_var($_POST['location'], FILTER_SANITIZE_STRING);
    $repair_type = !empty($_POST['repair_type']) ? filter_var($_POST['repair_type'], FILTER_SANITIZE_STRING) : null;
    $inspection_date = filter_var($_POST['inspection_date'], FILTER_SANITIZE_STRING);

    // Validate Last inspection date format
    if (!strtotime($inspection_date)) {
        throw new Exception('Invalid Last inspection date format');
    }

    $imageNames = [];
    $targetDir = "../assets/vehicles/";

    // Create directory if it doesn't exist
    if (!is_dir($targetDir)) {
        if (!mkdir($targetDir, 0755, true)) {
            throw new Exception('Failed to create upload directory');
        }
    }

    // Handle image uploads
    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        $allowedTypes = ['image/jpeg', 'image/png'];
        $maxFileSize = 5 * 1024 * 1024;

        if (count($_FILES['images']['name']) > 2) {
            throw new Exception('You can upload a maximum of 2 images');
        }

        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if (empty($tmp_name)) continue;

            $fileType = $_FILES['images']['type'][$key];
            if (!in_array($fileType, $allowedTypes)) {
                throw new Exception('Invalid file type. Only JPG, PNG and GIF are allowed');
            }

            if ($_FILES['images']['size'][$key] > $maxFileSize) {
                throw new Exception('File size too large. Maximum size is 5MB');
            }

            $fileExtension = pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION);
            $newFileName = uniqid() . '_' . time() . '.' . $fileExtension;
            $targetFilePath = $targetDir . $newFileName;

            if (!move_uploaded_file($tmp_name, $targetFilePath)) {
                throw new Exception('Failed to upload image: ' . $_FILES['images']['name'][$key]);
            }

            $imageNames[] = $newFileName;
        }
    }

    $imagesString = implode(',', $imageNames);

    // Begin transaction
    $pdo->beginTransaction();

    // Check if registration number already exists
    $checkSql = "SELECT COUNT(*) FROM vehicles WHERE reg_no = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$reg_no]);
    if ($checkStmt->fetchColumn() > 0) {
        throw new Exception('Vehicle with this registration number already exists');
    }

    // Insert vehicle data
    $sql = "INSERT INTO vehicles (reg_no, type, make, location, status, repair_type, inspection_date, images, needs_repairs) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if (!$stmt->execute([$reg_no, $type, $make, $location, $status, $repair_type, $inspection_date, $imagesString, $needs_repairs])) {
        throw new Exception('Database error while adding vehicle');
    }

    $VehicleId = $pdo->lastInsertId();

    // Commit transaction
    $pdo->commit();

    // Return success response with new vehicle data
    echo json_encode([
        'status' => 'success',
        'message' => 'Vehicle added successfully',
        'vehicle' => [
            'id' => $VehicleId,
            'reg_no' => $reg_no,
            'type' => $type,
            'make' => $make,
            'location' => $location,
            'status' => $status,
            'repair_type'=> $repair_type,
            'inspection_date' => $inspection_date,
            'images' => $imageNames
        ]
    ]);

} catch (Exception $e) {
    // Rollback transaction if active
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    // Delete uploaded files if database insertion failed
    if (!empty($imageNames)) {
        foreach ($imageNames as $image) {
            $filePath = $targetDir . $image;
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
    }   

    // Return error response
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
