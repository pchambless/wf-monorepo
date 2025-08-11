function mapSqlTypeToUiType(sqlType) {

    const type = sqlType.toUpperCase();
    if (type.startsWith('INT') || type.startsWith('FLOAT') || type.startsWith('DECIMAL')) return 'number';
    if (type.startsWith('VARCHAR') || type.startsWith('TEXT')) return 'text';
    if (type.startsWith('DATE') || type.startsWith('TIMESTAMP')) return 'datetime';
    if (type.startsWith('BOOLEAN') || type.startsWith('TINYINT(1)')) return 'checkbox';
    return 'text';
}

function addFieldAttributes(tableSchema) {
    if (!tableSchema.fields) {
        console.warn('⚠️ No fields found in schema:', tableSchema);
        return tableSchema;
    }

    return {
        ...tableSchema,
        fields: tableSchema.fields.map(field => {
            const attributes = {};

            // UI type
            const uiType = mapSqlTypeToUiType(field.type);
            attributes.uiType = uiType;

            // Validation rules
            const rules = [];
            if (!field.nullable) rules.push('required');

            const varcharMatch = field.type.match(/VARCHAR\((\d+)\)/i);
            if (varcharMatch) rules.push(`maxLength:${varcharMatch[1]}`);

            rules.push(`type:${uiType}`);
            attributes.validationRules = rules;

            // Input props
            const inputProps = {};
            if (varcharMatch) inputProps.maxLength = parseInt(varcharMatch[1]);
            if (field.default && field.default !== 'NULL') {
                // Strip quotes from string defaults
                let defaultValue = field.default;
                if ((defaultValue.startsWith("'") && defaultValue.endsWith("'")) || 
                    (defaultValue.startsWith('"') && defaultValue.endsWith('"'))) {
                    defaultValue = defaultValue.slice(1, -1);
                }
                inputProps.defaultValue = defaultValue;
            }
            attributes.inputProps = inputProps;
            console.log(`[addFieldAttributes] field ${field.name}: ${JSON.stringify(attributes)}`);

            return {
                ...field,
                ...attributes
            };
        })
    };
}

export { addFieldAttributes };