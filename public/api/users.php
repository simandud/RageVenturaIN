<?php
/**
 * RAGEVENTURA - API de Usuarios / Comunidad
 * Listar usuarios, buscar, ver perfiles públicos
 */

define('RAGEVENTURA', true);
require_once __DIR__ . '/../config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        listUsers();
        break;
    case 'search':
        searchUsers();
        break;
    case 'featured':
        getFeaturedUsers();
        break;
    case 'stats':
        getCommunityStats();
        break;
    default:
        jsonError('Acción no válida', 400);
}

/**
 * Listar usuarios de la comunidad
 */
function listUsers() {
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $orderBy = sanitize($_GET['order'] ?? 'newest');
    $role = sanitize($_GET['role'] ?? '');

    // Construir ORDER BY
    switch ($orderBy) {
        case 'points':
            $order = 'points DESC, created_at DESC';
            break;
        case 'events':
            $order = 'events_attended DESC, created_at DESC';
            break;
        case 'oldest':
            $order = 'created_at ASC';
            break;
        case 'newest':
        default:
            $order = 'created_at DESC';
            break;
    }

    // Construir WHERE
    $where = "1=1";
    $params = [];

    if ($role && in_array($role, ['user', 'dj', 'admin'])) {
        $where .= " AND role = ?";
        $params[] = $role;
    }

    // Contar total
    $total = db()->fetch("SELECT COUNT(*) as count FROM users WHERE $where", $params)['count'];

    // Obtener usuarios
    $params[] = $limit;
    $params[] = $offset;

    $users = db()->fetchAll(
        "SELECT id, tag, username, avatar_url, bio, city, favorite_genre,
                is_verified, is_pro, role, points, events_attended, created_at
         FROM users
         WHERE $where
         ORDER BY $order
         LIMIT ? OFFSET ?",
        $params
    );

    // Obtener badges para cada usuario (solo los primeros 3)
    foreach ($users as &$user) {
        $user['badges'] = db()->fetchAll(
            "SELECT b.name, b.icon, b.color
             FROM user_badges ub
             JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = ?
             ORDER BY ub.earned_at DESC
             LIMIT 3",
            [$user['id']]
        );
    }

    jsonSuccess([
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Buscar usuarios
 */
function searchUsers() {
    $query = sanitize($_GET['q'] ?? '');

    if (strlen($query) < 2) {
        jsonError('La búsqueda debe tener al menos 2 caracteres');
    }

    $searchTerm = '%' . $query . '%';

    $users = db()->fetchAll(
        "SELECT id, tag, username, avatar_url, city, is_verified, is_pro, role
         FROM users
         WHERE username LIKE ? OR tag LIKE ? OR city LIKE ?
         ORDER BY
            CASE WHEN username LIKE ? THEN 1 ELSE 2 END,
            points DESC
         LIMIT 20",
        [$searchTerm, $searchTerm, $searchTerm, $query . '%']
    );

    jsonSuccess(['users' => $users, 'count' => count($users)]);
}

/**
 * Obtener usuarios destacados
 */
function getFeaturedUsers() {
    // DJs verificados
    $djs = db()->fetchAll(
        "SELECT id, tag, username, avatar_url, bio, is_verified, points
         FROM users
         WHERE role = 'dj' AND is_verified = 1
         ORDER BY points DESC
         LIMIT 6"
    );

    // Usuarios más activos (más puntos)
    $topUsers = db()->fetchAll(
        "SELECT id, tag, username, avatar_url, points, events_attended
         FROM users
         ORDER BY points DESC
         LIMIT 10"
    );

    // Usuarios recientes
    $newUsers = db()->fetchAll(
        "SELECT id, tag, username, avatar_url, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 8"
    );

    jsonSuccess([
        'featured_djs' => $djs,
        'top_users' => $topUsers,
        'new_members' => $newUsers
    ]);
}

/**
 * Estadísticas de la comunidad
 */
function getCommunityStats() {
    $stats = db()->fetch(
        "SELECT
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'dj' THEN 1 ELSE 0 END) as total_djs,
            SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as pro_members,
            SUM(events_attended) as total_attendance,
            SUM(points) as total_points
         FROM users"
    );

    $recentActivity = db()->fetch(
        "SELECT COUNT(*) as new_this_week
         FROM users
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    jsonSuccess([
        'stats' => [
            'total_members' => (int)$stats['total_users'],
            'total_djs' => (int)$stats['total_djs'],
            'pro_members' => (int)$stats['pro_members'],
            'events_attended' => (int)$stats['total_attendance'],
            'community_points' => (int)$stats['total_points'],
            'new_this_week' => (int)$recentActivity['new_this_week']
        ]
    ]);
}
