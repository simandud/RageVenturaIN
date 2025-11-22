<?php
/**
 * RAGEVENTURA - Sistema de Autenticación
 * Maneja registro, login, logout y sesiones
 */

define('RAGEVENTURA', true);
require_once __DIR__ . '/../config/database.php';

// Configurar headers CORS para API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Obtener acción de la solicitud
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'register':
        handleRegister();
        break;
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        checkSession();
        break;
    case 'forgot-password':
        handleForgotPassword();
        break;
    default:
        jsonError('Acción no válida', 400);
}

/**
 * Registrar nuevo usuario
 */
function handleRegister() {
    // Solo aceptar POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Método no permitido', 405);
    }

    // Obtener datos (JSON o form-data)
    $data = getRequestData();

    // Validar campos requeridos
    $required = ['username', 'email', 'password'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            jsonError("El campo '$field' es requerido");
        }
    }

    $username = sanitize($data['username']);
    $email = strtolower(sanitize($data['email']));
    $password = $data['password'];
    $phone = sanitize($data['phone'] ?? '');

    // Validaciones
    if (strlen($username) < 3 || strlen($username) > 50) {
        jsonError('El nombre de usuario debe tener entre 3 y 50 caracteres');
    }

    if (!isValidEmail($email)) {
        jsonError('El email no es válido');
    }

    if (strlen($password) < 8) {
        jsonError('La contraseña debe tener al menos 8 caracteres');
    }

    // Verificar si el email ya existe
    $existing = db()->fetch("SELECT id FROM users WHERE email = ?", [$email]);
    if ($existing) {
        jsonError('Este email ya está registrado');
    }

    // Generar tag único
    $tag = generateUserTag($username);

    // Verificar que el tag no exista (poco probable pero por seguridad)
    while (db()->fetch("SELECT id FROM users WHERE tag = ?", [$tag])) {
        $tag = generateUserTag($username);
    }

    // Hash de contraseña
    $passwordHash = hashPassword($password);

    // Insertar usuario
    try {
        $userId = db()->insert(
            "INSERT INTO users (tag, username, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)",
            [$tag, $username, $email, $passwordHash, $phone]
        );

        // Crear sesión automáticamente
        createSession($userId);

        // Obtener datos del usuario creado
        $user = db()->fetch("SELECT id, tag, username, email, avatar_url, role, points, created_at FROM users WHERE id = ?", [$userId]);

        jsonSuccess([
            'user' => $user,
            'message' => '¡Bienvenido a RageVentura!'
        ]);

    } catch (Exception $e) {
        error_log("Register Error: " . $e->getMessage());
        jsonError('Error al crear la cuenta. Inténtalo de nuevo.', 500);
    }
}

/**
 * Iniciar sesión
 */
function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Método no permitido', 405);
    }

    $data = getRequestData();

    if (empty($data['email']) || empty($data['password'])) {
        jsonError('Email y contraseña son requeridos');
    }

    $email = strtolower(sanitize($data['email']));
    $password = $data['password'];

    // Buscar usuario
    $user = db()->fetch(
        "SELECT id, tag, username, email, password_hash, avatar_url, role, is_verified, is_pro, points FROM users WHERE email = ?",
        [$email]
    );

    if (!$user) {
        jsonError('Credenciales incorrectas');
    }

    // Verificar contraseña
    if (!verifyPassword($password, $user['password_hash'])) {
        jsonError('Credenciales incorrectas');
    }

    // Actualizar último login
    db()->execute("UPDATE users SET last_login = NOW() WHERE id = ?", [$user['id']]);

    // Crear sesión
    createSession($user['id']);

    // Quitar hash de la respuesta
    unset($user['password_hash']);

    jsonSuccess([
        'user' => $user,
        'message' => '¡Bienvenido de vuelta!'
    ]);
}

/**
 * Cerrar sesión
 */
function handleLogout() {
    $userId = getCurrentUserId();

    if ($userId) {
        // Eliminar sesiones de la BD
        db()->execute("DELETE FROM sessions WHERE user_id = ?", [$userId]);
    }

    // Destruir sesión PHP
    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    session_destroy();

    jsonSuccess(['message' => 'Sesión cerrada correctamente']);
}

/**
 * Verificar sesión activa
 */
function checkSession() {
    $userId = getCurrentUserId();

    if (!$userId) {
        jsonResponse(['authenticated' => false]);
    }

    $user = db()->fetch(
        "SELECT id, tag, username, email, avatar_url, bio, phone, city, favorite_genre,
                social_instagram, social_soundcloud, social_spotify,
                is_verified, is_pro, role, points, events_attended, created_at
         FROM users WHERE id = ?",
        [$userId]
    );

    if (!$user) {
        jsonResponse(['authenticated' => false]);
    }

    // Obtener badges del usuario
    $badges = db()->fetchAll(
        "SELECT b.name, b.description, b.icon, b.color, ub.earned_at
         FROM user_badges ub
         JOIN badges b ON ub.badge_id = b.id
         WHERE ub.user_id = ?
         ORDER BY ub.earned_at DESC",
        [$userId]
    );

    jsonResponse([
        'authenticated' => true,
        'user' => $user,
        'badges' => $badges
    ]);
}

/**
 * Crear sesión para usuario
 */
function createSession($userId) {
    $token = generateToken();
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    // Guardar en BD
    db()->insert(
        "INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)",
        [$userId, $token, $ip, $userAgent, $expiresAt]
    );

    // Guardar en sesión PHP
    $_SESSION['user_id'] = $userId;
    $_SESSION['session_token'] = $token;

    // También establecer cookie
    setcookie('rv_session', $token, [
        'expires' => time() + SESSION_LIFETIME,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

/**
 * Obtener ID del usuario actual
 */
function getCurrentUserId() {
    // Verificar sesión PHP
    if (!empty($_SESSION['user_id']) && !empty($_SESSION['session_token'])) {
        $session = db()->fetch(
            "SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()",
            [$_SESSION['session_token']]
        );
        if ($session) {
            return $session['user_id'];
        }
    }

    // Verificar cookie
    if (!empty($_COOKIE['rv_session'])) {
        $session = db()->fetch(
            "SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()",
            [$_COOKIE['rv_session']]
        );
        if ($session) {
            $_SESSION['user_id'] = $session['user_id'];
            $_SESSION['session_token'] = $_COOKIE['rv_session'];
            return $session['user_id'];
        }
    }

    return null;
}

/**
 * Obtener datos de la solicitud (JSON o form-data)
 */
function getRequestData() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (strpos($contentType, 'application/json') !== false) {
        $json = file_get_contents('php://input');
        return json_decode($json, true) ?? [];
    }

    return $_POST;
}

/**
 * Restablecer contraseña (placeholder)
 */
function handleForgotPassword() {
    jsonError('Función en desarrollo. Contacta a soporte.');
}
