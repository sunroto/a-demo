-- Preset dictation texts. Idempotent: executed on every server start.
INSERT OR IGNORE INTO texts (id, title, content, created_at) VALUES
  (1, '静夜思', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '2026-10-01T00:00:00.000Z'),
  (2, '春晓', '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', '2026-10-01T00:00:00.000Z'),
  (3, '登鹳雀楼', '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', '2026-10-01T00:00:00.000Z'),
  (4, '相思', '红豆生南国，春来发几枝。愿君多采撷，此物最相思。', '2026-10-01T00:00:00.000Z');
