<?php
/**
 * RAGEVENTURA - Configuración de Base de Datos
 * Configurado para Hostinger MySQL
 */

// Evitar acceso directo
if (!defined('RAGEVENTURA')) {
    die('Acceso no permitido');
}

// =====================================================
// CONFIGURACIÓN DE BASE DE DATOS - HOSTINGER
// =====================================================
// IMPORTANTE: Cambia estos valores por los de tu panel de Hostinger
// Los encontrarás en: hPanel > Bases de datos > MySQL

define('DB_HOST', 'localhost');                    // Normalmente 'localhost' en Hostinger
define('DB_NAME', 'u123456789_rageventura');       // Nombre de tu BD en Hostinger
define('DB_USER', 'u123456789_admin');             // Usuario de BD de Hostinger
define('DB_PASS', 'TuContraseñaSegura123!');       // Contraseña de BD
define('DB_CHARSET', 'utf8mb4');

// =====================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// =====================================================
define('APP_NAME', 'RageVentura');
define('APP_URL', 'https://tudominio.com');        // Cambiar por tu dominio
define('APP_ENV', 'production');                    // 'development' o 'production'

// Configuración de sesiones
define('SESSION_LIFETIME', 86400 * 7);             // 7 días en segundos
define('SESSION_NAME', 'RAGEVENTURA_SESSION');

// =====================================================
// CLASE DE CONEXIÓN A BASE DE DATOS
// =====================================================
class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);

        } catch (PDOException $e) {
            if (APP_ENV === 'development') {
                die("Error de conexión: " . $e->getMessage());
            } else {
                error_log("Database Error: " . $e->getMessage());
                die("Error de conexión a la base de datos. Por favor, inténtalo más tarde.");
            }
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    // Método helper para queries preparados
    public function query($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    // Obtener un solo registro
    public function fetch($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    // Obtener todos los registros
    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    // Insertar y devolver el ID
    public function insert($sql, $params = []) {
        $this->query($sql, $params);
        return $this->connection->lastInsertId();
    }

    // Actualizar/eliminar y devolver filas afectadas
    public function execute($sql, $params = []) {
        return $this->query($sql, $params)->rowCount();
    }

    // Prevenir clonación
    private function __clone() {}

    // Prevenir deserialización
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// =====================================================
// FUNCIONES HELPER
// =====================================================

/**
 * Obtener instancia de la base de datos
 */
function db() {
    return Database::getInstance();
}

/**
 * Sanitizar entrada
 */
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Generar token seguro
 */
function generateToken($length = 64) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Generar tag único para usuario
 */
function generateUserTag($username) {
    $base = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $username));
    $base = substr($base, 0, 12);
    $suffix = rand(1000, 9999);
    return '@' . $base . $suffix;
}

/**
 * Validar email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Hash de contraseña
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 3
    ]);
}

/**
 * Verificar contraseña
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Respuesta JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Error JSON
 */
function jsonError($message, $statusCode = 400) {
    jsonResponse(['success' => false, 'error' => $message], $statusCode);
}

/**
 * Éxito JSON
 */
function jsonSuccess($data = [], $message = 'Operación exitosa') {
    jsonResponse(array_merge(['success' => true, 'message' => $message], $data));
}
