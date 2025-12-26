<?php
/**
 * Secure Contact Form Handler - Compatible with Your Server
 * Using simplified headers that work with your mail configuration
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);

// Configuration
define('RECAPTCHA_SECRET', '6LdZnm0UAAAAAGEBIdXbpOGp1fu--G3k1Q6SrMZN');
define('DEFAULT_EMAIL', 'info@360sec.com');
define('SUCCESS_PAGE', 'contact_ok.html');
define('ERROR_PAGE', 'contact_no_ok.html');
define('ALLOWED_DOMAINS', ['360sec.com', 'www.360sec.com']);

/**
 * Secure redirect function
 */
function redirect($url) {
    $allowedPages = [SUCCESS_PAGE, ERROR_PAGE];
    
    if (!in_array($url, $allowedPages, true)) {
        error_log("Attempted redirect to non-whitelisted page: $url");
        $url = ERROR_PAGE;
    }
    
    $url = basename($url);
    
    if (headers_sent()) {
        echo '<meta http-equiv="refresh" content="0;URL=' . htmlspecialchars($url, ENT_QUOTES, 'UTF-8') . '">';
    } else {
        header("Location: $url");
    }
    exit();
}

/**
 * Honeypot validation
 */
function validateHoneypot($value) {
    return empty($value);
}

/**
 * Timestamp validation
 */
function validateTimestamp($timestamp) {
    if (empty($timestamp) || !is_numeric($timestamp)) {
        return true; // Be lenient
    }
    
    $now = time();
    $diff = $now - (int)$timestamp;
    
    return ($diff >= 1 && $diff <= 86400);
}

/**
 * Sanitize input
 */
function sanitizeInput($data, $maxLength = 500) {
    if (!is_string($data)) {
        return '';
    }
    
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    return mb_substr($data, 0, $maxLength, 'UTF-8');
}

/**
 * CRITICAL: Validate email to prevent header injection
 */
function validateEmail($email) {
    $email = trim($email);
    
    // Check for header injection attempts
    if (preg_match('/[\r\n\0]/', $email)) {
        error_log("Email header injection attempt detected: $email");
        return false;
    }
    
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    
    if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
        return false;
    }
    
    return $email;
}

/**
 * Validate phone
 */
function validatePhone($phone) {
    $phone = trim($phone);
    
    if (empty($phone)) {
        return '';
    }
    
    $phone = preg_replace('/[^0-9+\(\)\s-]/', '', $phone);
    return mb_substr($phone, 0, 30, 'UTF-8');
}

/**
 * Get recipient by category
 */
function getRecipientByCategory($category) {
    $recipients = [
        'administration' => 'administracion@360sec.com',
        'human-resources' => 'rrhh@360sec.com',
        'information' => 'info@360sec.com',
        'complains-claims' => 'gerencia@360sec.com',
        'sales' => 'mercadeo@360sec.com',
        'providers' => 'administracion@360sec.com'
    ];
    
    return $recipients[$category] ?? DEFAULT_EMAIL;
}

// ===== MAIN EXECUTION =====

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(ERROR_PAGE);
}

$clientIP = $_SERVER['REMOTE_ADDR'];

// Validate honeypot
$honeypot = $_POST['website'] ?? '';
if (!validateHoneypot($honeypot)) {
    error_log("Honeypot triggered for IP: $clientIP - BLOCKED");
    redirect(ERROR_PAGE);
}

// Validate timestamp
$timestamp = $_POST['timestamp'] ?? '';
if (!validateTimestamp($timestamp)) {
    error_log("Suspicious timestamp for IP: $clientIP");
}

// Retrieve and sanitize data
$name = sanitizeInput($_POST['name'] ?? '', 100);
$company = sanitizeInput($_POST['company'] ?? '', 100);
$phone = validatePhone($_POST['phone'] ?? '');
$email = $_POST['email'] ?? '';
$message = sanitizeInput($_POST['message'] ?? '', 2000);
$category = sanitizeInput($_POST['category'] ?? '', 50);
$recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';

// Validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Name required';
}

if (empty($company) || strlen($company) < 2) {
    $errors[] = 'Company required';
}

// CRITICAL: Validate email to prevent header injection
$validatedEmail = validateEmail($email);
if ($validatedEmail === false) {
    $errors[] = 'Valid email required';
    error_log("Invalid/malicious email submitted: " . substr($email, 0, 50));
}

$allowedCategories = ['administration', 'human-resources', 'information', 'complains-claims', 'sales', 'providers'];
if (empty($category) || !in_array($category, $allowedCategories, true)) {
    $errors[] = 'Category required';
}

if (!empty($errors)) {
    error_log('Validation errors: ' . implode(', ', $errors));
    redirect(ERROR_PAGE);
}

// Verify reCAPTCHA
$url = 'https://www.google.com/recaptcha/api/siteverify';
$data = array(
    'secret' => RECAPTCHA_SECRET, 
    'response' => $recaptchaResponse,
    'remoteip' => $clientIP
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data),
        'timeout' => 10
    )
);

$context = stream_context_create($options);
$result = @file_get_contents($url, false, $context);

if ($result === FALSE) { 
    error_log('reCAPTCHA connection failed');
    redirect(ERROR_PAGE);
}

$json = json_decode($result, true);

// Check v2 success or v3 score
if (empty($json['success'])) {
    error_log('reCAPTCHA validation failed');
    redirect(ERROR_PAGE);
}

if (isset($json['score']) && $json['score'] < 0.5) {
    error_log('reCAPTCHA: Low score ' . $json['score']);
    redirect(ERROR_PAGE);
}

// Get recipient
$sendTo = getRecipientByCategory($category);

if (!filter_var($sendTo, FILTER_VALIDATE_EMAIL)) {
    error_log("Invalid recipient for category: $category");
    redirect(ERROR_PAGE);
}

// Build email - using simple headers like your working script
$subject = "Contacto desde Sitio Web de ABC Security Group";

// Simple headers that work on your server
$headers = "";
$headers .= "To: " . $sendTo . " <" . $sendTo . ">\r\n";

// Build message
$emailMessage = "";
$emailMessage .= "Nombre: " . $name . "\r\n\r\n";
$emailMessage .= "Empresa: " . $company . "\r\n\r\n";
$emailMessage .= "Telefono: " . ($phone ?: 'No proporcionado') . "\r\n\r\n";
$emailMessage .= "Mail: " . $validatedEmail . "\r\n\r\n";
$emailMessage .= "Mensaje: " . ($message ?: 'No se proporcionó mensaje.') . "\r\n\r\n";
$emailMessage .= "Categoria: " . $category . "\r\n\r\n";
$emailMessage .= "IP: " . $clientIP . "\r\n\r\n";
$emailMessage .= "Referer: " . ($_SERVER['HTTP_REFERER'] ?? 'N/A') . "\r\n\r\n";
$emailMessage .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\r\n\r\n";

// Send email using the same format as your working script
$mailSent = mail($sendTo, $subject, $emailMessage, $headers);

if ($mailSent) {
    error_log("Contact form submitted successfully by $validatedEmail to $sendTo");
    redirect(SUCCESS_PAGE);
} else {
    error_log("Failed to send email from contact form for $validatedEmail");
    redirect(ERROR_PAGE);
}
?>
