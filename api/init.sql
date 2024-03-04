SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `chess_games` (
  `id` int(10) UNSIGNED NOT NULL,
  `ip` varchar(15) CHARACTER SET utf16 COLLATE utf16_general_ci NOT NULL,
  `user` varchar(20) CHARACTER SET utf16 COLLATE utf16_general_ci NOT NULL,
  `email` varchar(30) CHARACTER SET utf16 COLLATE utf16_general_ci NOT NULL,
  `modified` datetime NOT NULL,
  `sequences` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `chess_sequences` (
  `id` int(10) UNSIGNED NOT NULL,
  `game_id` int(10) UNSIGNED NOT NULL,
  `figure` int(11) NOT NULL,
  `origin` int(11) NOT NULL,
  `field` int(11) NOT NULL,
  `killed` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

ALTER TABLE `chess_games`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `chess_sequences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sequence_game` (`game_id`);

ALTER TABLE `chess_games`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `chess_sequences`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `chess_sequences`
  ADD CONSTRAINT `fk_sequence_game` FOREIGN KEY (`game_id`) REFERENCES `chess_games` (`id`);

COMMIT;
