-- Phase 2: Tags
CREATE TABLE IF NOT EXISTS tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_tag (user_id, name)
);

CREATE TABLE IF NOT EXISTS trade_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trade_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    UNIQUE KEY uk_trade_tag (trade_id, tag_id),
    INDEX idx_trade_tags_tag (tag_id)
);

-- Phase 2: Trade plan fields
ALTER TABLE trades ADD COLUMN IF NOT EXISTS target_price DECIMAL(12,4) NULL;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS stop_loss_price DECIMAL(12,4) NULL;

-- Phase 2: Journal-Trade link
CREATE TABLE IF NOT EXISTS journal_trades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    journal_id BIGINT NOT NULL,
    trade_id BIGINT NOT NULL,
    UNIQUE KEY uk_journal_trade (journal_id, trade_id)
);

-- Phase 3: User leaderboard opt-in
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_leaderboard TINYINT(1) NOT NULL DEFAULT 0;

-- Phase 3: Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    reference_type VARCHAR(20) NOT NULL,
    reference_id BIGINT NOT NULL,
    message VARCHAR(200) NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notif_user_read_created (user_id, is_read, created_at),
    INDEX idx_notif_user_created (user_id, created_at)
);

-- Phase 3: Notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    follow_notify TINYINT(1) NOT NULL DEFAULT 1,
    comment_notify TINYINT(1) NOT NULL DEFAULT 1,
    like_notify TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Phase 3: User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_type VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_badge (user_id, badge_type)
);
