CREATE TABLE `claims` (
  `id` varchar(64) NOT NULL,
  `score` float NOT NULL,
  `permlink` varchar(255) NOT NULL,
  `githubUser` varchar(50) NOT NULL,
  `steemUser` varchar(50) NOT NULL,
  `pendingRewards` float DEFAULT NULL,
  `rewards` float DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `claims`
  ADD PRIMARY KEY (`id`);
