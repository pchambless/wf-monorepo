# WhatsFresh SQL Directive Reference

_Generated on 6/14/2025_

This document describes all available directives you can use in SQL view comments.

## Field Identity

### `PK`

Primary key field

**Example:**
```sql
id AS userId -- PK; sys; type:number
```

### `sys`

System field (hidden but used in operations)

**Example:**
```sql
field AS alias -- sys
```

### `parentKey`

*Documentation pending*

```sql
field AS alias -- parentKey
```

## Display Types

### `type`

Form field display type

**Values:** `text`, `multiLine`, `number`, `select`, `date`, `boolean`, `hidden`

**Example:**
```sql
name AS userName -- type:text; label:Full Name
```

## Validation

### `req`

Required field

**Example:**
```sql
field AS alias -- req
```

### `unique`

*Documentation pending*

```sql
field AS alias -- unique
```

### `min`

Minimum value for number fields

**Example:**
```sql
field AS alias -- min:value
```

### `max`

Maximum value for number fields

**Example:**
```sql
field AS alias -- max:value
```

## Layout

### `label`

Display label

**Example:**
```sql
field AS alias -- label:value
```

### `grp`

*Documentation pending*

```sql
field AS alias -- grp
```

### `width`

Column width

**Example:**
```sql
field AS alias -- width:value
```

### `tableHide`

*Documentation pending*

```sql
field AS alias -- tableHide
```

### `formHide`

*Documentation pending*

```sql
field AS alias -- formHide
```

## Select Fields

### `entity`

Related entity for select fields

**Example:**
```sql
type_id AS typeId -- type:select; entity:typeList; valField:typeID; dispField:typeName
```

### `valField`

Value field for select options

**Example:**
```sql
field AS alias -- valField:value
```

### `dispField`

Display field for select options

**Example:**
```sql
field AS alias -- dispField:value
```

### `options`

*Documentation pending*

```sql
field AS alias -- options
```

