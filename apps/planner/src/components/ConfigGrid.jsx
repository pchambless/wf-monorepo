import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';

const ConfigGrid = ({ config, data = null, onRowSelect = null }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (data) {
            setRows(data);
        } else {
            // Mock data for testing
            setRows([
                { id: 1, name: 'Test Plan 1', status: 'active', priority: 'high' },
                { id: 2, name: 'Test Plan 2', status: 'pending', priority: 'medium' }
            ]);
        }
    }, [data]);

    const handleRowClick = (row) => {
        if (onRowSelect) {
            onRowSelect(row);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {config.columns.slice(0, 5).map((column) => (
                            <TableCell key={column.field}>
                                {column.headerName}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.id}
                            hover
                            onClick={() => handleRowClick(row)}
                            sx={{ cursor: onRowSelect ? 'pointer' : 'default' }}
                        >
                            {config.columns.slice(0, 5).map((column) => (
                                <TableCell key={column.field}>
                                    {row[column.field] || '—'}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ConfigGrid;