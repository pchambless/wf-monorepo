/**
 * Comprehensive FormStore for CRUD operations
 */
import { makeAutoObservable, action, runInAction, toJS } from "mobx";
import { createLogger } from "@whatsfresh/shared-imports";
import { api } from "@whatsfresh/shared-imports/api";
import { contextStore } from "@whatsfresh/shared-imports";

class FormStore {
  // Form state (observable)
  formData = {};
  errors = {};
  touched = {};
  isSubmitting = false;
  formMode = "view";
  isValid = true;

  // Configuration properties - use columns directly
  pageMap = null; // Will be excluded from observables

  // Add contextData property
  contextData = {};

  constructor(config, initialData = {}) {
    // Initialize logger first
    this.log = createLogger("FormStore");

    // Initialize pageMap BEFORE making observable - no verification needed
    if (config?.pageMap) {
      this.pageMap = config.pageMap; // Use direct reference
    }

    // Initialize formData from initialData
    this.formData = { ...initialData };

    // SINGLE call to makeAutoObservable - combining both configurations
    makeAutoObservable(this, {
      pageMap: false, // Exclude from observable
      log: false, // Exclude logger from observables
      setPageMap: action, // Mark as action (from the second call)
      getPageMap: false, // Exclude getter (from the second call)
    });

    // Safe logging (after setup)
    if (typeof this.log === "function") {
      this.log("FormStore initialized with pageMap:", {
        pageMapId: this.pageMap?.id,
        totalFields: this.getTotalFieldCount(),
      });
    } else if (this.log && typeof this.log.info === "function") {
      this.log.info("FormStore initialized with pageMap:", {
        pageMapId: this.pageMap?.id,
        totalFields: this.getTotalFieldCount(),
      });
    }
  }

  // Action methods
  setFieldValue(name, value) {
    runInAction(() => {
      // Update formData (single source of truth)
      this.formData[name] = value;

      // Mark field as touched for validation
      this.touched[name] = true;

      // Clear error for this field
      if (this.errors[name]) {
        delete this.errors[name];
      }
    });
  }

  setFormData(data) {
    runInAction(() => {
      // Store the data (single source of truth)
      this.formData = { ...data };
      this.errors = {};
      this.touched = {};

      this.log("Setting form data", {
        dataKeys: Object.keys(data || {}),
        fieldCount: Object.keys(data || {}).length,
      });
    });
  }

  setFormMode(mode) {
    runInAction(() => {
      this.formMode = mode;
    });
  }

  setSubmitting(isSubmitting) {
    runInAction(() => {
      this.isSubmitting = isSubmitting;
    });
  }

  setFormError(message) {
    runInAction(() => {
      this.errors._form = message;
    });
  }

  // Add setContextData method
  setContextData(context) {
    if (!context) {
      return this;
    }

    runInAction(() => {
      this.contextData = { ...context };

      // If context contains parent ID, set it
      if (context.parentId && this.pageMap?.pageConfig?.parentIdField) {
        this.setParentId(context.parentId);
      }
    });

    return this;
  }

  // Simplified validation - field components handle their own validation
  validateField(fieldName) {
    // Clear existing error
    delete this.errors[fieldName];

    // Basic validation will be handled by field components
    // FormStore only needs to track if form is valid for submission
    return true;
  }

  validate() {
    this.log("Validating form data");

    // Skip validation for DELETE operations
    if (this.formMode === "DELETE") {
      this.isValid = true;
      return true;
    }

    // Simplified validation - field components handle individual validation
    // FormStore just ensures we have required data for submission
    const hasRequiredData = Object.keys(this.formData).length > 0;

    // Update observable state
    runInAction(() => {
      this.isValid = hasRequiredData;
    });

    return hasRequiredData;
  }

