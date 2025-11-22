<?php
/**
 * RAGEVENTURA - API de Contacto
 * Guardar formularios de contacto y suscripciones
 */

define('RAGEVENTURA', true);
require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'contact';

switch ($action) {
    case 'contact':
        handleContactForm();
        break;
    case 'newsletter':
        handleNewsletter();
        break;
    case 'event-register':
        handleEventRegister();
        break;
    default:
        jsonError('Acción no válida', 400);
}

/**
 * Guardar mensaje de contacto
 */
function handleContactForm() {
    $data = getRequestData();

    // Validar campos requeridos
    if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
        jsonError('Nombre, email y mensaje son requeridos');
    }

    $name = sanitize($data['name']);
    $email = strtolower(sanitize($data['email']));
    $phone = sanitize($data['phone'] ?? '');
    $subject = sanitize($data['subject'] ?? 'Contacto General');
    $message = sanitize($data['message']);
    $source = sanitize($data['source'] ?? 'contact_form');

    if (!isValidEmail($email)) {
        jsonError('El email no es válido');
    }

    if (strlen($message) < 10) {
        jsonError('El mensaje es muy corto');
    }

    if (strlen($message) > 5000) {
        jsonError('El mensaje es muy largo (máximo 5000 caracteres)');
    }

    try {
        db()->insert(
            "INSERT INTO contacts (name, email, phone, subject, message, source) VALUES (?, ?, ?, ?, ?, ?)",
            [$name, $email, $phone, $subject, $message, $source]
        );

        // Opcional: enviar email de notificación (implementar según necesidad)
        // sendNotificationEmail($name, $email, $subject, $message);

        jsonSuccess(['message' => '¡Mensaje enviado! Te contactaremos pronto.']);

    } catch (Exception $e) {
        error_log("Contact Form Error: " . $e->getMessage());
        jsonError('Error al enviar el mensaje. Inténtalo de nuevo.', 500);
    }
}

/**
 * Suscribir al newsletter
 */
function handleNewsletter() {
    $data = getRequestData();

    if (empty($data['email'])) {
        jsonError('El email es requerido');
    }

    $email = strtolower(sanitize($data['email']));
    $name = sanitize($data['name'] ?? '');

    if (!isValidEmail($email)) {
        jsonError('El email no es válido');
    }

    // Verificar si ya está suscrito
    $existing = db()->fetch(
        "SELECT id, is_active FROM newsletter_subscribers WHERE email = ?",
        [$email]
    );

    if ($existing) {
        if ($existing['is_active']) {
            jsonSuccess(['message' => 'Ya estás suscrito a nuestro newsletter']);
        } else {
            // Reactivar suscripción
            db()->execute(
                "UPDATE newsletter_subscribers SET is_active = 1, unsubscribed_at = NULL WHERE id = ?",
                [$existing['id']]
            );
            jsonSuccess(['message' => '¡Bienvenido de vuelta! Tu suscripción ha sido reactivada.']);
        }
    }

    try {
        db()->insert(
            "INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?)",
            [$email, $name]
        );

        jsonSuccess(['message' => '¡Suscrito! Recibirás las últimas novedades de RageVentura.']);

    } catch (Exception $e) {
        error_log("Newsletter Error: " . $e->getMessage());
        jsonError('Error al suscribirse. Inténtalo de nuevo.', 500);
    }
}

/**
 * Registro rápido para eventos
 */
function handleEventRegister() {
    $data = getRequestData();

    if (empty($data['name']) || empty($data['email'])) {
        jsonError('Nombre y email son requeridos');
    }

    $name = sanitize($data['name']);
    $email = strtolower(sanitize($data['email']));
    $phone = sanitize($data['phone'] ?? '');
    $eventName = sanitize($data['event'] ?? 'Evento General');

    if (!isValidEmail($email)) {
        jsonError('El email no es válido');
    }

    try {
        // Guardar como contacto con source específico
        db()->insert(
            "INSERT INTO contacts (name, email, phone, subject, message, source) VALUES (?, ?, ?, ?, ?, ?)",
            [$name, $email, $phone, "Registro: $eventName", "Interesado en el evento: $eventName", 'event_register']
        );

        // También suscribir al newsletter si no está
        $existing = db()->fetch("SELECT id FROM newsletter_subscribers WHERE email = ?", [$email]);
        if (!$existing) {
            db()->insert(
                "INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?)",
                [$email, $name]
            );
        }

        jsonSuccess(['message' => '¡Registrado! Te enviaremos los detalles del evento.']);

    } catch (Exception $e) {
        error_log("Event Register Error: " . $e->getMessage());
        jsonError('Error al registrarse. Inténtalo de nuevo.', 500);
    }
}

/**
 * Helpers
 */
function getRequestData() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return $_POST;
}
