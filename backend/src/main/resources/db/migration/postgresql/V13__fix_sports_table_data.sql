DELETE FROM sports
WHERE name LIKE 'Seed Sport %'
  AND NOT EXISTS (
      SELECT 1
      FROM courts
      WHERE courts.sport_id = sports.id
  );
