/**
 * Tests for CrossAppAnalyzer
 */

import { CrossAppAnalyzer } from "../CrossAppAnalyzer.js";
import { IMPACT_TYPES, SEVERITY_LEVELS, APP_NAMES } from "../types.js";

describe("CrossAppAnalyzer", () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new CrossAppAnalyzer({
      monorepoRoot: "/test/monorepo",
    });
  });

  describe("file type detection", () => {
    test("should identify eventType files", () => {
      expect(
        analyzer.isEventTypeFile(
          "packages/shared-imports/src/events/plans/planDetail.js"
        )
      ).toBe(true);
      expect(
        analyzer.isEventTypeFile("apps/wf-client/src/eventTypes/userList.js")
      ).toBe(true);
      expect(
        analyzer.isEventTypeFile("apps/wf-client/src/components/Button.jsx")
      ).toBe(false);
    });

    test("should identify shared utility files", () => {
      expect(
        analyzer.isSharedUtilityFile(
          "packages/shared-imports/src/utils/logger.js"
        )
      ).toBe(true);
      expect(
        analyzer.isSharedUtilityFile(
          "packages/shared-imports/src/events/plans/planDetail.js"
        )
      ).toBe(false);
      expect(
        analyzer.isSharedUtilityFile("apps/wf-client/src/utils/helper.js")
      ).toBe(false);
    });

    test("should identify database schema files", () => {
      expect(
        analyzer.isDatabaseSchemaFile("sql/database/api_wf/tables/plans.sql")
      ).toBe(true);
      expect(
        analyzer.isDatabaseSchemaFile(
          "sql/database/whatsfresh/tables/ingredients.sql"
        )
      ).toBe(true);
      expect(
        analyzer.isDatabaseSchemaFile("apps/wf-client/src/component.jsx")
      ).toBe(false);
    });

    test("should identify auth files", () => {
      expect(
        analyzer.isAuthFile("packages/shared-imports/src/auth/AuthProvider.jsx")
      ).toBe(true);
      expect(
        analyzer.isAuthFile("apps/wf-client/src/components/Auth.jsx")
      ).toBe(true);
      expect(
        analyzer.isAuthFile("apps/wf-client/src/components/Button.jsx")
      ).toBe(false);
    });

    test("should identify config files", () => {
      expect(analyzer.isConfigFile("package.json")).toBe(true);
      expect(analyzer.isConfigFile("turbo.json")).toBe(true);
      expect(analyzer.isConfigFile("docker-compose.yml")).toBe(true);
      expect(analyzer.isConfigFile("src/component.jsx")).toBe(false);
    });
  });

  describe("analyzeEventTypeImpacts", () => {
    test("should analyze plan eventType impacts", async () => {
      const impacts = await analyzer.analyzeEventTypeImpacts(
        "packages/shared-imports/src/events/plans/planDetail.js",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      // Should have server impact
      const serverImpact = impacts.find((i) => i.appName === APP_NAMES.SERVER);
      expect(serverImpact).toBeDefined();
      expect(serverImpact.severity).toBe(SEVERITY_LEVELS.HIGH);
      expect(serverImpact.impactType).toBe(IMPACT_TYPES.DIRECT);

      // Should have plan management impact
      const planMgmtImpact = impacts.find(
        (i) => i.appName === APP_NAMES.PLAN_MANAGEMENT
      );
      expect(planMgmtImpact).toBeDefined();
      expect(planMgmtImpact.severity).toBe(SEVERITY_LEVELS.HIGH);
    });

    test("should analyze general eventType impacts", async () => {
      const impacts = await analyzer.analyzeEventTypeImpacts(
        "packages/shared-imports/src/events/client/userList.js",
        "CREATE"
      );

      expect(impacts.length).toBeGreaterThan(0);

      const serverImpact = impacts.find((i) => i.appName === APP_NAMES.SERVER);
      expect(serverImpact).toBeDefined();
      expect(serverImpact.description).toContain("userList");
      expect(serverImpact.description).toContain("create");
    });
  });

  describe("analyzeSharedUtilityImpacts", () => {
    test("should analyze critical utility impacts", async () => {
      const impacts = await analyzer.analyzeSharedUtilityImpacts(
        "packages/shared-imports/src/utils/logger.js",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      // Should have impacts for all apps
      const appNames = impacts.map((i) => i.appName);
      expect(appNames).toContain(APP_NAMES.CLIENT);
      expect(appNames).toContain(APP_NAMES.SERVER);

      // Should have critical utility impact
      const criticalImpact = impacts.find((i) => i.appName === "all-apps");
      expect(criticalImpact).toBeDefined();
      expect(criticalImpact.severity).toBe(SEVERITY_LEVELS.HIGH);
    });

    test("should analyze regular utility impacts", async () => {
      const impacts = await analyzer.analyzeSharedUtilityImpacts(
        "packages/shared-imports/src/utils/helper.js",
        "DELETE"
      );

      expect(impacts.length).toBeGreaterThan(0);

      const clientImpact = impacts.find((i) => i.appName === APP_NAMES.CLIENT);
      expect(clientImpact).toBeDefined();
      expect(clientImpact.description).toContain("helper");
      expect(clientImpact.description).toContain("delete");
    });
  });

  describe("analyzeDatabaseSchemaImpacts", () => {
    test("should analyze table schema impacts", async () => {
      const impacts = await analyzer.analyzeDatabaseSchemaImpacts(
        "sql/database/api_wf/tables/plans.sql",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      // Should have server impact
      const serverImpact = impacts.find((i) => i.appName === APP_NAMES.SERVER);
      expect(serverImpact).toBeDefined();
      expect(serverImpact.severity).toBe(SEVERITY_LEVELS.HIGH);
      expect(serverImpact.impactType).toBe(IMPACT_TYPES.DIRECT);
      expect(serverImpact.description).toContain("plans");
    });

    test("should handle view schema impacts", async () => {
      const impacts = await analyzer.analyzeDatabaseSchemaImpacts(
        "sql/database/api_wf/views/planList.sql",
        "CREATE"
      );

      expect(impacts.length).toBeGreaterThan(0);

      const serverImpact = impacts.find((i) => i.appName === APP_NAMES.SERVER);
      expect(serverImpact).toBeDefined();
      expect(serverImpact.description).toContain("planList");
    });
  });

  describe("analyzeAuthImpacts", () => {
    test("should analyze authentication impacts", async () => {
      const impacts = await analyzer.analyzeAuthImpacts(
        "packages/shared-imports/src/auth/AuthProvider.jsx",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      // Should affect all client apps
      const clientApps = [
        APP_NAMES.CLIENT,
        APP_NAMES.ADMIN,
        APP_NAMES.PLAN_MANAGEMENT,
      ];
      for (const appName of clientApps) {
        const appImpact = impacts.find((i) => i.appName === appName);
        expect(appImpact).toBeDefined();
        expect(appImpact.severity).toBe(SEVERITY_LEVELS.HIGH);
        expect(appImpact.description).toContain("login flow testing");
      }

      // Should affect server
      const serverImpact = impacts.find((i) => i.appName === APP_NAMES.SERVER);
      expect(serverImpact).toBeDefined();
      expect(serverImpact.description).toContain("middleware");
    });
  });

  describe("analyzeConfigImpacts", () => {
    test("should analyze package.json impacts", async () => {
      const impacts = await analyzer.analyzeConfigImpacts(
        "package.json",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      const impact = impacts[0];
      expect(impact.appName).toBe("all-apps");
      expect(impact.description).toContain("dependency updates");
    });

    test("should analyze turbo.json impacts", async () => {
      const impacts = await analyzer.analyzeConfigImpacts(
        "turbo.json",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      const impact = impacts[0];
      expect(impact.appName).toBe("all-apps");
      expect(impact.description).toContain("build pipeline");
    });

    test("should analyze docker config impacts", async () => {
      const impacts = await analyzer.analyzeConfigImpacts(
        "docker-compose.yml",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      const impact = impacts[0];
      expect(impact.appName).toBe(APP_NAMES.SERVER);
      expect(impact.severity).toBe(SEVERITY_LEVELS.HIGH);
      expect(impact.description).toContain("container rebuild");
    });
  });

  describe("analyzeFileImpacts", () => {
    test("should analyze eventType file impacts", async () => {
      const impacts = await analyzer.analyzeFileImpacts(
        "/test/monorepo/packages/shared-imports/src/events/plans/planDetail.js",
        "MODIFY"
      );

      expect(impacts.length).toBeGreaterThan(0);

      // Should be sorted by severity (high first)
      const severities = impacts.map((i) =>
        analyzer.getSeverityWeight(i.severity)
      );
      for (let i = 1; i < severities.length; i++) {
        expect(severities[i]).toBeLessThanOrEqual(severities[i - 1]);
      }
    });

    test("should analyze shared utility file impacts", async () => {
      const impacts = await analyzer.analyzeFileImpacts(
        "/test/monorepo/packages/shared-imports/src/utils/logger.js",
        "DELETE"
      );

      expect(impacts.length).toBeGreaterThan(0);
      expect(impacts.some((i) => i.severity === SEVERITY_LEVELS.HIGH)).toBe(
        true
      );
    });

    test("should analyze database file impacts", async () => {
      const impacts = await analyzer.analyzeFileImpacts(
        "/test/monorepo/sql/database/api_wf/tables/plans.sql",
        "CREATE"
      );

      expect(impacts.length).toBeGreaterThan(0);
      expect(impacts.some((i) => i.appName === APP_NAMES.SERVER)).toBe(true);
    });

    test("should return empty array for non-impactful files", async () => {
      const impacts = await analyzer.analyzeFileImpacts(
        "/test/monorepo/README.md",
        "MODIFY"
      );

      expect(impacts).toEqual([]);
    });
  });

  describe("groupRelatedChanges", () => {
    test("should group impacts by affected apps", () => {
      const impacts = [
        {
          filePath: "file1.js",
          changeType: "MODIFY",
          affectedApps: [APP_NAMES.CLIENT],
          severity: SEVERITY_LEVELS.MEDIUM,
        },
        {
          filePath: "file2.js",
          changeType: "MODIFY",
          affectedApps: [APP_NAMES.CLIENT],
          severity: SEVERITY_LEVELS.HIGH,
        },
        {
          filePath: "file3.js",
          changeType: "CREATE",
          affectedApps: [APP_NAMES.SERVER],
          severity: SEVERITY_LEVELS.LOW,
        },
      ];

      const batches = analyzer.groupRelatedChanges(impacts);

      expect(batches.length).toBe(2); // CLIENT group and SERVER group

      const clientBatch = batches.find((b) =>
        b.affectedApps.includes(APP_NAMES.CLIENT)
      );
      expect(clientBatch).toBeDefined();
      expect(clientBatch.impacts).toHaveLength(2);
      expect(clientBatch.severity).toBe(SEVERITY_LEVELS.HIGH); // Highest severity wins
    });
  });

  describe("helper methods", () => {
    test("should extract eventType name correctly", () => {
      expect(analyzer.extractEventTypeName("events/plans/planDetail.js")).toBe(
        "planDetail"
      );
      expect(analyzer.extractEventTypeName("events/plans/index.js")).toBe(
        "plans"
      );
      expect(analyzer.extractEventTypeName("userList.js")).toBe("userList");
    });

    test("should extract table name correctly", () => {
      expect(analyzer.extractTableName("tables/plans.sql")).toBe("plans");
      expect(analyzer.extractTableName("views/planList.sql")).toBe("planList");
    });

    test("should identify plan eventTypes", () => {
      expect(analyzer.isPlanEventType("planDetail")).toBe(true);
      expect(analyzer.isPlanEventType("planList")).toBe(true);
      expect(analyzer.isPlanEventType("userList")).toBe(false);
    });

    test("should identify critical utilities", () => {
      expect(analyzer.isCriticalUtility("logger")).toBe(true);
      expect(analyzer.isCriticalUtility("api")).toBe(true);
      expect(analyzer.isCriticalUtility("helper")).toBe(false);
    });

    test("should calculate utility severity correctly", () => {
      expect(analyzer.calculateUtilitySeverity("logger", 5)).toBe(
        SEVERITY_LEVELS.HIGH
      );
      expect(analyzer.calculateUtilitySeverity("helper", 15)).toBe(
        SEVERITY_LEVELS.MEDIUM
      );
      expect(analyzer.calculateUtilitySeverity("helper", 3)).toBe(
        SEVERITY_LEVELS.LOW
      );
    });

    test("should get severity weights correctly", () => {
      expect(analyzer.getSeverityWeight(SEVERITY_LEVELS.HIGH)).toBe(3);
      expect(analyzer.getSeverityWeight(SEVERITY_LEVELS.MEDIUM)).toBe(2);
      expect(analyzer.getSeverityWeight(SEVERITY_LEVELS.LOW)).toBe(1);
    });

    test("should deduplicate impacts", () => {
      const impacts = [
        { appName: "app1", description: "Impact 1" },
        { appName: "app1", description: "Impact 1" }, // Duplicate
        { appName: "app2", description: "Impact 2" },
      ];

      const deduplicated = analyzer.deduplicateImpacts(impacts);
      expect(deduplicated).toHaveLength(2);
    });

    test("should sort impacts by severity", () => {
      const impacts = [
        { severity: SEVERITY_LEVELS.LOW },
        { severity: SEVERITY_LEVELS.HIGH },
        { severity: SEVERITY_LEVELS.MEDIUM },
      ];

      const sorted = analyzer.sortImpactsBySeverity(impacts);
      expect(sorted[0].severity).toBe(SEVERITY_LEVELS.HIGH);
      expect(sorted[1].severity).toBe(SEVERITY_LEVELS.MEDIUM);
      expect(sorted[2].severity).toBe(SEVERITY_LEVELS.LOW);
    });
  });
});
