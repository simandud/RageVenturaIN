<?php
/**
 * RAGEVENTURA - API de Perfil de Usuario
 * Obtener y actualizar información del perfil
 */

define('RAGEVENTURA', true);
require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get':
        getProfile();
        break;
    case 'update':
        updateProfile();
        break;
    case 'update-avatar':
        updateAvatar();
        break;
    case 'change-password':
        changePassword();
        break;
    default:
        jsonError('Acción no válida', 400);
}

/**
 * Obtener perfil del usuario actual o por tag
 */
function getProfile() {
    $tag = sanitize($_GET['tag'] ?? '');

    if ($tag) {
        // Obtener perfil público por tag
        $user = db()->fetch(
            "SELECT id, tag, username, avatar_url, bio, city, favorite_genre,
                    social_instagram, social_soundcloud, social_spotify,
                    is_verified, is_pro, role, points, events_attended, created_at
             FROM users WHERE tag = ?",
            [$tag]
        );

        if (!$user) {
            jsonError('Usuario no encontrado', 404);
        }

        // Obtener badges
        $badges = db()->fetchAll(
            "SELECT b.name, b.description, b.icon, b.color, ub.earned_at
             FROM user_badges ub
             JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = ?
             ORDER BY ub.earned_at DESC",
            [$user['id']]
        );

        jsonSuccess([
            'user' => $user,
            'badges' => $badges,
            'is_own_profile' => false
        ]);

    } else {
        // Obtener perfil propio
        $userId = getCurrentUserId();

        if (!$userId) {
            jsonError('No has iniciado sesión', 401);
        }

        $user = db()->fetch(
            "SELECT id, tag, username, email, avatar_url, bio, phone, city, favorite_genre,
                    social_instagram, social_soundcloud, social_spotify,
                    is_verified, is_pro, role, points, events_attended, created_at
             FROM users WHERE id = ?",
            [$userId]
        );

        $badges = db()->fetchAll(
            "SELECT b.name, b.description, b.icon, b.color, ub.earned_at
             FROM user_badges ub
             JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = ?
             ORDER BY ub.earned_at DESC",
            [$userId]
        );

        jsonSuccess([
            'user' => $user,
            'badges' => $badges,
            'is_own_profile' => true
        ]);
    }
}

/**
 * Actualizar perfil del usuario
 */
function updateProfile() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Método no permitido', 405);
    }

    $userId = getCurrentUserId();
    if (!$userId) {
        jsonError('No has iniciado sesión', 401);
    }

    $data = getRequestData();

    // Campos permitidos para actualizar
    $allowedFields = [
        'username' => 'string',
        'bio' => 'text',
        'phone' => 'string',
        'city' => 'string',
        'favorite_genre' => 'string',
        'social_instagram' => 'string',
        'social_soundcloud' => 'string',
        'social_spotify' => 'string'
    ];

    $updates = [];
    $params = [];

    foreach ($allowedFields as $field => $type) {
        if (isset($data[$field])) {
            $value = sanitize($data[$field]);

            // Validaciones específicas
            if ($field === 'username') {
                if (strlen($value) < 3 || strlen($value) > 50) {
                    jsonError('El nombre debe tener entre 3 y 50 caracteres');
                }
            }

            if ($field === 'bio' && strlen($value) > 500) {
                jsonError('La biografía no puede exceder 500 caracteres');
            }

            $updates[] = "$field = ?";
            $params[] = $value;
        }
    }

    if (empty($updates)) {
        jsonError('No hay campos para actualizar');
    }

    $params[] = $userId;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";

    try {
        db()->execute($sql, $params);

        // Obtener datos actualizados
        $user = db()->fetch(
            "SELECT id, tag, username, email, avatar_url, bio, phone, city, favorite_genre,
                    social_instagram, social_soundcloud, social_spotify,
                    is_verified, is_pro, role, points
             FROM users WHERE id = ?",
            [$userId]
        );

        jsonSuccess([
            'user' => $user,
            'message' => 'Perfil actualizado correctamente'
        ]);

    } catch (Exception $e) {
        error_log("Profile Update Error: " . $e->getMessage());
        jsonError('Error al actualizar el perfil', 500);
    }
}

/**
 * Actualizar avatar
 */
function updateAvatar() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Método no permitido', 405);
    }

    $userId = getCurrentUserId();
    if (!$userId) {
        jsonError('No has iniciado sesión', 401);
    }

    if (!isset($_FILES['avatar'])) {
        jsonError('No se recibió ninguna imagen');
    }

    $file = $_FILES['avatar'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    if (!in_array($file['type'], $allowedTypes)) {
        jsonError('Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP');
    }

    if ($file['size'] > $maxSize) {
        jsonError('La imagen es muy grande. Máximo 5MB');
    }

    // Crear directorio de uploads si no existe
    $uploadDir = __DIR__ . '/../uploads/avatars/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generar nombre único
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'avatar_' . $userId . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $avatarUrl = '/uploads/avatars/' . $filename;

        // Obtener avatar anterior para eliminarlo
        $oldAvatar = db()->fetch("SELECT avatar_url FROM users WHERE id = ?", [$userId]);

        // Actualizar en BD
        db()->execute("UPDATE users SET avatar_url = ? WHERE id = ?", [$avatarUrl, $userId]);

        // Eliminar avatar anterior si existe y no es el default
        if ($oldAvatar && $oldAvatar['avatar_url'] !== '/assets/default-avatar.png') {
            $oldPath = __DIR__ . '/..' . $oldAvatar['avatar_url'];
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        jsonSuccess([
            'avatar_url' => $avatarUrl,
            'message' => 'Avatar actualizado'
        ]);

    } else {
        jsonError('Error al subir la imagen', 500);
    }
}

/**
 * Cambiar contraseña
 */
function changePassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Método no permitido', 405);
    }

    $userId = getCurrentUserId();
    if (!$userId) {
        jsonError('No has iniciado sesión', 401);
    }

    $data = getRequestData();

    if (empty($data['current_password']) || empty($data['new_password'])) {
        jsonError('Contraseña actual y nueva son requeridas');
    }

    if (strlen($data['new_password']) < 8) {
        jsonError('La nueva contraseña debe tener al menos 8 caracteres');
    }

    // Verificar contraseña actual
    $user = db()->fetch("SELECT password_hash FROM users WHERE id = ?", [$userId]);

    if (!verifyPassword($data['current_password'], $user['password_hash'])) {
        jsonError('La contraseña actual es incorrecta');
    }

    // Actualizar contraseña
    $newHash = hashPassword($data['new_password']);
    db()->execute("UPDATE users SET password_hash = ? WHERE id = ?", [$newHash, $userId]);

    // Invalidar otras sesiones
    db()->execute(
        "DELETE FROM sessions WHERE user_id = ? AND session_token != ?",
        [$userId, $_SESSION['session_token'] ?? '']
    );

    jsonSuccess(['message' => 'Contraseña actualizada correctamente']);
}

/**
 * Helpers
 */
function getCurrentUserId() {
    if (!empty($_SESSION['user_id']) && !empty($_SESSION['session_token'])) {
        $session = db()->fetch(
            "SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()",
            [$_SESSION['session_token']]
        );
        if ($session) {
            return $session['user_id'];
        }
    }
    return null;
}

function getRequestData() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return $_POST;
}
