$ErrorActionPreference = "Stop"

$dates = @(
    "2026-03-16T10:00:00+05:30",
    "2026-03-16T12:35:00+05:30",
    "2026-03-16T15:20:00+05:30",
    "2026-03-17T09:45:00+05:30",
    "2026-03-17T12:10:00+05:30",
    "2026-03-17T14:50:00+05:30",
    "2026-03-18T10:15:00+05:30",
    "2026-03-18T13:00:00+05:30",
    "2026-03-18T15:30:00+05:30",
    "2026-03-19T09:30:00+05:30",
    "2026-03-19T11:45:00+05:30",
    "2026-03-19T14:15:00+05:30",
    "2026-03-20T10:05:00+05:30",
    "2026-03-20T12:40:00+05:30",
    "2026-03-20T15:10:00+05:30",
    "2026-03-21T11:00:00+05:30",
    "2026-03-21T14:25:00+05:30",
    "2026-03-21T17:10:00+05:30"
)

$commits = @(
    "50a5fb975bab72d06ecc9fdcdc793f15332ec465",
    "fca359611b6d40eb82b15535290108f66a834b8c",
    "5b4907677ce930a9da662540e8a307228c64914d",
    "7166b0c8572504252098abbcfbc0a4c0d3e9550d",
    "0739a5c03d9ffb00baa784473abd0c3b698a15f0",
    "07d1ec78995e9552c1ebd19a1a0708f1fc26f3c4",
    "58dccac2161349b86a6dccea9c749a0009ad36cb",
    "2b468fd4dc0f7c1623a5a85f86fa4c76a4b809c0",
    "c7f6d5d4a5cb10c339f1b75b21d9b04e56ddb41f",
    "e7662f07400d8d97f15e24f213f16778616d3eba",
    "01511496bde4cc46561384eb54167f4a82b2367e",
    "3d38ee4c066a1d322f7cde3c59a187f5c3591243",
    "b9c69f4f2efb192d3275331e782fe8e8dedc89ae",
    "3a009037ec54ab28fa69d9edfd91da2b8ebf8fc9",
    "1069eb996ce1b29e458a6a0b6deaa32df552e2d5",
    "be3dd9b66704df4f4a70e9ebfc6ac6b0dd7d6ffa",
    "80e6d2138587484bcf294bde4cf74ef8e5ce719b",
    "2b9d43a439f5f3c099894beeb1a70103abc077f5"
)

# Move to a detached head at the base commit (from exactly 2 weeks ago)
Write-Host "Checking out base commit 751f0504228942c94d46d94d6f351504b3976c78..."
git checkout 751f0504228942c94d46d94d6f351504b3976c78

# Loop through each commit, cherry pick it, and amend its date
for ($i = 0; $i -lt $commits.Length; $i++) {
    $commit = $commits[$i]
    $date = $dates[$i]
    
    Write-Host "Cherry-picking $commit and setting date to $date..."
    git cherry-pick $commit
    
    # Amend the commit locally with the new date
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    
    # Force amend to overwrite committer date safely
    git commit --amend --no-edit --date="$date"
}

# Now we rewrite the 'main' branch pointer to this perfect detached head
Write-Host "Replacing main branch pointer..."
git branch -f main HEAD

# Checkout main branch
git checkout main

# Force push to origin
Write-Host "Force pushing rewritten timeline to origin..."
git push origin main --force

Write-Host "History successfully distributed!"
