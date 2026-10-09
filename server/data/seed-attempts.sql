-- Demo attempts so the home page has content. Executed only when the
-- database is first initialized (texts table empty).
INSERT OR IGNORE INTO attempts (id, text_id, input, score, created_at) VALUES
  (1, 1, '床前明月光，疑是地上霜。举头望明月，低头思古乡。', 0.9583, '2026-10-02T01:15:00.000Z'),
  (2, 2, '春眠不觉晓，处处问提鸟。夜来风雨声，花落几多少。', 0.875, '2026-10-03T08:30:00.000Z'),
  (3, 3, '白日依山尽，黄河入海流。欲穷千里目，', 0.75, '2026-10-05T12:05:00.000Z'),
  (4, 1, '床前明月光，疑是地上霜。举头望明月，低头思故乡。', 1, '2026-10-06T02:40:00.000Z'),
  (5, 4, '红豆生南国，春来生几枝。愿君多采摘，此物最相思。', 0.9167, '2026-10-08T10:20:00.000Z');