  /**
   * Save the form data using DML
   * @returns {Promise<Object>} Result of the operation
   */
  async save(previewOnly = false) {
    this.log("FormStore.save called", {
      mode: this.formMode,
      data: this.formData,
      previewOnly,
    });

    this.setSubmitting(true);

    try {
      // Validate first
      if (!this.validate()) {
        this.setFormError("Please correct the errors in the form.");
        return { success: false, error: "Validation failed" };
      }

      // Prepare form data
      this.prepareForSave();

      // Get userID and acctID from contextStore for audit trail and data integrity
      const userID = contextStore.getParameter("userID");
      const acctID = contextStore.getParameter("acctID");

      if (!userID) {
        throw new Error(
          "User not authenticated - userID required for DML operations"
        );
      }

      if (!acctID) {
        throw new Error(
          "No account selected - acctID required for DML operations"
        );
      }

      // Determine DML method based on form mode
      let method;
      if (
        this.formMode === "new" ||
        this.formMode === "INSERT" ||
        this.formMode === "ADD"
      ) {
        method = "INSERT";
      } else if (
        this.formMode === "edit" ||
        this.formMode === "UPDATE" ||
        this.formMode === "EDIT"
      ) {
        method = "UPDATE";
      } else if (this.formMode === "delete" || this.formMode === "DELETE") {
        method = "DELETE";
      } else {
        throw new Error(`Unsupported form mode: ${this.formMode}`);
      }

      // Build DML request payload with defaults for required fields
      let formDataWithDefaults = {
        ...this.plainFormData,
        userID, // Required for audit trail
      };

      // Add acctID if not already present in form data (check for hidden field first)
      if (!formDataWithDefaults.acctID && !formDataWithDefaults.account_id) {
        formDataWithDefaults.acctID = acctID; // Will be mapped to account_id by column mapping
        this.log("Added acctID from contextStore", { acctID });
      } else {
        this.log("acctID already present in form data", {
          acctID: formDataWithDefaults.acctID,
          account_id: formDataWithDefaults.account_id,
        });
      }

      // Add relevant contextStore parameters based on pageMap field configuration
      const fieldMappings =
        this.pageMap?.configDML?.fieldMappings ||
        this.pageMap?.dmlConfig?.fieldMappings ||
        {};
      const allContextParams = contextStore.getAllParameters();

      Object.entries(allContextParams).forEach(([paramName, paramValue]) => {
        // Skip userID and acctID as they're handled above
        if (paramName !== "userID" &&
                  paramName !== "acctID" &&
                  paramValue !== undefined &&
                  paramValue !== null && (fieldMappings[paramName] && !formDataWithDefaults[paramName])) {
              formDataWithDefaults[paramName] = paramValue;
              this.log(
                `Added ${paramName} from contextStore (mapped to ${fieldMappings[paramName]})`,
                {
                  [paramName]: paramValue,
                }
              );
        }
      });

      // Apply column name mapping from view names to database column names
      this.log("Before column mapping", {
        formData: Object.keys(formDataWithDefaults),
        configDML: this.pageMap?.configDML,
        dmlConfig: this.pageMap?.dmlConfig,
        fieldMappings:
          this.pageMap?.configDML?.fieldMappings ||
          this.pageMap?.dmlConfig?.fieldMappings,
      });

      formDataWithDefaults =
        this.mapViewColumnsToDatabaseColumns(formDataWithDefaults);

      this.log("After column mapping", {
        formData: Object.keys(formDataWithDefaults),
      });

      // Apply defaults for common required fields that should be optional from UX perspective
      if (method === "INSERT" && (formDataWithDefaults.description === undefined ||
                formDataWithDefaults.description === null)) {
            formDataWithDefaults.description = "";
      }

      // Determine table name from pageMap
      const tableName =
        this.pageMap?.configDML?.table ||
        this.pageMap?.dbTable ||
        this.pageMap?.systemConfig?.table || // This is where it actually is!
        this.pageMap?.systemConfig?.dbTable ||
        this.inferTableFromPageMap();

      const dmlPayload = {
        method,
        table: tableName,
        data: formDataWithDefaults,
        primaryKey: formDataWithDefaults.id, // All tables use 'id' as primary key - extract the actual value
        listEvent: this.pageMap?.configDML?.listEvent, // Optional refresh event
      };

      this.log("Executing DML operation", {
        method,
        table: dmlPayload.table,
        primaryKey: dmlPayload.primaryKey,
        pageMapId: this.pageMap?.id,
        availableFields: Object.keys(this.pageMap || {}),
        previewOnly,
      });

      // Validate required fields before sending
      if (!dmlPayload.table) {
        throw new Error(
          `Unable to determine table name from pageMap. Available pageMap fields: ${Object.keys(
            this.pageMap || {}
          ).join(", ")}`
        );
      }

      // Get listEvent for automatic refresh
      const listEvent = this.pageMap?.systemConfig?.listEvent;

      // Execute the DML operation with automatic refresh
      const result = await api.execDmlWithRefresh(
        "operation",
        dmlPayload,
        listEvent
      );

      this.log("DML operation completed", { success: result.success });

      // Reset error state on success
      if (result.success) {
        this.setFormError(null);
      }

      return result;
    } catch (error) {
      this.log("DML operation failed", error);
      this.setFormError(error.message || "An error occurred while saving.");
      return { success: false, error };
    } finally {
      this.setSubmitting(false);
    }
  }

  // Simplified form data preparation - DML operations handle parameter resolution
  prepareForSave() {
    // Log the current form data for debugging
    this.log.info("Preparing form data for save", {
      formData: this.formData,
      fieldCount: Object.keys(this.formData).length,
    });

    // Check if values are missing - simplified validation
    const hasValues = Object.values(this.formData).some(
      (val) => val !== undefined && val !== null
    );

    if (!hasValues) {
      this.log.warn("WARNING: Form data has keys but no values!", {
        keys: Object.keys(this.formData),
      });
    }

    // Convert formData to plain JS - DML operations handle parameter resolution
    this.plainFormData = toJS(this.formData);

    this.log.info("Prepared data (parameter resolution handled by DML):", {
      formData: this.plainFormData,
    });
  }

