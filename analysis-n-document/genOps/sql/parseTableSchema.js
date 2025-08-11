function parseSQLFile(sql) {
  const lines = sql.split('\n').map(l => l.trim()).filter(Boolean);

  let tableName = null;
  const columns = [];
  const parentKeys = [];
  let primaryKey = null;

  for (const line of lines) {
    if (line.trim() === '') continue;

    if (line.startsWith('CREATE TABLE')) {
      tableName = extractTableName(line);
      if (!tableName) {
        console.warn(`⚠️ Could not extract table name from line: ${line}`);
      }
      continue;
    }

    if (/^PRIMARY KEY/i.test(line)) {
      primaryKey = extractPrimaryKey(line);
      if (!primaryKey) {
        console.warn(`⚠️ Malformed PRIMARY KEY line: ${line}`);
      }
      continue;
    }

    if (/^CONSTRAINT/i.test(line)) {
      const constraint = extractConstraint(line);
      if (!constraint) {
        console.warn(`⚠️ Malformed CONSTRAINT line: ${line}`);
      } else {
        parentKeys.push(constraint);
      }
      continue;
    }

    if (isColumnLine(line)) {
      const col = parseColumnLine(line);
      if (!col) {
        console.warn(`⚠️ Could not parse column line: ${line}`);
      } else {
        columns.push(col);
      }
    }
  }
  //  console.log('tableName: ', tableName, 'columns: ', columns, 'primaryKey: ', primaryKey, 'parentKeys: ', parentKeys);
  return {
    name: tableName,
    fields: columns,
    primaryKey,
    parentKeys
  };
}

// --- Helpers ---

function extractTableName(line) {
  const match = line.match(/CREATE TABLE\s+(\w+)\s*\(/i);
  return match ? match[1] : 'UNKNOWN';
}

function extractPrimaryKey(line) {
  const match = line.match(/\((\w+)\)/);
  return match ? match[1] : null;
}

function extractConstraint(line) {

  const match = line.match(/FOREIGN KEY \((\w+)\) REFERENCES (\w+) \((\w+)\)/i);
  if (!match) return null;
  const [, column, refTable, refColumn] = match;
  return { column, refTable, refColumn };
}

function isColumnLine(line) {
  return !/^(PRIMARY KEY|INDEX|CONSTRAINT|\);)/i.test(line);
}

function parseColumnLine(line) {
  const match = line.match(/^(\w+)\s+(.+?)(?:,)?$/);
  if (!match) return null;

  const [, name, rest] = match;
  // Split on keywords like NOT, DEFAULT, COLLATE, etc.
  const keywordMatch = rest.match(/^(.+?)\s+(NOT\s+NULL|NULL|DEFAULT|COLLATE|COMMENT)/i);
  const type = keywordMatch ? keywordMatch[1].trim() : rest.trim().split(/\s+/)[0];
  const extras = keywordMatch ? rest.substring(keywordMatch[1].length).trim() : rest.substring(type.length).trim();

  const isNotNull = /NOT NULL/i.test(extras);
  let defaultValue = extractDefault(extras);
  
  // Strip quotes from string defaults but keep function calls like now()
  if (defaultValue && defaultValue !== 'NULL') {
    if ((defaultValue.startsWith("'") && defaultValue.endsWith("'")) || 
        (defaultValue.startsWith('"') && defaultValue.endsWith('"'))) {
      defaultValue = defaultValue.slice(1, -1);
    }
  }
  
  return {
    name,
    type: type.trim(),
    nullable: !isNotNull,
    default: defaultValue,
    raw: line
  };
}

function extractDefault(extras) {
  const match = extras.match(/DEFAULT\s+('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\([^)]+\)|\w+\([^)]*\)|\w+)/i);
  return match ? match[1] : null;
}

export { parseSQLFile };