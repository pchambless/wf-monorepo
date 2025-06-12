import createLogger from '../logger';
import { modalStore } from '@modal';
import React from 'react';
import { toJS } from 'mobx';
import SQLPreviewContent from '@components/dml/SQLPreviewContent'; // Import the component

const log = createLogger('DML.previewSql');

/**
 * Show a SQL preview and get user confirmation
 */
export const previewSql = (sqlStatement, requestBody, dmlMap, callback) => {
  // Convert everything to strings BEFORE constructing JSX
  const method = String(toJS(dmlMap?.dmlConfig?.METHOD) || 'UNKNOWN');
  const entityId = String(toJS(dmlMap?.dmlConfig?.entityId) || 'unknown');
  
  // Pre-stringify everything
  const sqlString = typeof sqlStatement === 'string' 
    ? sqlStatement 
    : JSON.stringify(toJS(sqlStatement));
  
  const dmlMapString = JSON.stringify(toJS(dmlMap), null, 2);
  
  // Debug output in console
  log('=========== DML PREVIEW ===========');
  console.log('METHOD:', method);
  console.log('ENTITY:', entityId);
  console.log('SQL:', sqlString);
  console.log('DML MAP:', dmlMapString);
  console.log('===================================');
  
  // AUTO-APPROVE CHECK
  const autoApprove = process.env.REACT_APP_AUTO_APPROVE_SQL === 'true' && 
                      process.env.NODE_ENV !== 'production';

  log('Auto-approve setting:', { 
    autoApprove,
    setting: process.env.REACT_APP_AUTO_APPROVE_SQL,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (autoApprove) {
    log.info('Auto-approval enabled, bypassing modal');
    setTimeout(() => {
      if (callback) callback(true);
    }, 2000);
    return;
  }
  
  // Modal display with pre-converted strings
  log.info(`Showing SQL preview modal for ${method} on ${entityId}`);
  console.log('MODAL: Display requested, execution should pause until user interaction');
  
  // Use the isolated component with only primitive values
  modalStore.showModal({
    title: `${method} Preview - ${entityId}`,
    content: <SQLPreviewContent 
      sqlStatement={sqlString}
      method={method}
      entityId={entityId}
      dmlMap={dmlMapString}
    />,
    actions: [
      {
        label: 'Execute',
        color: 'primary',
        variant: 'contained',
        onClick: () => {
          console.log('MODAL: User clicked Execute button');
          modalStore.closeModal();
          if (callback) callback(true);
        }
      },
      {
        label: 'Cancel',
        color: 'inherit',
        onClick: () => {
          console.log('MODAL: User clicked Cancel button');
          modalStore.closeModal();
          if (callback) callback(false);
        }
      }
    ],
    size: 'lg',
    onClose: () => {
      console.log('MODAL: Close without button click');
      if (callback) callback(false);
    }
  });
  
  console.log('MODAL: Display function complete - waiting for user interaction');
};