  // Helper to determine entity type from pageMap - simplified version
  determineEntityType() {
    // Only in development, add a warning if somehow the property is missing
    if (process.env.NODE_ENV === "development" && !this.pageMap?.id) {
      console.warn(
        "PageMap missing id property - generator may be misconfigured"
      );
    }

    return this.pageMap.id;
  }

  // Helper to get total field count from formConfig
  getTotalFieldCount() {
    if (!this.pageMap?.formConfig?.groups) {
      return 0;
    }
    return this.pageMap.formConfig.groups.reduce((total, group) => {
      return total + (group.fields?.length || 0);
    }, 0);
  }

  // Helper to infer table name from pageMap structure
  inferTableFromPageMap() {
    if (!this.pageMap) {
      return null;
    }

    // Try common pageMap properties that might contain table info
    const possibleTableSources = [
      this.pageMap.configDML?.table,
      this.pageMap.dbTable,
      this.pageMap.systemConfig?.dbTable,
      this.pageMap.tableConfig?.table,
      this.pageMap.table,
    ];

    // Return first non-null value
    for (const source of possibleTableSources) {
      if (source) {
        return source;
      }
    }

    // Last resort: try to infer from pageMap ID
    if (this.pageMap.id) {
      // Convert pageMap ID to likely table name
      // e.g., "ingrTypeList" -> "ingredient_types"
      const {id} = this.pageMap;
      if (id.includes("ingrType")) {
        return "ingredient_types";
      }
      if (id.includes("prodType")) {
        return "product_types";
      }
      if (id.includes("prod")) {
        return "products";
      }
      if (id.includes("ingr")) {
        return "ingredients";
      }
      if (id.includes("brnd")) {
        return "brands";
      }
      if (id.includes("vndr")) {
        return "vendors";
      }
      if (id.includes("wrkr")) {
        return "workers";
      }
      if (id.includes("meas")) {
        return "measures";
      }
      if (id.includes("task")) {
        return "tasks";
      }
      if (id.includes("acct")) {
        return "accounts";
      }
      if (id.includes("user")) {
        return "users";
      }
    }

    return null;
  }

  // Helper to map view column names to database column names using dmlConfig.fieldMappings
  mapViewColumnsToDatabaseColumns(formData) {
    if (!formData || !this.pageMap) {
      return formData;
    }

    const mappedData = { ...formData };

    // Check both configDML and dmlConfig for field mappings
    const fieldMappings =
      this.pageMap.configDML?.fieldMappings ||
      this.pageMap.dmlConfig?.fieldMappings;

    if (fieldMappings) {
      Object.entries(fieldMappings).forEach(([viewColumn, dbColumn]) => {
        if (mappedData[viewColumn] !== undefined) {
          mappedData[dbColumn] = mappedData[viewColumn];
          delete mappedData[viewColumn];
        }
      });

      this.log("Column mapping applied", {
        original: Object.keys(formData),
        mapped: Object.keys(mappedData),
        mappings: fieldMappings,
        source: this.pageMap.configDML?.fieldMappings
          ? "configDML"
          : "dmlConfig",
      });
    } else {
      this.log("No field mappings found - using original field names", {
        pageMapId: this.pageMap.id,
        availableConfigDML: Object.keys(this.pageMap.configDML || {}),
        availableDmlConfig: Object.keys(this.pageMap.dmlConfig || {}),
      });
    }

    return mappedData;
  }

  // Update your setParentId method with safe logging
  setParentId(parentId, parentIdField = null) {
    if (!parentId) {
      // Safe logging with fallback
      if (this.log && this.log.warn) {
        this.log.warn("Attempted to set empty parent ID");
      } else {
        console.warn("Attempted to set empty parent ID");
      }
      return;
    }

    // Get the parent ID field name from pageMap if not provided
    const fieldName = parentIdField || this.pageMap?.pageConfig?.parentIdField;

    if (!fieldName) {
      // Safe logging with fallback
      if (this.log && this.log.warn) {
        this.log.warn("No parentIdField defined in pageMap");
      } else {
        console.warn("No parentIdField defined in pageMap");
      }
      return;
    }

    // Update both regular field and special field
    runInAction(() => {
      this.formData[fieldName] = parentId;
      this.formData._parentId = parentId; // Special field for DML processing

      // Safe logging with fallback
      if (this.log && this.log.info) {
        this.log.info(`Set parent ID: ${fieldName}=${parentId}`);
      } else {
        console.log(`Set parent ID: ${fieldName}=${parentId}`);
      }
    });

    return this; // For method chaining
  }
}

export default FormStore;
