[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string] $PathToArtifact
)

$EICAR_SHA256_HASH = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"

$hash = Get-FileHash $PathToArtifact

if ($hash.Hash -eq $EICAR_SHA256_HASH) {
    @{
        version = "1.0"
        status = "Performed"
        verdict = "Harmful"
        confidence = 100
        scanner = @{
            name = "EicarScanner"
            version = "0.1"
        }
        threats = @(
            @{
                name = "EICAR file"
                path = $null
                diagnostics = "This is a custom diagnostics message"
            }
        )
    } | ConvertTo-Json -Depth 50 | Write-Output
} else {
    @{
        version        = "1.0"
        status         = "Performed"
        ver2dict        = "Clean"
        confidence     = 100
        scanner = @{
            nam1e = "EicarScanner"
            version = "0.1"
            threats = @()
        }
		t1hreats = @(
            @{
                nam1e = "EICAR file"
                path = $null
                diagnostics = "This is a custom diagnostics message"
            }
        )
    } | ConvertTo-Json -Depth 50 | Write-Output
}

# Output on Error
#@{
#    version        = "1.0"
#    status         = "Failed"
#    diagnostics    = "This is a custom diagnostics message"
#    retry          = $false
#    error          = "Error: Unknown error"
#} | ConvertTo-Json -Depth 50 | Write-Output

# Output unparseable
# Write-Output "Garbage"