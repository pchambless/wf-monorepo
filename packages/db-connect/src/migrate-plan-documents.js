const query = require("../query");
const fs = require("fs");
const path = require("path");

async function migratePlanDocuments() {
  try {
    console.log("Starting plan documents migration...");

    // Plan mapping from file names to database IDs
    const planMapping = {
      "0001": 1, // Registry System Test
      "0002": 2, // Test Auto Increment
      "0003": 3, // Claude Plans Management
      "0004": 4, // Session Persistence Enhancement
      "0005": 5, // System Navigation Fixes
      "0006": 6, // Batch Mapping
      "0007": 7, // ingrListAll for SelIngr
      "0008": 8, // Sidebar Optimization
      "0009": 9, // Comprehensive Theming Rework
      "0010": 10, // Plan Completion Automation
      "0011": 11, // Complete DML Process
      "0012": 12, // React-PDF Worksheet System
      "0013": 13, // Server Log Enhancements
      "0014": 14, // Log Cleanup
      "0015": 15, // Cleanup-Artifacts
      "0016": 16, // User Communication Interface
      "0018": 18, // Database Migration & Event Integration
    };

    // Document directories to scan
    const documentDirs = [
      { dir: "claude-plans/a-pending", status: "draft" },
      { dir: "claude-plans/b-completed", status: "approved" },
      { dir: "claude-plans/c-archived", status: "archived" },
    ];

    let totalInserted = 0;

    // Process each directory
    for (const { dir, status } of documentDirs) {
      const dirPath = path.join(__dirname, "../../../", dir);

      if (!fs.existsSync(dirPath)) {
        console.log(`Directory ${dir} does not exist, skipping...`);
        continue;
      }

      const files = fs.readdirSync(dirPath);
      console.log(`Processing ${files.length} files in ${dir}...`);

      for (const filename of files) {
        // Skip non-markdown files and index files
        if (!filename.endsWith(".md") || filename === "index.md") {
          continue;
        }

        const filePath = path.join(dirPath, filename);
        const relativePath = `${dir}/${filename}`;

        // Extract plan ID from filename
        let planId = null;
        let title = filename.replace(".md", "");
        let author = "claude"; // Default author

        // Try to extract plan ID from various filename patterns
        const planIdMatch = filename.match(/^(?:DONE-)?(\d{4})-/);
        if (planIdMatch) {
          const planIdStr = planIdMatch[1];
          planId = planMapping[planIdStr] || null;

          // Extract title from filename
          title = filename
            .replace(/^(?:DONE-)?(\d{4})-[A-Z]+-/, "")
            .replace(".md", "");
        } else {
          // Handle archived files with different naming patterns
          const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            author = "user"; // Date-based files are usually user-created
          }
        }

        // Read file to get creation date (fallback to file stats)
        let createdAt = new Date();
        try {
          const stats = fs.statSync(filePath);
          createdAt = stats.birthtime || stats.mtime;
        } catch (error) {
          console.warn(`Could not get file stats for ${filename}`);
        }

        // Insert document record
        const sql = `
                    INSERT INTO api_wf.plan_documents 
                    (plan_id, document_type, file_path, title, author, status, created_by, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;

        const result = await query(sql, [
          planId || 0, // Use 0 for unmatched plans
          "plan",
          relativePath,
          title,
          author,
          status,
          "migration",
          createdAt,
        ]);

        console.log(
          `Inserted document: ${title} (ID: ${result.insertId}) -> Plan ${
            planId || "unmatched"
          }`
        );
        totalInserted++;
      }
    }

    console.log(
      `Plan documents migration complete! Inserted ${totalInserted} documents.`
    );

    // Show summary by status
    const summarySQL = `
            SELECT status, COUNT(*) as count 
            FROM api_wf.plan_documents 
            GROUP BY status
        `;
    const summary = await query(summarySQL);
    console.log("Summary by status:", summary);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migratePlanDocuments();
