# Paths
$repoRoot = "C:\Users\pc790\whatsfresh\Projects\wf-monorepo-new"
$outputCsv = "$repoRoot\docs\wfClientComponentInventory.csv"
$outputJson = "$repoRoot\docs\wfClientComponentInventory.json"
$clientSrc = "$repoRoot\apps\wf-client\src"

# Create CSV header
"Component,Location,Type,JSXCount,HasStatefulLogic,HasUIElements,Exports,FileSizeBytes,DependsOnMUI,UsesInternalPath,ExtractedExportName,SharingPotential,Category" | Out-File $outputCsv -Encoding utf8

# Inventory array for JSON
$inventory = @()

# Scan component files
Get-ChildItem -Path $clientSrc -Recurse -Include "*.js", "*.jsx" | ForEach-Object {
    $content = Get-Content $_ -Raw
    $componentName = $_.BaseName
    $location = $_.FullName.Replace($clientSrc, "").TrimStart("\\")

    # Type detection
    $type = "Unknown"
    if ($content -match "class.*extends\s+Component") { $type = "ClassComponent" }
    elseif ($content -match "function\s+\w+\s*\(" -or $content -match "const\s+\w+\s*=\s*\(") { $type = "FunctionalComponent" }

    # Heuristics
    $jsxCount = [regex]::Matches($content, "<[A-Z][a-zA-Z0-9]*").Count
    $hasState = if ($content -match "use(State|Reducer)|this\.state|observable|\.data") { "Yes" } else { "No" }
    $hasUI = if ($jsxCount -gt 0) { "Yes" } else { "No" }
    $exports = if ($content -match "export\s+(default|const|class|function|var)") { "Yes" } else { "No" }
    $fileSize = (Get-Item $_).Length
    $mui = if ($content -match "@mui|@material|mui/") { "Yes" } else { "No" }
    $internal = if ($content -match "@wf-client") { "Yes" } else { "No" }

    # Exported name (if available)
    $exportMatch = [regex]::Match($content, "export\s+(?:default\s+)?(?:function|class|const)\s+(\w+)")
    $exportedName = if ($exportMatch.Success) { $exportMatch.Groups[1].Value } else { "" }

    # Reuse heuristic
    $share = "Low"
    if ($jsxCount -gt 0 -and $type -eq "FunctionalComponent" -and $hasUI -eq "Yes" -and $mui -eq "Yes") {
        $share = if ($hasState -eq "No") { "High" } else { "Medium" }
    }

    # Suggested category
    $category = "Needs Review"
    if ($location -match "FormField|renderers|fields|Table|Grid|Select") {
        $category = if ($share -eq "High") { "Share-Candidate" } else { "Share-Refactor" }
    }
    elseif ($location -match "page|Page|view|View") {
        $category = "App-Specific"
    }

    # CSV row
    "$componentName,$location,$type,$jsxCount,$hasState,$hasUI,$exports,$fileSize,$mui,$internal,$exportedName,$share,$category" | Out-File $outputCsv -Append -Encoding utf8

    # Add to JSON array
    $inventory += [PSCustomObject]@{
        Component           = $componentName
        Location            = $location
        Type                = $type
        JSXCount            = $jsxCount
        HasStatefulLogic    = $hasState
        HasUIElements       = $hasUI
        Exports             = $exports
        FileSizeBytes       = $fileSize
        DependsOnMUI        = $mui
        UsesInternalPath    = $internal
        ExtractedExportName = $exportedName
        SharingPotential    = $share
        Category            = $category
    }
}

# Write JSON
$inventory | ConvertTo-Json -Depth 3 | Set-Content $outputJson

Write-Host "`n✅ Inventory complete:"
Write-Host "📄 CSV saved to: $outputCsv"
Write-Host "🧾 JSON saved to: $outputJson"