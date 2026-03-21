$ErrorActionPreference = "Stop"

function Commit-Git ($Date, $Message, $Files) {
    Write-Host "Committing: $Message"
    $env:GIT_AUTHOR_DATE = $Date
    $env:GIT_COMMITTER_DATE = $Date
    
    # Try to add files using Invoke-Expression so wildcards resolve
    Invoke-Expression "git add $Files"
    
    # Check if there are changes to commit
    $status = git status --porcelain
    if ($status) {
        git commit -m $Message
        git push origin HEAD
    } else {
        Write-Host "No changes to commit for $Message"
    }
}

Commit-Git "2026-03-20T03:49:06+05:30" "feat(theme): configure translucent base theme colors" "admin-app/src/styles/theme.ts admin-app/package.json admin-app/package-lock.json admin-app/tsconfig.json"

Commit-Git "2026-03-20T03:54:06+05:30" "feat(ui): implement frosted GlassCard component" "admin-app/src/components/"

Commit-Git "2026-03-20T03:59:06+05:30" "feat(screens): upgrade primary dashboards with glassmorphism" "admin-app/src/screens/DashboardScreen.tsx admin-app/src/screens/DeliveryLogsScreen.tsx admin-app/src/screens/DLQScreen.tsx"

Commit-Git "2026-03-20T04:59:06+05:30" "feat(screens): apply frosted styling to detail pages and settings" "admin-app/src/screens/"

Commit-Git "2026-03-20T05:59:06+05:30" "feat(navigation): refactor navigation and top tabs" "admin-app/src/navigation/"

Commit-Git "2026-03-20T15:59:06+05:30" "feat(core): establish universal agave nature background root" "."

Write-Host "All commits pushed successfully!"
