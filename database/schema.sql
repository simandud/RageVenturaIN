-- =====================================================
-- RAGEVENTURA DATABASE SCHEMA
-- Para MySQL (Hostinger)
-- =====================================================

-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS rageventura_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rageventura_db;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(20) UNIQUE NOT NULL COMMENT 'Tag único del usuario ej: @usuario123',
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT '/assets/default-avatar.png',
    bio TEXT DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    favorite_genre VARCHAR(50) DEFAULT NULL,
    social_instagram VARCHAR(100) DEFAULT NULL,
    social_soundcloud VARCHAR(100) DEFAULT NULL,
    social_spotify VARCHAR(100) DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_pro BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'dj', 'admin') DEFAULT 'user',
    points INT DEFAULT 0 COMMENT 'Puntos de fidelidad',
    events_attended INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_tag (tag),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE SESIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE CONTACTOS / LEADS
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'contact_form' COMMENT 'Origen: contact_form, newsletter, event',
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE SUSCRIPTORES NEWSLETTER
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE EVENTOS (para futuras funcionalidades)
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    date_start DATETIME NOT NULL,
    date_end DATETIME,
    location VARCHAR(200),
    price DECIMAL(10,2) DEFAULT 0,
    capacity INT DEFAULT 0,
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (date_start),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE ASISTENCIA A EVENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS event_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (user_id, event_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE BADGES/LOGROS
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'trophy',
    color VARCHAR(20) DEFAULT '#007BFF',
    points_required INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- BADGES DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_id)
) ENGINE=InnoDB;

-- =====================================================
-- INSERTAR BADGES INICIALES
-- =====================================================
INSERT INTO badges (name, description, icon, color, points_required) VALUES
('Novato', 'Te registraste en RageVentura', 'user-plus', '#5db4ff', 0),
('Primer Evento', 'Asististe a tu primer evento', 'calendar-check', '#00d4ff', 10),
('Fiel', 'Asististe a 5 eventos', 'heart', '#ff0066', 50),
('Veterano', 'Asististe a 10 eventos', 'award', '#ffd700', 100),
('VIP', 'Eres miembro VIP', 'crown', '#9b59b6', 200),
('DJ Amateur', 'Completaste un curso de DJ', 'headphones', '#e74c3c', 75),
('Productor', 'Completaste un curso de producción', 'music', '#2ecc71', 100),
('Influencer', 'Referiste a 10 amigos', 'share-2', '#f39c12', 150);

-- =====================================================
-- TRIGGER: Generar tag único al registrar usuario
-- =====================================================
DELIMITER //
CREATE TRIGGER before_user_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.tag IS NULL OR NEW.tag = '' THEN
        SET NEW.tag = CONCAT('@', LOWER(REPLACE(NEW.username, ' ', '')), FLOOR(RAND() * 9000 + 1000));
    END IF;
END//
DELIMITER ;

-- =====================================================
-- TRIGGER: Dar badge de novato al registrarse
-- =====================================================
DELIMITER //
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT NEW.id, id FROM badges WHERE name = 'Novato';
END//
DELIMITER ;
