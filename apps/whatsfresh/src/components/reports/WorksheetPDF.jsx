import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles for the worksheet
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    backgroundColor: '#e6f3ff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d32f2f',
    marginBottom: 5
  },
  worksheetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3
  },
  batchInfo: {
    fontSize: 12,
    textAlign: 'center',
    color: '#1976d2',
    fontWeight: 'bold'
  },
  dateInfo: {
    fontSize: 10,
    textAlign: 'right',
    position: 'absolute',
    top: 10,
    right: 20
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    padding: 8,
    marginTop: 15,
    marginBottom: 5,
    color: '#d32f2f'
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc'
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableHeader: {
    backgroundColor: '#e3f2fd',
    fontWeight: 'bold'
  },
  tableColOrder: {
    width: '8%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  tableColIngredient: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4,
    backgroundColor: '#fffde7'
  },
  tableColBatch: {
    width: '35%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4
  },
  tableColDescription: {
    width: '32%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4
  },
  tableColTask: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4,
    backgroundColor: '#fffde7'
  },
  tableColWorkers: {
    width: '35%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4
  },
  tableColMeasure: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4
  },
  tableColComments: {
    width: '17%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4
  },
  cellText: {
    fontSize: 9
  }
});

/**
 * Product Batch Worksheet PDF Component
 * Generates a print-ready worksheet matching the current Appsmith format
 */
const WorksheetPDF = ({ batchData, ingredients, tasks }) => {
  // Get current date for header
  const currentDate = new Date().toISOString().split('T')[0];
  
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Date in top right */}
        <Text style={styles.dateInfo}>Date: {currentDate}</Text>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {batchData?.company || 'Company Name'}
          </Text>
          <Text style={styles.worksheetTitle}>
            Worksheet: {batchData?.product || 'Product Name'}
          </Text>
          <Text style={styles.batchInfo}>
            Batch: {batchData?.batchNumber || 'Batch Number'}
          </Text>
        </View>

        {/* Ingredients Section */}
        <Text style={styles.sectionTitle}>
          {batchData?.batchNumber || 'Batch'}: Ingredients
        </Text>
        
        <View style={styles.table}>
          {/* Ingredients Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColOrder}>
              <Text style={styles.cellText}>Ordr</Text>
            </View>
            <View style={styles.tableColIngredient}>
              <Text style={styles.cellText}>Ingredient</Text>
            </View>
            <View style={styles.tableColBatch}>
              <Text style={styles.cellText}>Ingr Batch(es): Vendor</Text>
            </View>
            <View style={styles.tableColDescription}>
              <Text style={styles.cellText}>Description</Text>
            </View>
          </View>
          
          {/* Ingredients Data */}
          {ingredients?.map((ingredient, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColOrder}>
                <Text style={styles.cellText}>{ingredient.Ordr}</Text>
              </View>
              <View style={styles.tableColIngredient}>
                <Text style={styles.cellText}>{ingredient.Ingredient}</Text>
              </View>
              <View style={styles.tableColBatch}>
                <Text style={styles.cellText}>{ingredient['Ingr Batch(es): Vendor']}</Text>
              </View>
              <View style={styles.tableColDescription}>
                <Text style={styles.cellText}>{ingredient.Description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tasks Section */}
        <Text style={styles.sectionTitle}>
          {batchData?.batchNumber || 'Batch'}: Tasks
        </Text>
        
        <View style={styles.table}>
          {/* Tasks Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColOrder}>
              <Text style={styles.cellText}>Ordr</Text>
            </View>
            <View style={styles.tableColTask}>
              <Text style={styles.cellText}>Task</Text>
            </View>
            <View style={styles.tableColWorkers}>
              <Text style={styles.cellText}>Workers</Text>
            </View>
            <View style={styles.tableColMeasure}>
              <Text style={styles.cellText}>Measure</Text>
            </View>
            <View style={styles.tableColComments}>
              <Text style={styles.cellText}>Comments</Text>
            </View>
          </View>
          
          {/* Tasks Data */}
          {tasks?.map((task, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColOrder}>
                <Text style={styles.cellText}>{task.Ordr}</Text>
              </View>
              <View style={styles.tableColTask}>
                <Text style={styles.cellText}>{task.Task}</Text>
              </View>
              <View style={styles.tableColWorkers}>
                <Text style={styles.cellText}>{task.Workers}</Text>
              </View>
              <View style={styles.tableColMeasure}>
                <Text style={styles.cellText}>{task.Measure}</Text>
              </View>
              <View style={styles.tableColComments}>
                <Text style={styles.cellText}>{task.Comments}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default WorksheetPDF;
